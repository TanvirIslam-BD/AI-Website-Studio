import OpenAI from 'openai';
import { LlmError, type LlmProvider, type LlmRequest, type LlmResponse } from '../types';

/** OpenAI provider. Uses native `response_format: json_object` for JSON mode. */
export function createOpenAiProvider(apiKey: string, model: string): LlmProvider {
  const client = new OpenAI({ apiKey });

  return {
    id: 'openai',
    model,
    async complete(request: LlmRequest): Promise<LlmResponse> {
      try {
        const response = await client.chat.completions.create({
          model,
          max_tokens: request.maxTokens ?? 8000,
          temperature: request.temperature ?? 0.6,
          response_format: request.json ? { type: 'json_object' } : undefined,
          messages: [
            { role: 'system', content: request.system },
            ...request.messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        });

        return {
          text: response.choices[0]?.message?.content ?? '',
          model: response.model,
          usage: {
            inputTokens: response.usage?.prompt_tokens,
            outputTokens: response.usage?.completion_tokens,
          },
        };
      } catch (error) {
        const status = error instanceof OpenAI.APIError ? error.status : undefined;
        throw new LlmError(error instanceof Error ? error.message : 'OpenAI request failed', 'openai', status);
      }
    },
  };
}
