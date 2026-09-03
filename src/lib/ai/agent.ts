import { z } from 'zod';
import { applyOperations, type AppliedOperation } from '@/lib/website/operations';
import type { WebsiteDocument } from '@/lib/website/document';
import { getProvider } from './index';
import { extractJsonObject } from './json';
import { heuristicCopilot } from './heuristics';
import { copilotSystemPrompt, documentContext } from './prompts';
import { toolsFor } from './tools';
import type { LlmMessage } from './types';

/**
 * The copilot agent.
 *
 * The model never touches the document. It proposes operations; the server
 * validates and applies them through the operations layer. If a call is
 * rejected, the precise error is handed back and the model gets one chance to
 * correct itself - a bounded loop, not an open-ended one.
 */

const MAX_OPERATIONS = 12;
const MAX_CORRECTION_ROUNDS = 1;

const responseSchema = z.object({
  message: z.string().max(1200).default(''),
  operations: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        input: z.record(z.unknown()).default({}),
      }),
    )
    .max(MAX_OPERATIONS)
    .default([]),
});

export type CopilotRequest = {
  document: WebsiteDocument;
  instruction: string;
  /** Prior turns, oldest first. Trimmed by the caller. */
  history?: LlmMessage[];
  selectedSectionId?: string;
  activePageId?: string;
};

export type CopilotResult = {
  document: WebsiteDocument;
  message: string;
  applied: AppliedOperation[];
  source: 'ai' | 'offline';
  usage?: { inputTokens?: number; outputTokens?: number };
};

export async function runCopilot(request: CopilotRequest): Promise<CopilotResult> {
  const provider = getProvider();

  if (!provider) {
    const heuristic = heuristicCopilot(request.instruction, request.document, request.selectedSectionId);
    const { document, applied } = applyOperations(request.document, heuristic.operations);
    return { document, message: heuristic.message, applied, source: 'offline' };
  }

  const system = copilotSystemPrompt(toolsFor(['document']));
  const messages: LlmMessage[] = [
    ...(request.history ?? []),
    {
      role: 'user',
      content: `${documentContext(request.document, request.selectedSectionId, request.activePageId)}

${request.selectedSectionId ? `The user has section ${request.selectedSectionId} selected.` : 'No section is selected.'}

User request: ${request.instruction}`,
    },
  ];

  let document = request.document;
  let message = '';
  const allApplied: AppliedOperation[] = [];
  let usage: CopilotResult['usage'];

  for (let round = 0; round <= MAX_CORRECTION_ROUNDS; round += 1) {
    const response = await provider.complete({ system, messages, maxTokens: 6000, temperature: 0.4, json: true });
    usage = response.usage;

    const parsed = responseSchema.safeParse(extractJsonObject(response.text));
    if (!parsed.success) {
      throw new Error('The copilot returned a response I could not read. Please try rephrasing.');
    }

    message = parsed.data.message || message;
    const result = applyOperations(document, parsed.data.operations);
    document = result.document;
    allApplied.push(...result.applied);

    const failures = result.applied.filter((op) => !op.ok);
    const noneWorked = result.applied.length > 0 && failures.length === result.applied.length;

    // Only re-prompt when nothing landed; a partial success is reported as-is.
    if (!noneWorked || round === MAX_CORRECTION_ROUNDS) break;

    messages.push(
      { role: 'assistant', content: JSON.stringify(parsed.data) },
      {
        role: 'user',
        content: `None of those operations could be applied:
${failures.map((f) => `- ${f.name}: ${f.summary}`).join('\n')}

Correct the arguments and return the same JSON shape. Use section ids exactly as they appear in the document above.`,
      },
    );
  }

  const succeeded = allApplied.filter((op) => op.ok);
  const failed = allApplied.filter((op) => !op.ok);

  if (!message) {
    message = succeeded.length > 0 ? succeeded.map((op) => op.summary).join('. ') : 'I could not apply that change.';
  }
  if (failed.length > 0 && succeeded.length > 0) {
    message += ` (${failed.length} change${failed.length === 1 ? '' : 's'} could not be applied.)`;
  } else if (failed.length > 0 && succeeded.length === 0) {
    message = `I could not apply that: ${failed[0].summary}`;
  }

  return { document, message, applied: allApplied, source: 'ai', usage };
}

/** Preset instructions surfaced as one-click actions on a selected section. */
export const SECTION_QUICK_ACTIONS = [
  { label: 'Make it more premium', instruction: 'Make this section feel more premium and high-end.' },
  { label: 'Rewrite the copy', instruction: 'Rewrite the copy in this section so it is sharper and more specific.' },
  { label: 'Change the layout', instruction: 'Change the layout of this section to a different variant that suits the content.' },
  { label: 'Conversion focused', instruction: 'Make this section more conversion focused with a stronger call to action.' },
  { label: 'Shorten the text', instruction: 'Shorten the copy in this section - keep the meaning, cut the words.' },
  { label: 'Make it bolder', instruction: 'Make this section bolder and more visually striking.' },
] as const;

export const THEME_QUICK_ACTIONS = [
  { label: 'Use a darker design', instruction: 'Switch the whole site to a darker design.' },
  { label: 'More premium brand', instruction: 'Make the whole brand kit feel more premium and editorial.' },
  { label: 'Friendlier and rounder', instruction: 'Make the site feel friendlier - rounder corners and a warmer palette.' },
  { label: 'Tighten the spacing', instruction: 'Tighten the spacing across the site so pages feel more compact.' },
] as const;
