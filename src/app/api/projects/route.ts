import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handle, readJson } from '@/lib/api';
import { requireUser, requireWorkspace } from '@/lib/tenancy';
import { generateWebsite } from '@/lib/ai/generate';
import type { GenerationProgress } from '@/lib/ai/progress';
import { MAX_BRIEF_LENGTH } from '@/lib/limits';
import { emptyDocument } from '@/lib/website/document';
import { createProjectWithDocument } from '@/lib/website/persistence';
import { createSection } from '@/lib/website/blueprints';
import { normalizeDocument } from '@/lib/website/document';

export const runtime = 'nodejs';
/** Generation is a single long-running model call; give it room. */
export const maxDuration = 120;

const createSchema = z.object({
  name: z.string().max(80).optional(),
  prompt: z
    .string()
    .max(MAX_BRIEF_LENGTH, `A brief can be at most ${MAX_BRIEF_LENGTH} characters.`)
    .optional(),
  /** blank = scaffold a starter site without calling the model. */
  mode: z.enum(['generate', 'blank']).default('generate'),
});

export const GET = handle(async () => {
  const user = await requireUser();
  const workspace = await requireWorkspace(user.id);

  const projects = await db.project.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      status: true,
      productionUrl: true,
      updatedAt: true,
      createdAt: true,
      _count: { select: { pages: true, deployments: true } },
    },
  });

  return NextResponse.json({ workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan }, projects });
});

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const workspace = await requireWorkspace(user.id);
  const input = createSchema.parse(await readJson(request));

  if (input.mode === 'blank' || !input.prompt?.trim()) {
    const name = input.name?.trim() || 'Untitled website';
    const base = emptyDocument();
    const document = normalizeDocument({
      ...base,
      pages: [
        {
          ...base.pages[0],
          sections: [
            createSection('header', { logoText: name }),
            createSection('hero', { heading: name }),
            createSection('features'),
            createSection('cta'),
            createSection('footer', { logoText: name }),
          ],
        },
      ],
    });

    const project = await createProjectWithDocument({
      workspaceId: workspace.id,
      userId: user.id,
      name,
      document,
      status: 'READY',
    });
    return NextResponse.json({ project: { id: project.id, name: project.name }, source: 'blank' }, { status: 201 });
  }

  /**
   * Streamed when the client asks for it.
   *
   * Generation is a single model call that runs for the best part of a minute.
   * Returning only at the end means a spinner and no idea whether anything is
   * happening; streaming lets the page report each page and section as the
   * model writes it. The work is identical either way - `run` below is shared -
   * so a plain fetch still gets the same JSON it always did.
   */
  const wantsStream = request.headers.get('accept')?.includes('text/event-stream');

  const run = async (onProgress?: (event: GenerationProgress) => void) => {
    const result = await generateWebsite(input.prompt!, { onProgress });

    onProgress?.({ stage: 'saving' });
    const project = await createProjectWithDocument({
      workspaceId: workspace.id,
      userId: user.id,
      name: input.name?.trim() || result.brand,
      description: result.description,
      prompt: input.prompt,
      document: result.document,
      status: 'READY',
    });

    await db.chatMessage.createMany({
      data: [
        { projectId: project.id, role: 'USER', content: input.prompt! },
        {
          projectId: project.id,
          role: 'ASSISTANT',
          content:
            result.source === 'ai'
              ? `I built a ${result.document.pages.length}-page website for ${result.brand}. Select any section to edit it, or tell me what to change.`
              : `I built a ${result.document.pages.length}-page starter website for ${result.brand} from a template${result.warning ? ` (the AI provider returned an error: ${result.warning})` : ''}. Select any section to edit it.`,
        },
      ],
    });

    return { project, result };
  };

  if (!wantsStream) {
    const { project, result } = await run();
    return NextResponse.json(
      { project: { id: project.id, name: project.name }, source: result.source, warning: result.warning ?? null },
      { status: 201 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // One SSE frame: a `data:` line, then a blank line to terminate it.
      const send = (event: GenerationProgress) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      send({ stage: 'starting' });
      try {
        const { project, result } = await run(send);
        send({
          stage: 'done',
          projectId: project.id,
          name: project.name,
          source: result.source,
          warning: result.warning ?? null,
        });
      } catch (error) {
        // The stream has already begun, so a failure is reported inside it
        // rather than as a status code nobody is still waiting for.
        console.error('[projects] generation failed', error);
        send({
          stage: 'error',
          message: error instanceof Error ? error.message : 'Generation failed. Please try again.',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Without this a proxy may buffer the whole response and defeat the point.
      'X-Accel-Buffering': 'no',
    },
  });
});
