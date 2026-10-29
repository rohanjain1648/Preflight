import { chat } from '@forge/llm';
import type { LlmClient, LlmRequest, LlmResponse } from './client';

/** Thin adapter over @forge/llm. Verified on the dev site, not unit-tested. */
export class ForgeLlmClient implements LlmClient {
  async complete(req: LlmRequest): Promise<LlmResponse> {
    // No temperature: several Claude models reject it.
    const res = await chat({
      model: req.model,
      messages: [
        { role: 'system', content: req.system },
        { role: 'user', content: req.user },
      ],
      max_completion_tokens: req.maxTokens,
    });
    const content = res.choices[0]?.message?.content;
    const text = typeof content === 'string' ? content : (content ?? []).map((p) => p.text).join('');
    return {
      text,
      inputTokens: res.usage?.input_tokens ?? 0,
      outputTokens: res.usage?.output_tokens ?? 0,
    };
  }
}
