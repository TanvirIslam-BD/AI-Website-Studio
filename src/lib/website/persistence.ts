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
  const pageIds = document.pages.map((page) => page.id);

  await db.$transaction(async (tx) => {
    // Pages that the user deleted in the editor. Sections cascade.
    await tx.page.deleteMany({ where: { projectId, id: { notIn: pageIds.length > 0 ? pageIds : ['__none__'] } } });

    for (const [position, page] of document.pages.entries()) {
      const data = {
        name: page.name,
        slug: page.slug,
        isHome: page.isHome,
        position,
        seoTitle: page.seoTitle ?? null,
        seoDesc: page.seoDesc ?? null,
      };

      await tx.page.upsert({
        where: { id: page.id },
        create: { id: page.id, projectId, ...data },
        update: data,
      });

      const sectionIds = page.sections.map((section) => section.id);
      await tx.section.deleteMany({
        where: { pageId: page.id, id: { notIn: sectionIds.length > 0 ? sectionIds : ['__none__'] } },
      });

      for (const [sectionPosition, section] of page.sections.entries()) {
        const row = sectionToDbRow(section, sectionPosition);
        await tx.section.upsert({
          where: { id: row.id },
          create: { id: row.id, pageId: page.id, type: row.type, position: row.position, hidden: row.hidden, props: row.props as Prisma.InputJsonValue },
          update: { type: row.type, position: row.position, hidden: row.hidden, props: row.props as Prisma.InputJsonValue },
        });
      }
    }

    const { ...theme } = document.theme;
    await tx.theme.upsert({
      where: { projectId },
      create: { projectId, ...theme },
      update: theme,
    });

    // Assets are additive - removing one from the library is a separate action.
    // createdAt is staggered so the library reads back in document order
    // (newest first) instead of relying on ties within one transaction.
    const assetBase = Date.now();
    for (const [index, asset] of document.assets.slice(0, 200).entries()) {
      await tx.asset.upsert({
        where: { id: asset.id },
        create: {
          id: asset.id,
          createdAt: new Date(assetBase - index * 1000),
          projectId,
          url: asset.url,
          provider: asset.provider,
          alt: asset.alt,
          width: asset.width ?? null,
          height: asset.height ?? null,
          meta: (asset.meta ?? undefined) as Prisma.InputJsonValue | undefined,
        },
        update: { alt: asset.alt },
      });
    }

    await tx.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
  });

  return { document, sectionCount: document.pages.reduce((sum, page) => sum + page.sections.length, 0) };
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
