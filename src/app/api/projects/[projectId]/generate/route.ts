import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handle, readJson } from '@/lib/api';
import { requireProjectRef, requireUser } from '@/lib/tenancy';
import { generateWebsite } from '@/lib/ai/generate';
import { MAX_BRIEF_LENGTH } from '@/lib/limits';
import { recordUsage, requireAllowance } from '@/lib/billing/entitlements';
import { loadDocument, saveDocument, writeRevision } from '@/lib/website/persistence';

export const runtime = 'nodejs';
export const maxDuration = 120;

const schema = z.object({
  prompt: z
    .string()
    .min(4)
    .max(MAX_BRIEF_LENGTH, `A brief can be at most ${MAX_BRIEF_LENGTH} characters.`),
});

/**
 * Regenerates the whole website from a new brief. Distinct from the copilot on
 * purpose: this replaces the document, so the previous version is snapshotted
 * to a Revision first.
 */
export const POST = handle(async (request: Request, { params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await requireProjectRef(projectId, user.id);
  const entitlements = await requireAllowance(project.workspaceId, 'regenerate');
  const { prompt } = schema.parse(await readJson(request));

  await db.project.update({ where: { id: projectId }, data: { status: 'GENERATING' } });

  try {
    const previous = await loadDocument(projectId);
    await writeRevision(projectId, 'Before regeneration', previous);

    const result = await generateWebsite(prompt);
    await saveDocument(projectId, result.document);
    await db.project.update({
      where: { id: projectId },
      data: { status: 'READY', prompt, description: result.description },
    });

    await db.chatMessage.createMany({
      data: [
        { projectId, role: 'USER', content: `Regenerate the site: ${prompt}` },
        { projectId, role: 'ASSISTANT', content: `Rebuilt the website from your new brief (${result.document.pages.length} pages).` },
      ],
    });

    await recordUsage({
      workspaceId: project.workspaceId,
      plan: entitlements.plan,
      kind: 'regenerate',
      userId: user.id,
      projectId,
    });

    return NextResponse.json({ document: result.document, source: result.source, warning: result.warning ?? null });
  } catch (error) {
    await db.project.update({ where: { id: projectId }, data: { status: 'ERROR' } });
    throw error;
  }
});
