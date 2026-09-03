import { createAnthropicProvider } from './providers/anthropic';
import { createOpenAiProvider } from './providers/openai';
import type { LlmProvider } from './types';

/**
 * Provider registry.
 *
 * Resolution order: explicit AI_PROVIDER, then whichever key is present. When
 * no key is configured the app runs in "template" mode - generation and
 * copilot edits fall back to deterministic local logic, so the whole product
 * (including deployment) is usable with zero AI credentials.
 */

export type ProviderId = 'anthropic' | 'openai';

const DEFAULT_MODELS: Record<ProviderId, string> = {
  anthropic: 'claude-sonnet-5',
  openai: 'gpt-4o',
};

let cached: LlmProvider | null | undefined;

function build(): LlmProvider | null {
  const requested = (process.env.AI_PROVIDER ?? '').toLowerCase();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (requested === 'mock' || requested === 'template' || requested === 'none') return null;

  const order: ProviderId[] =
    requested === 'openai' ? ['openai', 'anthropic'] : requested === 'anthropic' ? ['anthropic', 'openai'] : ['anthropic', 'openai'];

  for (const id of order) {
    if (id === 'anthropic' && anthropicKey) {
      return createAnthropicProvider(anthropicKey, process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODELS.anthropic);
    }
    if (id === 'openai' && openaiKey) {
      return createOpenAiProvider(openaiKey, process.env.OPENAI_MODEL?.trim() || DEFAULT_MODELS.openai);
    }
  }

  return null;
}

export function getProvider(): LlmProvider | null {
  if (cached === undefined) cached = build();
  return cached;
}

/** For tests and hot-reload: forget the memoised provider. */
export function resetProvider(): void {
  cached = undefined;
}

export type AiStatus = {
  configured: boolean;
  provider: ProviderId | 'template';
  model: string;
};

export function aiStatus(): AiStatus {
  const provider = getProvider();
  if (!provider) return { configured: false, provider: 'template', model: 'built-in templates' };
  return { configured: true, provider: provider.id, model: provider.model };
}

export * from './types';
