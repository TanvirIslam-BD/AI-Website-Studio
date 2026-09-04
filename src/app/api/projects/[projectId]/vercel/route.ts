import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handle, readJson } from '@/lib/api';
import { requireProjectRef, requireUser } from '@/lib/tenancy';
import { vercelProjectName } from '@/lib/deploy/vercel';

export const runtime = 'nodejs';

type Params = { params: Promise<{ projectId: string }> };

/**
 * Which Vercel project a site publishes into.
 *
 * Null is the default and means "create one on first deploy", named from the
 * slug. Setting it maps the site onto a project that already exists in the
 * connected account, so a site can replace what is already served at a domain
 * instead of landing beside it under a new name.
 */
const linkSchema = z.object({
  /** Both null clears the link and restores the generated name. */
  vercelProjectId: z.string().min(1).max(120).nullable(),
  vercelProjectName: z.string().min(1).max(100).nullable(),
});

export const GET = handle(async (_request: Request, { params }: Params) => {
  const { projectId } = await params;
  const user = await requireUser();
  await requireProjectRef(projectId, user.id);

  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { id: true, name: true, slug: true, vercelProjectId: true, vercelProjectName: true },
  });

  return NextResponse.json({
    vercelProjectId: project.vercelProjectId,
    vercelProjectName: project.vercelProjectName,
    /** What a first deploy would create if nothing is linked. */
    defaultName: vercelProjectName(project.slug, project.id),
  });
});

export const PUT = handle(async (request: Request, { params }: Params) => {
  const { projectId } = await params;
  const user = await requireUser();
  await requireProjectRef(projectId, user.id);

  const input = linkSchema.parse(await readJson(request));
  // Half a link would deploy somewhere nobody chose, so the pair moves together.
  if (Boolean(input.vercelProjectId) !== Boolean(input.vercelProjectName)) {
    throw new Error('A Vercel project link needs both an id and a name, or neither.');
  }

  const project = await db.project.update({
    where: { id: projectId },
    data: { vercelProjectId: input.vercelProjectId, vercelProjectName: input.vercelProjectName },
    select: { id: true, slug: true, vercelProjectId: true, vercelProjectName: true },
  });

  return NextResponse.json({
    vercelProjectId: project.vercelProjectId,
    vercelProjectName: project.vercelProjectName,
    defaultName: vercelProjectName(project.slug, project.id),
  });
});
