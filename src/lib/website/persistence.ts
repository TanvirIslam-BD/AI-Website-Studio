import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { createId, slugify } from '@/lib/ids';
import { documentFromDb, sectionToDbRow, type WebsiteDocument } from './document';
import { DEFAULT_THEME } from './theme';

/**
 * Document <-> database.
 *
 * The editor works on one whole document and saves it as a unit, so a save is
 * a single transaction that reconciles pages, sections, the theme and assets.
 * Ids are generated client-side, which is what makes this a reconcile rather
 * than a blind replace: unchanged rows keep their identity (and their
 * created-at ordering) across saves.
 */

export type SaveResult = { document: WebsiteDocument; sectionCount: number };

export async function saveDocument(projectId: string, document: WebsiteDocument): Promise<SaveResult> {
  const pages = document.pages.map((page, position) => ({
    id: page.id,
    projectId,
    name: page.name,
    slug: page.slug,
    isHome: page.isHome,
    position,
    seoTitle: page.seoTitle ?? null,
    seoDesc: page.seoDesc ?? null,
  }));

  const sections = document.pages.flatMap((page) =>
    page.sections.map((section, position) => {
      const row = sectionToDbRow(section, position);
      return {
        id: row.id,
        pageId: page.id,
        type: row.type,
        position: row.position,
        hidden: row.hidden,
        props: row.props as Prisma.InputJsonValue,
      };
    }),
  );

  // Assets are additive: removing one from the library is a separate action.
  // Reading the existing ids up front lets the write be a plain createMany,
  // rather than one upsert per asset. createdAt is staggered so the library
  // reads back in document order instead of relying on ties.
  const existing = await db.asset.findMany({ where: { projectId }, select: { id: true } });
  const known = new Set(existing.map((asset) => asset.id));
  const assetBase = Date.now();
  const newAssets = document.assets
    .slice(0, 200)
    .filter((asset) => !known.has(asset.id))
    .map((asset, index) => ({
      id: asset.id,
      createdAt: new Date(assetBase - index * 1000),
      projectId,
      url: asset.url,
      provider: asset.provider,
      alt: asset.alt,
      width: asset.width ?? null,
      height: asset.height ?? null,
      meta: (asset.meta ?? undefined) as Prisma.InputJsonValue | undefined,
    }));

  const { ...theme } = document.theme;

  /**
   * One batch, not a statement per row.
   *
   * Turso is reached over HTTP, so every statement in an interactive
   * transaction is a separate round trip. The previous version issued roughly
   * one per section - about 43 for a four-page site - which measured 4.7s from
   * a local machine to ap-south-1 and reliably exceeded Prisma's 5s
   * interactive-transaction timeout from a Vercel function in another region.
   * The visible symptom was a project that saved its name but had zero pages.
   *
   * Pages and sections are replaced wholesale rather than diffed: ids come from
   * the document, so identity survives, and `position` carries the ordering -
   * nothing depends on their createdAt. Deleting the pages cascades to their
   * sections, and statements in a batch run in order, so the pages exist again
   * before the sections that reference them are inserted.
   */
  await db.$transaction([
    db.page.deleteMany({ where: { projectId } }),
    db.page.createMany({ data: pages }),
    db.section.createMany({ data: sections }),
    db.theme.upsert({ where: { projectId }, create: { projectId, ...theme }, update: theme }),
    ...(newAssets.length > 0 ? [db.asset.createMany({ data: newAssets })] : []),
    db.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } }),
  ]);

  return { document, sectionCount: sections.length };
}

export async function loadDocument(projectId: string): Promise<WebsiteDocument> {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      theme: true,
      assets: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] },
      pages: { orderBy: { position: 'asc' }, include: { sections: { orderBy: { position: 'asc' } } } },
    },
  });
  return documentFromDb(project);
}

/** Snapshot written before every AI mutation so a change can be rolled back. */
export async function writeRevision(projectId: string, label: string, document: WebsiteDocument) {
  await db.revision.create({
    data: { projectId, label, snapshot: document as unknown as Prisma.InputJsonValue },
  });

  // Keep history bounded - the editor's undo stack covers fine-grained steps.
  const stale = await db.revision.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    skip: 20,
    select: { id: true },
  });
  if (stale.length > 0) {
    await db.revision.deleteMany({ where: { id: { in: stale.map((r) => r.id) } } });
  }
}

/** Unique-per-workspace slug, used for URLs and the Vercel project name. */
export async function uniqueProjectSlug(workspaceId: string, name: string): Promise<string> {
  const base = slugify(name, 'site');
  let slug = base;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const taken = await db.project.findFirst({ where: { workspaceId, slug }, select: { id: true } });
    if (!taken) return slug;
    slug = `${base}-${createId().slice(0, 4)}`;
  }
  return `${base}-${createId().slice(0, 6)}`;
}

export async function createProjectWithDocument(input: {
  workspaceId: string;
  userId: string;
  name: string;
  description?: string | null;
  prompt?: string | null;
  document: WebsiteDocument;
  status?: 'DRAFT' | 'READY';
}) {
  const slug = await uniqueProjectSlug(input.workspaceId, input.name);

  const project = await db.project.create({
    data: {
      workspaceId: input.workspaceId,
      createdById: input.userId,
      name: input.name,
      slug,
      description: input.description ?? null,
      prompt: input.prompt ?? null,
      status: input.status ?? 'READY',
      theme: { create: { ...DEFAULT_THEME } },
    },
  });

  await saveDocument(project.id, input.document);
  return project;
}
