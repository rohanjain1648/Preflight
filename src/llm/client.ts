export interface LlmRequest {
  model: string;
  system: string;
  user: string;
  maxTokens: number;
}

export interface LlmResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface LlmClient {
  complete(req: LlmRequest): Promise<LlmResponse>;
}
