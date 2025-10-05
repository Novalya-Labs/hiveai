import fs from 'node:fs';
import path from 'node:path';
import type { Tool } from '@/tools/index.js';

interface FileReaderInput {
  filePath: string;
}

interface FileReaderOutput {
  content: string | Record<string, unknown> | Array<Record<string, string>>;
  format: string;
  size: number;
  error?: string;
}

export class FileReaderTool implements Tool {
  name = 'file-reader';
  description = 'Use it to read and parse files (JSON, CSV, TXT, MD). Provide a file path to extract its content.';

  async execute(input: unknown): Promise<FileReaderOutput> {
    const { filePath } = input as FileReaderInput;

    if (!filePath) {
      return {
        content: '',
        format: 'unknown',
        size: 0,
        error: 'No file path provided',
      };
    }

    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
      return {
        content: '',
        format: 'unknown',
        size: 0,
        error: `File not found: ${filePath}`,
      };
    }

    const stats = fs.statSync(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();

    try {
      switch (ext) {
        case '.json':
          return this.readJSON(absolutePath, stats.size);
        case '.csv':
          return this.readCSV(absolutePath, stats.size);
        case '.txt':
        case '.md':
          return this.readText(absolutePath, stats.size);
        default:
          return {
            content: '',
            format: 'unsupported',
            size: stats.size,
            error: `Unsupported file format: ${ext}`,
          };
      }
    } catch (error) {
      return {
        content: '',
        format: ext.replace('.', ''),
        size: stats.size,
        error: `Error reading file: ${error}`,
      };
    }
  }

  private readJSON(filePath: string, size: number): FileReaderOutput {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      content: parsed,
      format: 'json',
      size,
    };
  }

  private readCSV(filePath: string, size: number): FileReaderOutput {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());

    if (lines.length === 0) {
      return { content: [], format: 'csv', size };
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      for (let i = 0; i < headers.length; i++) {
        row[headers[i]] = values[i] || '';
      }
      return row;
    });

    return {
      content: rows,
      format: 'csv',
      size,
    };
  }

  private readText(filePath: string, size: number): FileReaderOutput {
    const content = fs.readFileSync(filePath, 'utf-8');
    return {
      content,
      format: 'text',
      size,
    };
  }
}
