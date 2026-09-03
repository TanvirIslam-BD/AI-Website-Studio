import { z } from 'zod';
import { createId, slugify } from '@/lib/ids';
import { parseSection, sectionSchema, type Section, type SectionType } from './sections';
import { themeSchema, type Theme, DEFAULT_THEME } from './theme';

/**
 * The website document.
 *
 * This is the editable, transport-friendly shape of a project: pages ->
 * sections plus a theme and an asset list. The editor loads one document,
 * mutates it through the operations layer, and saves it back; the renderer,
 * the preview route and the static export all consume the same object.
 */

export const assetSchema = z.object({
  id: z.string(),
  url: z.string(),
  provider: z.enum(['unsplash', 'upload', 'ai', 'url', 'stock']).default('url'),
  alt: z.string().default(''),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  meta: z.record(z.unknown()).nullish(),
});

export type Asset = z.infer<typeof assetSchema>;

export const pageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  /** Empty string is the home page. Never leading/trailing slashes. */
  slug: z.string().max(80).default(''),
  isHome: z.boolean().default(false),
  seoTitle: z.string().max(140).nullish(),
  seoDesc: z.string().max(400).nullish(),
  sections: z.array(sectionSchema).max(40).default([]),
});

export type Page = z.infer<typeof pageSchema>;

export const documentSchema = z.object({
  theme: themeSchema,
  pages: z.array(pageSchema).min(1).max(20),
  assets: z.array(assetSchema).default([]),
});

export type WebsiteDocument = z.infer<typeof documentSchema>;

export function emptyDocument(): WebsiteDocument {
  return {
    theme: { ...DEFAULT_THEME },
    pages: [{ id: createId('pg'), name: 'Home', slug: '', isHome: true, sections: [], seoTitle: null, seoDesc: null }],
    assets: [],
  };
}

// --- invariants ------------------------------------------------------------

/**
 * Repairs a document into a guaranteed-valid state:
 *  - exactly one home page, whose slug is ""
 *  - unique, url-safe page slugs
 *  - unique section ids
 *  - a header first and a footer last where present
 * Called after every mutation, so no operation has to defend these itself.
 */
export function normalizeDocument(input: WebsiteDocument): WebsiteDocument {
  const seenSlugs = new Set<string>();
  const seenSectionIds = new Set<string>();

  const pages = input.pages.map((page, index) => {
    let slug = index === 0 && page.isHome ? '' : slugify(page.slug || page.name, `page-${index + 1}`);
    if (page.isHome && index === 0) slug = '';
    while (slug !== '' && seenSlugs.has(slug)) slug = `${slug}-2`;
    seenSlugs.add(slug);

    const sections = orderStructural(
      page.sections.map((section) => {
        let id = section.id;
        if (!id || seenSectionIds.has(id)) id = createId('sec');
        seenSectionIds.add(id);
        return { ...section, id } as Section;
      }),
    );

    return { ...page, slug, sections };
  });

  // Exactly one home page.
  const homeIndex = pages.findIndex((p) => p.isHome);
  const resolved = pages.map((page, i) => ({
    ...page,
    isHome: i === (homeIndex === -1 ? 0 : homeIndex),
    slug: i === (homeIndex === -1 ? 0 : homeIndex) ? '' : page.slug || slugify(page.name, `page-${i + 1}`),
  }));

  return { ...input, pages: resolved };
}

/** Header always first, footer always last; everything else keeps its order. */
function orderStructural(sections: Section[]): Section[] {
  const headers = sections.filter((s) => s.type === 'header');
  const footers = sections.filter((s) => s.type === 'footer');
  const body = sections.filter((s) => s.type !== 'header' && s.type !== 'footer');
  return [...headers.slice(0, 1), ...body, ...footers.slice(0, 1)];
}

// --- lookups ---------------------------------------------------------------

