import { createAnthropicProvider } from './providers/anthropic';
import { createOpenAiProvider } from './providers/openai';
import type { LlmProvider, ProviderId } from './types';

/**
 * Provider registry.
 *
 * Resolution order: an explicit AI_PROVIDER wins, otherwise the first provider
 * with a key configured. When nothing is configured the app runs in template
 * mode - generation and copilot edits fall back to deterministic local logic -
 * so the whole product, including deployment, works with zero AI credentials.
 *
 * CometAPI is an OpenAI-compatible gateway: one key fronts many upstream
 * models (Claude, GPT, Gemini, ...), so it reuses the OpenAI transport with a
 * different base URL rather than needing its own client.
 */

const DEFAULTS: Record<ProviderId, { model: string; baseURL?: string; label: string }> = {
  anthropic: { model: 'claude-sonnet-5', label: 'Claude' },
  openai: { model: 'gpt-4o', label: 'OpenAI' },
  comet: { model: 'gpt-4o', baseURL: 'https://api.cometapi.com/v1', label: 'CometAPI' },
};

/** Preference order when AI_PROVIDER is not set. */
const FALLBACK_ORDER: ProviderId[] = ['comet', 'anthropic', 'openai'];

let cached: LlmProvider | null | undefined;

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function create(id: ProviderId): LlmProvider | null {
  const defaults = DEFAULTS[id];

  if (id === 'anthropic') {
    const key = env('ANTHROPIC_API_KEY');
    return key ? createAnthropicProvider(key, env('ANTHROPIC_MODEL') ?? defaults.model) : null;
  }

  if (id === 'openai') {
    const key = env('OPENAI_API_KEY');
    return key
      ? createOpenAiProvider(key, env('OPENAI_MODEL') ?? defaults.model, {
          baseURL: env('OPENAI_BASE_URL'),
          id: 'openai',
          label: defaults.label,
        })
      : null;
  }

  const key = env('COMETAPI_API_KEY');
  return key
    ? createOpenAiProvider(key, env('COMETAPI_MODEL') ?? defaults.model, {
        baseURL: env('COMETAPI_BASE_URL') ?? defaults.baseURL,
        id: 'comet',
        label: defaults.label,
      })
    : null;
}

function isProviderId(value: string): value is ProviderId {
  return value === 'anthropic' || value === 'openai' || value === 'comet';
}

function build(): LlmProvider | null {
  const requested = (env('AI_PROVIDER') ?? '').toLowerCase();

  if (requested === 'mock' || requested === 'template' || requested === 'none') return null;

  // An explicit choice is honoured exactly: if its key is missing we fall back
  // to templates rather than silently using a different provider's credits.
  const normalized = requested === 'cometapi' ? 'comet' : requested;
  if (normalized && isProviderId(normalized)) return create(normalized);

  for (const id of FALLBACK_ORDER) {
    const provider = create(id);
    if (provider) return provider;
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
  label: string;
  model: string;
};

export function aiStatus(): AiStatus {
  const provider = getProvider();
  if (!provider) {
    return { configured: false, provider: 'template', label: 'Templates', model: 'built-in templates' };
  }
  return { configured: true, provider: provider.id, label: provider.label, model: provider.model };
}

export * from './types';
