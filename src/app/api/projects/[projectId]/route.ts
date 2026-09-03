import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handle, readJson } from '@/lib/api';
import { requireProject, requireProjectRef, requireUser } from '@/lib/tenancy';
import { documentFromDb, parseIncomingDocument } from '@/lib/website/document';
import { saveDocument } from '@/lib/website/persistence';
import { latestDeployment } from '@/lib/deploy/service';

export const runtime = 'nodejs';

type Params = { params: Promise<{ projectId: string }> };

export const GET = handle(async (_request: Request, { params }: Params) => {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await requireProject(projectId, user.id);

  const [messages, deployment] = await Promise.all([
    db.chatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      take: 60,
      select: { id: true, role: true, content: true, operations: true, createdAt: true },
    }),
    latestDeployment(projectId),
  ]);

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      prompt: project.prompt,
      status: project.status,
      productionUrl: project.productionUrl,
      updatedAt: project.updatedAt,
    },
    document: documentFromDb(project),
    messages,
    deployment,
  });
});

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(400).nullish(),
  document: z.unknown().optional(),
});

export const PATCH = handle(async (request: Request, { params }: Params) => {
  const { projectId } = await params;
  const user = await requireUser();
  await requireProjectRef(projectId, user.id);
  const input = patchSchema.parse(await readJson(request));

  if (input.name !== undefined || input.description !== undefined) {
    await db.project.update({
      where: { id: projectId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
    });
  }

  if (input.document !== undefined) {
    const document = parseIncomingDocument(input.document);
    await saveDocument(projectId, document);
    return NextResponse.json({ ok: true, document });
  }

  return NextResponse.json({ ok: true });
});

export const DELETE = handle(async (_request: Request, { params }: Params) => {
  const { projectId } = await params;
  const user = await requireUser();
  await requireProjectRef(projectId, user.id);
  await db.project.delete({ where: { id: projectId } });
  return NextResponse.json({ ok: true });
});
