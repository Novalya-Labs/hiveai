import type { LLMClient } from '@/llms/index.js';

/**
 * Mistral client
 */
export class MistralClient implements LLMClient {
  /**
   * Generate a response from the Mistral model
   */
  async generate(prompt: string): Promise<unknown> {
    return {
      model: 'mistral',
      prompt,
      output: `Mocked Mistral response for: ${prompt.slice(0, 50)}...`,
    };
  }
}
