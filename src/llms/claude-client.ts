import type { LLMClient } from '@/llms/index.js';

/**
 * Claude client
 */
export class ClaudeClient implements LLMClient {
  /**
   * Generate a response from the Claude model
   */
  async generate(prompt: string): Promise<unknown> {
    return {
      model: 'claude',
      prompt,
      output: `Mocked Claude response for: ${prompt.slice(0, 50)}...`,
    };
  }
}
