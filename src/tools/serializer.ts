import fs from 'node:fs';
import type { Tool } from '@/tools/index.js';

/**
 * Tool to serialize data to a CSV file
 */
export class SerializerTool implements Tool {
  name = 'serializer';

  /**
   * Execute the serializer tool
   */
  async execute(input: { data: unknown[]; outputPath: string }): Promise<unknown> {
    const csv = this.toCSV(input.data);
    fs.writeFileSync(input.outputPath, csv, 'utf8');
    return { saved: input.outputPath, rows: input.data.length };
  }

  /**
   * Convert data to a CSV string
   */
  private toCSV(data: unknown[]): string {
    if (!Array.isArray(data) || data.length === 0) return '';
    const keys = Object.keys(data[0] as Record<string, unknown>);
    const lines = data.map((row) => keys.map((k) => (row as Record<string, unknown>)[k]).join(','));
    return [keys.join(','), ...lines].join('\n');
  }
}
