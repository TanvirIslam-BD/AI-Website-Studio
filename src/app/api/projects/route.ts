import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handle, readJson } from '@/lib/api';
import { requireUser, requireWorkspace } from '@/lib/tenancy';
import { generateWebsite } from '@/lib/ai/generate';
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

  const result = await generateWebsite(input.prompt);
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
      { projectId: project.id, role: 'USER', content: input.prompt },
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

  return NextResponse.json(
    { project: { id: project.id, name: project.name }, source: result.source, warning: result.warning ?? null },
    { status: 201 },
  );
});
