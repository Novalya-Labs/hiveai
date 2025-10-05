import fs from 'node:fs';
import path from 'node:path';
import { ZodError } from 'zod';
import { formatZodError } from '@/parsers/error-formatter.js';
import { processTemplateInObject } from '@/parsers/template.js';
import { type AgentConfig, AgentSchema } from '@/types/agent.js';

function parseValue(value: string): unknown {
  const trimmed = value.trim();

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;

  if (/^-?\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return Number.parseFloat(trimmed);

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function getIndentLevel(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

function parseYAMLLines(lines: string[], startIndex = 0, baseIndent = 0): [unknown, number] {
  const result: Record<string, unknown> = {};
  let i = startIndex;
  let currentArrayKey: string | null = null;
  let currentArray: unknown[] = [];

  while (i < lines.length) {
    const line = lines[i];
    const indent = getIndentLevel(line);

    if (indent < baseIndent) {
      break;
    }

    if (indent > baseIndent && !currentArrayKey) {
      i++;
      continue;
    }

    const trimmed = line.trim();

    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2).trim();

      if (value.includes(':')) {
        const [objKey, ...objRest] = value.split(':');
        const objValue = objRest.join(':').trim();
        const obj: Record<string, unknown> = {};

        if (objValue) {
          obj[objKey.trim()] = parseValue(objValue);
        } else {
          const [nestedObj, newIndex] = parseYAMLLines(lines, i + 1, indent + 2);
          obj[objKey.trim()] = nestedObj;
          i = newIndex - 1;
        }
        currentArray.push(obj);
      } else {
        currentArray.push(parseValue(value));
      }

      if (currentArrayKey) {
        result[currentArrayKey] = currentArray;
      }
    } else if (trimmed.includes(':')) {
      if (currentArrayKey && currentArray.length > 0) {
        result[currentArrayKey] = currentArray;
        currentArrayKey = null;
        currentArray = [];
      }

      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();

      if (value === '') {
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('- ')) {
          currentArrayKey = key;
          currentArray = [];
        } else {
          const [nestedValue, newIndex] = parseYAMLLines(lines, i + 1, indent + 2);
          result[key] = nestedValue;
          i = newIndex - 1;
        }
      } else {
        result[key] = parseValue(value);
      }
    }

    i++;
  }

  if (currentArrayKey && currentArray.length > 0) {
    result[currentArrayKey] = currentArray;
  }

  return [result, i];
}

function parseSimpleYAML(content: string): Record<string, unknown> {
  const lines = content.split(/\r?\n/).filter((l) => l.trimEnd() && !l.trim().startsWith('#'));

  const [result] = parseYAMLLines(lines, 0, 0);
  return result as Record<string, unknown>;
}

/**
 * Yaml loader
 */
export const YamlLoader = {
  /**
   * Load an agent from a file
   */
  loadAgent(filePath: string): AgentConfig {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = parseSimpleYAML(raw);
      const withEnvVars = processTemplateInObject(parsed);
      const validated = AgentSchema.parse(withEnvVars);
      return validated;
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(`\n❌ Error loading agent from ${path.basename(filePath)}:`);
        console.error(formatZodError(error));
        throw new Error('Agent validation failed');
      }
      throw error;
    }
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
