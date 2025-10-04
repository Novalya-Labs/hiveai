import { SerializerTool } from '@/tools/serializer.js';
import { WebScraperTool } from '@/tools/web-scrapper.js';

/**
 * Tool interface
 */
export interface Tool {
  name: string;
  execute(input: unknown): Promise<unknown>;
}

/**
 * Tool registry
 */
const registry: Record<string, Tool> = {
  'web-scraper': new WebScraperTool(),
  serializer: new SerializerTool(),
};

/**
 * Get a tool by name
 */
export function getTool(name: string): Tool | null {
  return registry[name] ?? null;
}
