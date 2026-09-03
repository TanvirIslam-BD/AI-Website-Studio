import { z } from 'zod';
import { createId, slugify } from '@/lib/ids';
import { createSection } from './blueprints';
import {
  applySectionPatch,
  SECTION_TYPES,
  safeHref,
  safeImageUrl,
  type Section,
  type SectionType,
} from './sections';
import { themePatchSchema } from './theme';
import {
  findPage,
  findSection,
  normalizeDocument,
  pageSchema,
  type Page,
  type WebsiteDocument,
} from './document';

/**
 * The operations layer.
 *
 * Every mutation to a website - whether it comes from a click in the editor or
 * a tool call from the AI - goes through exactly one of these pure functions.
 * That gives us a single validation surface, a single audit trail, and an AI
 * that edits by structured operation instead of rewriting the project.
 *
 * Each operation is `(document, input) -> { document, summary }`. Nothing here
 * touches the database, the network or React.
 */

export type OperationResult = { document: WebsiteDocument; summary: string };

const sectionTypeSchema = z.enum(SECTION_TYPES as [SectionType, ...SectionType[]]);
const pageRef = z.string().min(1).describe('Page id, slug, or name. Use "home" for the home page.');
const propsRecord = z.record(z.unknown());

// --- schemas ---------------------------------------------------------------

export const operationSchemas = {
  create_page: z.object({
    name: z.string().min(1).max(80),
    slug: z.string().max(80).optional(),
    seoTitle: z.string().max(140).optional(),
    seoDesc: z.string().max(400).optional(),
    /** Section types to scaffold the page with, in order. */
    sections: z.array(sectionTypeSchema).max(20).optional(),
  }),
  update_page: z.object({
    page: pageRef,
    name: z.string().min(1).max(80).optional(),
    slug: z.string().max(80).optional(),
    seoTitle: z.string().max(140).optional(),
    seoDesc: z.string().max(400).optional(),
  }),
  delete_page: z.object({ page: pageRef }),
  add_section: z.object({
    page: pageRef,
    type: sectionTypeSchema,
    /** 0-based insert index. Omit to append before the footer. */
    position: z.number().int().min(0).max(40).optional(),
    props: propsRecord.optional(),
  }),
  update_section: z.object({
    sectionId: z.string().min(1),
    /** Partial props. Only the keys you pass are changed. */
    props: propsRecord,
  }),
  update_content: z.object({
    sectionId: z.string().min(1),
    /** Dot path inside the section props, e.g. "items.0.title". */
    path: z.string().min(1).max(120),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
  delete_section: z.object({ sectionId: z.string().min(1) }),
  duplicate_section: z.object({ sectionId: z.string().min(1) }),
  reorder_sections: z.object({
    page: pageRef,
    /** Full list of section ids in the desired order. */
    order: z.array(z.string().min(1)).min(1).max(40),
  }),
  move_section: z.object({
    sectionId: z.string().min(1),
    direction: z.enum(['up', 'down']).optional(),
    toIndex: z.number().int().min(0).max(40).optional(),
  }),
  toggle_section: z.object({ sectionId: z.string().min(1), hidden: z.boolean() }),
  update_theme: themePatchSchema,
  add_asset: z.object({
    url: z.string().min(1).max(2000),
    alt: z.string().max(300).optional(),
    provider: z.enum(['unsplash', 'upload', 'ai', 'url', 'stock']).optional(),
  }),
  set_section_image: z.object({
    sectionId: z.string().min(1),
    /** Dot path to the image object, e.g. "image" or "images.2". */
    path: z.string().min(1).max(120).default('image'),
    url: z.string().min(1).max(2000),
    alt: z.string().max(300).optional(),
  }),
} as const;

export type OperationName = keyof typeof operationSchemas;
export const OPERATION_NAMES = Object.keys(operationSchemas) as OperationName[];

export type OperationInput<T extends OperationName> = z.infer<(typeof operationSchemas)[T]>;

export type Operation = { [K in OperationName]: { name: K; input: OperationInput<K> } }[OperationName];

// --- helpers ---------------------------------------------------------------

function requirePage(doc: WebsiteDocument, ref: string): Page {
  const page = findPage(doc, ref);
  if (!page) throw new OperationError(`No page matching "${ref}". Available: ${doc.pages.map((p) => p.slug || 'home').join(', ')}`);
  return page;
}

function mapPage(doc: WebsiteDocument, pageId: string, fn: (page: Page) => Page): WebsiteDocument {
  return { ...doc, pages: doc.pages.map((p) => (p.id === pageId ? fn(p) : p)) };
}

function mapSection(doc: WebsiteDocument, sectionId: string, fn: (section: Section) => Section): WebsiteDocument {
  const hit = findSection(doc, sectionId);
  if (!hit) throw new OperationError(`No section with id "${sectionId}".`);
  return mapPage(doc, hit.page.id, (page) => ({
    ...page,
    sections: page.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
  }));
}

export class OperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OperationError';
  }
}

