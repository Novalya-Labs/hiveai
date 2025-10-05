import { FileReaderTool } from '@/tools/file-reader.js';
import { FirecrawlTool } from '@/tools/firecrawl.js';
import { SerializerTool } from '@/tools/serializer.js';

export interface Tool {
  name: string;
  description: string;
  execute(input: unknown): Promise<unknown>;
}

const registry: Record<string, Tool> = {
  serializer: new SerializerTool(),
  'file-reader': new FileReaderTool(),
  firecrawl: new FirecrawlTool(),
};

export function getTool(name: string): Tool | null {
  return registry[name] ?? null;
}
