import type { LLMClient } from '@/llms/index.js';
import type {
  ClaudeAPIResponse,
  FunctionDefinition,
  LLMContext,
  LLMResponse,
  ToolInterface,
  ToolResultEntry,
} from '@/llms/types.js';

export class ClaudeClient implements LLMClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.anthropic.com/v1';
  private readonly model = 'claude-3-5-sonnet-20241022';
  private readonly maxRetries = 3;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
  }

  async generate(prompt: string, context?: LLMContext): Promise<LLMResponse> {
    const tools = this.buildFunctionDefinitions(context?.tools || []);

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await this.callAPI(prompt, tools);

        if (response.stop_reason === 'tool_use') {
          return await this.handleToolCalls(response, prompt, tools, context);
        }

        const content = response.content.find((c) => c.type === 'text');
        return {
          content: content?.text || '',
          toolCalls: [],
        };
      } catch (error) {
        attempt++;
        if (attempt >= this.maxRetries) {
          throw new Error(`Anthropic API failed after ${this.maxRetries} attempts: ${error}`);
        }
        await this.sleep(1000 * attempt);
      }
    }

    throw new Error('Unexpected error in Claude client');
  }

  private async callAPI(
    prompt: string,
    tools: FunctionDefinition[],
    toolResults?: ToolResultEntry[],
  ): Promise<ClaudeAPIResponse> {
    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    };

    if (tools.length > 0) {
      body.tools = tools;
    }

    if (toolResults && toolResults.length > 0) {
      body.messages = [
        { role: 'user', content: prompt },
        { role: 'assistant', content: toolResults.map((r) => r.request) },
        { role: 'user', content: toolResults.map((r) => r.response) },
      ];
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  private async handleToolCalls(
    message: ClaudeAPIResponse,
    prompt: string,
    tools: FunctionDefinition[],
    context?: LLMContext,
  ): Promise<LLMResponse> {
    const toolCalls = [];
    const toolResults = [];

    for (const block of message.content) {
      if (block.type !== 'tool_use' || !block.name || !block.id) continue;

      const tool = context?.tools?.find((t) => t.name === block.name);
      if (!tool) continue;

      const result = await tool.execute(block.input);

      toolCalls.push({
        name: block.name,
        input: block.input,
        result,
      });

      toolResults.push({
        request: block,
        response: {
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        },
      });
    }

    const finalResponse = await this.callAPI(prompt, tools, toolResults);
    const content = finalResponse.content.find((c) => c.type === 'text');

    return {
      content: content?.text || '',
      toolCalls,
    };
  }

  private buildFunctionDefinitions(tools: ToolInterface[]): FunctionDefinition[] {
    return tools.map((tool) => ({
      name: tool.name,
      description: `Execute the ${tool.name} tool`,
      input_schema: {
        type: 'object',
        properties: {},
      },
      parameters: {
        type: 'object',
        properties: {},
      },
    }));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