/** Immutable deep set for a dot path. Creates nothing that does not exist. */
function setByPath(target: unknown, path: string[], value: unknown): unknown {
  const [head, ...rest] = path;
  if (head === undefined) return value;

  if (Array.isArray(target)) {
    const index = Number(head);
    if (!Number.isInteger(index) || index < 0 || index >= target.length) {
      throw new OperationError(`Index "${head}" is out of range (length ${target.length}).`);
    }
    const next = target.slice();
    next[index] = setByPath(target[index], rest, value);
    return next;
  }

  if (target && typeof target === 'object') {
    const record = target as Record<string, unknown>;
    if (!(head in record) && rest.length > 0) {
      throw new OperationError(`Path segment "${head}" does not exist on this section.`);
    }
    return { ...record, [head]: setByPath(record[head], rest, value) };
  }

  throw new OperationError(`Cannot write "${path.join('.')}" - the parent value is not an object.`);
}

function getByPath(target: unknown, path: string[]): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    if (Array.isArray(acc)) return acc[Number(key)];
    if (typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, target);
}

/** Body index that keeps the footer last and the header first. */
function defaultInsertIndex(page: Page): number {
  const footerIndex = page.sections.findIndex((s) => s.type === 'footer');
  return footerIndex === -1 ? page.sections.length : footerIndex;
}

function clampIndex(page: Page, index: number, type: SectionType): number {
  if (type === 'header') return 0;
  if (type === 'footer') return page.sections.length;
  const min = page.sections[0]?.type === 'header' ? 1 : 0;
  const max = defaultInsertIndex(page);
  return Math.min(Math.max(index, min), max);
}

const label = (section: Section) => `${section.type}`;

// --- implementations -------------------------------------------------------

type Handlers = { [K in OperationName]: (doc: WebsiteDocument, input: OperationInput<K>) => OperationResult };

