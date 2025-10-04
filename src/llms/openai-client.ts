import type { LLMClient } from '@/llms/index.js';

/**
 * OpenAI client
 */
export class OpenAIClient implements LLMClient {
  /**
   * Generate a response from the OpenAI model
   */
  async generate(prompt: string): Promise<unknown> {
    return {
      model: 'openai',
      prompt,
      output: `Mocked OpenAI response for: ${prompt.slice(0, 50)}...`,
    };
  }
}
