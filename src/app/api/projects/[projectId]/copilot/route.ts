import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handle, readJson } from '@/lib/api';
import { requireProjectRef, requireUser } from '@/lib/tenancy';
import { runCopilot } from '@/lib/ai/agent';
import { parseIncomingDocument } from '@/lib/website/document';
import { saveDocument, writeRevision } from '@/lib/website/persistence';
import type { LlmMessage } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  instruction: z.string().min(1).max(2000),
  /** The client sends its in-memory document so unsaved edits are respected. */
  document: z.unknown(),
  selectedSectionId: z.string().max(80).optional(),
  activePageId: z.string().max(80).optional(),
});

const HISTORY_TURNS = 8;

/**
 * The copilot endpoint.
 *
 * The model proposes operations; this route validates and applies them through
 * the operations layer, snapshots the previous document, persists the result
 * and records the transcript. The client receives the new document and swaps
 * it into the editor, so undo/redo keeps working across AI edits.
 */
export const POST = handle(async (request: Request, { params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = await params;
  const user = await requireUser();
  await requireProjectRef(projectId, user.id);

  const input = schema.parse(await readJson(request));
  const document = parseIncomingDocument(input.document);

  const priorRows = await db.chatMessage.findMany({
    where: { projectId, role: { in: ['USER', 'ASSISTANT'] } },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_TURNS,
    select: { role: true, content: true },
  });

  const history: LlmMessage[] = priorRows
    .reverse()
    .map((row) => ({ role: row.role === 'USER' ? ('user' as const) : ('assistant' as const), content: row.content }));

  const result = await runCopilot({
    document,
    instruction: input.instruction,
    history,
    selectedSectionId: input.selectedSectionId,
    activePageId: input.activePageId,
  });

  const changed = result.applied.some((op) => op.ok);
  if (changed) {
    await writeRevision(projectId, `Before: ${input.instruction.slice(0, 60)}`, document);
    await saveDocument(projectId, result.document);
  }

  const [, assistantMessage] = await db.$transaction([
    db.chatMessage.create({ data: { projectId, role: 'USER', content: input.instruction } }),
    db.chatMessage.create({
      data: {
        projectId,
        role: 'ASSISTANT',
        content: result.message,
        operations: result.applied as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);

  return NextResponse.json({
    message: assistantMessage.content,
    messageId: assistantMessage.id,
    document: result.document,
    applied: result.applied,
    changed,
    source: result.source,
  });
});