const handlers: Handlers = {
  create_page: (doc, input) => {
    if (doc.pages.length >= 20) throw new OperationError('A project is limited to 20 pages.');
    const slug = slugify(input.slug || input.name, `page-${doc.pages.length + 1}`);
    if (doc.pages.some((p) => p.slug === slug)) throw new OperationError(`A page with the path "/${slug}" already exists.`);

    // New pages inherit the site chrome so navigation stays consistent.
    const home = doc.pages.find((p) => p.isHome);
    const chrome = (home?.sections ?? []).filter((s) => s.type === 'header' || s.type === 'footer');
    const requested = input.sections ?? ['hero', 'textMedia', 'cta'];
    const body = requested
      .filter((type) => type !== 'header' && type !== 'footer')
      .map((type) => createSection(type, {}, { brand: home?.name ?? 'Brand' }));

    const header = chrome.find((s) => s.type === 'header');
    const footer = chrome.find((s) => s.type === 'footer');
    const sections = [
      ...(header ? [{ ...header, id: createId('sec') }] : []),
      ...body,
      ...(footer ? [{ ...footer, id: createId('sec') }] : []),
    ] as Section[];

    const page = pageSchema.parse({
      id: createId('pg'),
      name: input.name,
      slug,
      isHome: false,
      seoTitle: input.seoTitle ?? null,
      seoDesc: input.seoDesc ?? null,
      sections,
    });

    return {
      document: normalizeDocument({ ...doc, pages: [...doc.pages, page] }),
      summary: `Created page "${input.name}" at /${slug}`,
    };
  },

  update_page: (doc, input) => {
    const page = requirePage(doc, input.page);
    const nextSlug = page.isHome ? '' : input.slug !== undefined ? slugify(input.slug, page.slug || 'page') : page.slug;
    if (nextSlug && doc.pages.some((p) => p.id !== page.id && p.slug === nextSlug)) {
      throw new OperationError(`A page with the path "/${nextSlug}" already exists.`);
    }
    const document = mapPage(doc, page.id, (p) => ({
      ...p,
      name: input.name ?? p.name,
      slug: nextSlug,
      seoTitle: input.seoTitle ?? p.seoTitle,
      seoDesc: input.seoDesc ?? p.seoDesc,
    }));
    return { document: normalizeDocument(document), summary: `Updated page "${input.name ?? page.name}"` };
  },

  delete_page: (doc, input) => {
    const page = requirePage(doc, input.page);
    if (doc.pages.length === 1) throw new OperationError('A project must keep at least one page.');
    if (page.isHome) throw new OperationError('The home page cannot be deleted. Set another page as home first.');
    return {
      document: normalizeDocument({ ...doc, pages: doc.pages.filter((p) => p.id !== page.id) }),
      summary: `Deleted page "${page.name}"`,
    };
  },

  add_section: (doc, input) => {
    const page = requirePage(doc, input.page);
    if (page.sections.length >= 40) throw new OperationError('A page is limited to 40 sections.');
    if ((input.type === 'header' || input.type === 'footer') && page.sections.some((s) => s.type === input.type)) {
      throw new OperationError(`This page already has a ${input.type}. Use update_section to change it.`);
    }
    const section = createSection(input.type, input.props ?? {}, { brand: page.name });
    const index = clampIndex(page, input.position ?? defaultInsertIndex(page), input.type);
    const document = mapPage(doc, page.id, (p) => {
      const sections = p.sections.slice();
      sections.splice(index, 0, section);
      return { ...p, sections };
    });
    return { document: normalizeDocument(document), summary: `Added a ${input.type} section to "${page.name}"` };
  },

  update_section: (doc, input) => {
    const hit = findSection(doc, input.sectionId);
    if (!hit) throw new OperationError(`No section with id "${input.sectionId}".`);
    const document = mapSection(doc, input.sectionId, (section) => applySectionPatch(section, input.props));
    return { document: normalizeDocument(document), summary: `Updated the ${label(hit.section)} section` };
  },

  update_content: (doc, input) => {
    const hit = findSection(doc, input.sectionId);
    if (!hit) throw new OperationError(`No section with id "${input.sectionId}".`);
    const path = input.path.split('.').filter(Boolean);
    if (path.length === 0) throw new OperationError('A content path is required.');
    if (path[0] === 'id' || path[0] === 'type') throw new OperationError('Section id and type are immutable.');

    const leaf = path[path.length - 1];
    let value: unknown = input.value;
    if (typeof value === 'string') {
      if (leaf === 'href') value = safeHref(value);
      else if (leaf === 'url') value = safeImageUrl(value);
    }
    if (path.length > 1 && getByPath(hit.section, path.slice(0, -1)) === undefined) {
      throw new OperationError(`"${input.path}" is not a field on this ${hit.section.type} section.`);
    }

    const patched = setByPath(hit.section, path, value) as Record<string, unknown>;
    const document = mapSection(doc, input.sectionId, () => applySectionPatch(hit.section, patched));
    return { document: normalizeDocument(document), summary: `Edited ${input.path} on the ${label(hit.section)} section` };
  },

  delete_section: (doc, input) => {
    const hit = findSection(doc, input.sectionId);
    if (!hit) throw new OperationError(`No section with id "${input.sectionId}".`);
    const document = mapPage(doc, hit.page.id, (p) => ({ ...p, sections: p.sections.filter((s) => s.id !== input.sectionId) }));
    return { document: normalizeDocument(document), summary: `Deleted the ${label(hit.section)} section` };
  },

  duplicate_section: (doc, input) => {
    const hit = findSection(doc, input.sectionId);
    if (!hit) throw new OperationError(`No section with id "${input.sectionId}".`);
    if (hit.section.type === 'header' || hit.section.type === 'footer') {
      throw new OperationError(`A ${hit.section.type} cannot be duplicated.`);
    }
    const copy = { ...hit.section, id: createId('sec') } as Section;
    const document = mapPage(doc, hit.page.id, (p) => {
      const sections = p.sections.slice();
      sections.splice(hit.index + 1, 0, copy);
      return { ...p, sections };
    });
    return { document: normalizeDocument(document), summary: `Duplicated the ${label(hit.section)} section` };
  },

  reorder_sections: (doc, input) => {
    const page = requirePage(doc, input.page);
    const byId = new Map(page.sections.map((s) => [s.id, s]));
    const ordered = input.order.map((id) => byId.get(id)).filter((s): s is Section => Boolean(s));
    const missing = page.sections.filter((s) => !input.order.includes(s.id));
    const document = mapPage(doc, page.id, (p) => ({ ...p, sections: [...ordered, ...missing] }));
    return { document: normalizeDocument(document), summary: `Reordered sections on "${page.name}"` };
  },

  move_section: (doc, input) => {
    const hit = findSection(doc, input.sectionId);
    if (!hit) throw new OperationError(`No section with id "${input.sectionId}".`);
    const target = input.toIndex !== undefined ? input.toIndex : hit.index + (input.direction === 'up' ? -1 : 1);
    const index = clampIndex(hit.page, target, hit.section.type);
    const document = mapPage(doc, hit.page.id, (p) => {
      const sections = p.sections.slice();
      const [moved] = sections.splice(hit.index, 1);
      sections.splice(Math.min(index, sections.length), 0, moved);
      return { ...p, sections };
    });
    return { document: normalizeDocument(document), summary: `Moved the ${label(hit.section)} section` };
  },

  toggle_section: (doc, input) => {
    const hit = findSection(doc, input.sectionId);
    if (!hit) throw new OperationError(`No section with id "${input.sectionId}".`);
    const document = mapSection(doc, input.sectionId, (s) => ({ ...s, hidden: input.hidden }) as Section);
    return { document, summary: `${input.hidden ? 'Hid' : 'Showed'} the ${label(hit.section)} section` };
  },

  update_theme: (doc, input) => {
    const entries = Object.entries(input).filter(([, v]) => v !== undefined);
    const theme = { ...doc.theme, ...Object.fromEntries(entries) };
    return {
      document: { ...doc, theme },
      summary: entries.length ? `Updated theme (${entries.map(([k]) => k).join(', ')})` : 'Theme unchanged',
    };
  },

  add_asset: (doc, input) => {
    const url = safeImageUrl(input.url);
    if (!url) throw new OperationError('Only absolute http(s) image URLs are accepted.');
    if (doc.assets.some((a) => a.url === url)) {
      return { document: doc, summary: 'Asset already in the library' };
    }
    const asset = { id: createId('ast'), url, alt: input.alt ?? '', provider: input.provider ?? 'url', meta: null } as const;
    return { document: { ...doc, assets: [asset, ...doc.assets].slice(0, 200) }, summary: 'Added an asset' };
  },

  set_section_image: (doc, input) => {
    const hit = findSection(doc, input.sectionId);
    if (!hit) throw new OperationError(`No section with id "${input.sectionId}".`);
    const url = safeImageUrl(input.url);
    if (!url) throw new OperationError('Only absolute http(s) image URLs are accepted.');

    const path = input.path.split('.').filter(Boolean);
    const current = getByPath(hit.section, path);
    const nextImage = {
      ...(current && typeof current === 'object' ? (current as Record<string, unknown>) : {}),
      url,
      alt: input.alt ?? (current as { alt?: string } | undefined)?.alt ?? '',
    };
    const patched = setByPath(hit.section, path, nextImage) as Record<string, unknown>;
    const document = mapSection(doc, input.sectionId, () => applySectionPatch(hit.section, patched));
    const withAsset = handlers.add_asset(document, { url, alt: input.alt, provider: 'url' });
    return { document: withAsset.document, summary: `Replaced an image on the ${label(hit.section)} section` };
  },
};

