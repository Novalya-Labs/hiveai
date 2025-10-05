export interface FunctionParameter {
  type: string;
  description?: string;
  properties?: Record<string, FunctionParameter>;
  required?: string[];
  items?: FunctionParameter;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: FunctionParameter;
  input_schema?: FunctionParameter;
}

export interface LLMContext {
  memory?: unknown;
  tools?: Array<{
    name: string;
    execute: (input: unknown) => Promise<unknown>;
  }>;
}

export interface LLMResponse {
  content: string;
  toolCalls?: Array<{
    name: string;
    input: unknown;
    result: unknown;
  }>;
}

export interface ChatMessage {
  role: string;
  content: string | unknown[];
  tool_call_id?: string;
  tool_calls?: unknown[];
  name?: string;
}

export interface APIResponse {
  content?: string;
  tool_calls?: Array<{
    id: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
  stop_reason?: string;
}

export interface ClaudeContent {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: unknown;
}

export interface ClaudeAPIResponse {
  content: ClaudeContent[];
  stop_reason?: string;
}

export interface ToolCallMessage {
  id: string;
  type?: string;
  name?: string;
  function: {
    name: string;
    arguments: string;
  };
  input?: unknown;
}

export interface ToolResultEntry {
  request: unknown;
  response: {
    type: string;
    tool_use_id: string;
    content: string;
  };
}

export interface ToolInterface {
  name: string;
  execute: (input: unknown) => Promise<unknown>;
}