export function findPage(doc: WebsiteDocument, ref: string): Page | undefined {
  const needle = ref.replace(/^\//, '');
  return (
    doc.pages.find((p) => p.id === ref) ??
    doc.pages.find((p) => p.slug === needle) ??
    (needle === '' || needle === 'home' ? doc.pages.find((p) => p.isHome) : undefined) ??
    doc.pages.find((p) => p.name.toLowerCase() === ref.toLowerCase())
  );
}

export function findSection(doc: WebsiteDocument, sectionId: string): { page: Page; section: Section; index: number } | undefined {
  for (const page of doc.pages) {
    const index = page.sections.findIndex((s) => s.id === sectionId);
    if (index !== -1) return { page, section: page.sections[index], index };
  }
  return undefined;
}

export function homePage(doc: WebsiteDocument): Page {
  return doc.pages.find((p) => p.isHome) ?? doc.pages[0];
}

export function pagePath(page: Page): string {
  return page.slug ? `/${page.slug}` : '/';
}

export function countSections(doc: WebsiteDocument): number {
  return doc.pages.reduce((total, page) => total + page.sections.length, 0);
}

export function sectionTypesUsed(doc: WebsiteDocument): SectionType[] {
  return Array.from(new Set(doc.pages.flatMap((p) => p.sections.map((s) => s.type))));
}

// --- (de)serialisation -----------------------------------------------------

type DbTheme = Partial<Record<keyof Theme, unknown>> | null | undefined;

type DbProject = {
  theme?: DbTheme;
  pages?: Array<{
    id: string;
    name: string;
    slug: string;
    isHome: boolean;
    position?: number;
    seoTitle?: string | null;
    seoDesc?: string | null;
    sections?: Array<{ id: string; type: string; position?: number; props: unknown; hidden?: boolean }>;
  }>;
  assets?: Array<{ id: string; url: string; provider: string; alt?: string | null; width?: number | null; height?: number | null; meta?: unknown }>;
};

/**
 * Builds a document from Prisma rows. Anything that fails validation is
 * dropped rather than thrown, so a schema change can never lock a user out of
 * their own project.
 */
export function documentFromDb(project: DbProject): WebsiteDocument {
  const theme = themeSchema.safeParse(project.theme ?? {});

  const pages = (project.pages ?? [])
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((page) => {
      const sections = (page.sections ?? [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((row) => parseSection({ ...(row.props as object), id: row.id, type: row.type, hidden: row.hidden ?? false }))
        .filter((s): s is Section => s !== null);

      return pageSchema.parse({
        id: page.id,
        name: page.name,
        slug: page.slug,
        isHome: page.isHome,
        seoTitle: page.seoTitle ?? null,
        seoDesc: page.seoDesc ?? null,
        sections,
      });
    });

  const assets = (project.assets ?? [])
    .map((asset) =>
      assetSchema.safeParse({
        id: asset.id,
        url: asset.url,
        provider: asset.provider,
        alt: asset.alt ?? '',
        width: asset.width ?? undefined,
        height: asset.height ?? undefined,
        meta: (asset.meta as Record<string, unknown> | null) ?? null,
      }),
    )
    .flatMap((r) => (r.success ? [r.data] : []));

  const doc: WebsiteDocument = {
    theme: theme.success ? theme.data : { ...DEFAULT_THEME },
    pages: pages.length > 0 ? pages : emptyDocument().pages,
    assets,
  };

  return normalizeDocument(doc);
}

/** Splits a section into the DB column shape: identity out, props stay JSON. */
export function sectionToDbRow(section: Section, position: number) {
  const { id, hidden, type, ...props } = section as Section & Record<string, unknown>;
  return { id, type, position, hidden: hidden ?? false, props: props as object };
}

/** Validates an incoming document from the client before it is persisted. */
export function parseIncomingDocument(input: unknown): WebsiteDocument {
  const result = documentSchema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `Invalid document: ${result.error.issues.slice(0, 5).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`,
    );
  }
  return normalizeDocument(result.data);
}
