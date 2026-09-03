import Anthropic from '@anthropic-ai/sdk';
import { LlmError, type LlmProvider, type LlmRequest, type LlmResponse } from '../types';

/**
 * Claude provider. JSON mode is implemented by prefilling the assistant turn
 * with "{", which is the reliable way to constrain Claude to a single object
 * without giving up the tool-free simplicity of the transport.
 */
export function createAnthropicProvider(apiKey: string, model: string): LlmProvider {
  const client = new Anthropic({ apiKey });

  return {
    id: 'anthropic',
    label: 'Claude',
    model,
    async complete(request: LlmRequest): Promise<LlmResponse> {
      try {
        const messages = request.messages.map((m) => ({ role: m.role, content: m.content }));
        if (request.json) {
          messages.push({ role: 'assistant' as const, content: '{' });
        }

        const response = await client.messages.create({
          model,
          max_tokens: request.maxTokens ?? 8000,
          temperature: request.temperature ?? 0.6,
          system: request.system,
          messages,
        });

        const text = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === 'text')
          .map((block) => block.text)
          .join('');

        return {
          text: request.json ? `{${text}` : text,
          model: response.model,
          usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
        };
      } catch (error) {
        const status = error instanceof Anthropic.APIError ? error.status : undefined;
        throw new LlmError(error instanceof Error ? error.message : 'Anthropic request failed', 'anthropic', status);
      }
    },
  };
}