// --- dispatch --------------------------------------------------------------

export function isOperationName(value: unknown): value is OperationName {
  return typeof value === 'string' && (OPERATION_NAMES as string[]).includes(value);
}

/**
 * Validates and runs a single operation. Throws `OperationError` with a
 * human-readable message, which is fed back to the model so it can retry with
 * corrected arguments.
 */
export function applyOperation(doc: WebsiteDocument, name: OperationName, rawInput: unknown): OperationResult {
  const schema = operationSchemas[name];
  const parsed = schema.safeParse(rawInput ?? {});
  if (!parsed.success) {
    throw new OperationError(
      `${name} received invalid arguments: ${parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'} ${i.message}`)
        .join('; ')}`,
    );
  }
  const handler = handlers[name] as (d: WebsiteDocument, i: unknown) => OperationResult;
  return handler(doc, parsed.data);
}

export type AppliedOperation = { name: OperationName; input: unknown; ok: boolean; summary: string };

/**
 * Runs a batch of operations in order. A failing operation does not abort the
 * batch: the document keeps the successful changes and the failure is reported,
 * which matches how the copilot streams several small edits at once.
 */
export function applyOperations(
  doc: WebsiteDocument,
  operations: Array<{ name: string; input?: unknown }>,
): { document: WebsiteDocument; applied: AppliedOperation[] } {
  let document = doc;
  const applied: AppliedOperation[] = [];

  for (const op of operations) {
    if (!isOperationName(op.name)) {
      applied.push({ name: op.name as OperationName, input: op.input, ok: false, summary: `Unknown operation "${op.name}"` });
      continue;
    }
    try {
      const result = applyOperation(document, op.name, op.input);
      document = result.document;
      applied.push({ name: op.name, input: op.input, ok: true, summary: result.summary });
    } catch (error) {
      applied.push({
        name: op.name,
        input: op.input,
        ok: false,
        summary: error instanceof Error ? error.message : 'Operation failed',
      });
    }
  }

  return { document, applied };
}

export { handlers as operationHandlers };
