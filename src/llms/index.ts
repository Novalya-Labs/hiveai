import { ClaudeClient } from '@/llms/claude-client.js';
import { MistralClient } from '@/llms/mistral-client.js';
import { OpenAIClient } from '@/llms/openai-client.js';
import type { LLMContext, LLMResponse } from '@/llms/types.js';
import type { AgentConfig } from '@/types/agent.js';

export interface LLMClient {
  generate(prompt: string, context?: LLMContext): Promise<LLMResponse>;
}

export function getLLM(type: AgentConfig['llm']): LLMClient {
  switch (type) {
    case 'openai':
      return new OpenAIClient();
    case 'mistral':
      return new MistralClient();
    case 'claude':
      return new ClaudeClient();
    default:
      throw new Error(`Unknown LLM type: ${type}`);
  }
}
