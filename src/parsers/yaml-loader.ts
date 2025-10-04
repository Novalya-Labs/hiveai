import fs from 'node:fs';
import path from 'node:path';
import { type AgentConfig, AgentSchema } from '@/types/agent.js';

/**
 * Parse simple YAML
 */
function parseSimpleYAML(content: string): Record<string, unknown> {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l && !l.startsWith('#'));

  const result: Record<string, unknown> = {};
  let currentArrayKey: string | null = null;
  let currentArray: string[] = [];

  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (currentArrayKey) currentArray.push(line.slice(2).trim());
    } else if (line.includes(':')) {
      if (currentArrayKey) {
        result[currentArrayKey] = currentArray;
        currentArrayKey = null;
        currentArray = [];
      }

      const [key, ...rest] = line.split(':');
      const value = rest.join(':').trim();

      if (value === '') {
        currentArrayKey = key.trim();
        currentArray = [];
      } else {
        result[key.trim()] = value === 'true' ? true : value === 'false' ? false : value === 'null' ? null : value;
      }
    }
  }

  if (currentArrayKey) result[currentArrayKey] = currentArray;

  return result;
}

/**
 * Yaml loader
 */
export const YamlLoader = {
  /**
   * Load an agent from a file
   */
  loadAgent(filePath: string): AgentConfig {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = parseSimpleYAML(raw);
    const validated = AgentSchema.parse(parsed);
    return validated;
  },

  /**
   * Load all agents from a directory
   */
  loadAllFromDir(dirPath: string): AgentConfig[] {
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
    const agents = files.map((file) => YamlLoader.loadAgent(path.join(dirPath, file)));
    return agents;
  },
};
