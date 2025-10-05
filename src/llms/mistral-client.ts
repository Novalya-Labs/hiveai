import type { LLMClient } from '@/llms/index.js';
import type {
  APIResponse,
  ChatMessage,
  FunctionDefinition,
  LLMContext,
  LLMResponse,
  ToolInterface,
} from '@/llms/types.js';

export class MistralClient implements LLMClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.mistral.ai/v1';
  private readonly model = 'mistral-large-latest';
  private readonly maxRetries = 3;

  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('MISTRAL_API_KEY environment variable is required');
    }
  }

  async generate(prompt: string, context?: LLMContext): Promise<LLMResponse> {
    const tools = this.buildFunctionDefinitions(context?.tools || []);

    const messages = [{ role: 'user', content: prompt }];

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        console.log(`      → Calling Mistral API (attempt ${attempt + 1}/${this.maxRetries})...`);
        const response = await this.callAPI(messages, tools);

        if (response.tool_calls) {
          console.log(`      🔧 Tool calls detected: ${response.tool_calls.length}`);
          return await this.handleToolCalls(response, messages, tools, context);
        }

        console.log(`      ✓ Response received (${response.content?.length || 0} chars)`);
        return {
          content: response.content || '',
          toolCalls: [],
        };
      } catch (error) {
        attempt++;
        console.error(`      ✗ API call failed: ${error}`);
        if (attempt >= this.maxRetries) {
          throw new Error(`Mistral API failed after ${this.maxRetries} attempts: ${error}`);
        }
        console.log(`      ⏳ Retrying in ${attempt}s...`);
        await this.sleep(1000 * attempt);
      }
    }

    throw new Error('Unexpected error in Mistral client');
  }

  private async callAPI(messages: ChatMessage[], tools: FunctionDefinition[]): Promise<APIResponse> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
    };

    if (tools.length > 0) {
      body.tools = tools.map((t) => ({ type: 'function', function: t }));
      body.tool_choice = 'auto';
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mistral API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message;
  }

  private async handleToolCalls(
    message: APIResponse,
    messages: ChatMessage[],
    tools: FunctionDefinition[],
    context?: LLMContext,
  ): Promise<LLMResponse> {
    const toolCalls = [];
    messages.push(message as unknown as ChatMessage);

    for (const toolCall of message.tool_calls || []) {
      const tool = context?.tools?.find((t) => t.name === toolCall.function.name);
      if (!tool) continue;

      const input = JSON.parse(toolCall.function.arguments);
      const result = await tool.execute(input);

      toolCalls.push({
        name: toolCall.function.name,
        input,
        result,
      });

      messages.push({
        role: 'tool',
        name: toolCall.function.name,
        content: JSON.stringify(result),
      });
    }

    const finalResponse = await this.callAPI(messages, tools);

    return {
      content: finalResponse.content || '',
      toolCalls,
    };
  }

  private buildFunctionDefinitions(tools: ToolInterface[]): FunctionDefinition[] {
    return tools.map((tool) => ({
      name: tool.name,
      description: `Execute the ${tool.name} tool`,
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
