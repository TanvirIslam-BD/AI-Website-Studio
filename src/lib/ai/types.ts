/**
 * LLM provider abstraction.
 *
 * The rest of the application only ever sees this interface, so adding a
 * provider is a single file plus one line in the registry. Providers are
 * deliberately thin: they turn a system prompt plus a message list into text
 * (optionally JSON-constrained) and report token usage. All prompt
 * construction, tool definition, validation and retry logic lives above them.
 */

/**
 * Registered providers. `comet` is CometAPI, an OpenAI-compatible gateway that
 * fronts many upstream models behind one key, so it reuses the OpenAI
 * transport with a different base URL.
 */
export type ProviderId = 'anthropic' | 'openai' | 'comet';

export type LlmRole = 'user' | 'assistant';

export type LlmMessage = {
  role: LlmRole;
  content: string;
};

export type LlmRequest = {
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Ask the provider to constrain output to a single JSON object. */
  json?: boolean;
};

export type LlmUsage = {
  inputTokens?: number;
  outputTokens?: number;
};

export type LlmResponse = {
  text: string;
  usage?: LlmUsage;
  model: string;
};

export interface LlmProvider {
  readonly id: ProviderId;
  /** Human-readable name for the UI (e.g. "CometAPI"). */
  readonly label: string;
  readonly model: string;
  complete(request: LlmRequest): Promise<LlmResponse>;
  /**
   * The same request, yielding text as the model writes it.
   *
   * Optional: a provider without it still works, callers just wait for the
   * whole response. Generation uses it to report what is being built while it
   * is being built, rather than showing a spinner for forty seconds.
   */
  stream?(request: LlmRequest): AsyncIterable<string>;
}

export class LlmError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'LlmError';
  }
}
