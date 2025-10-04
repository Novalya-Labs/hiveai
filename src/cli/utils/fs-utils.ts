import fs from 'node:fs';
import path from 'node:path';

/**
 * Check if a directory exists, otherwise create it.
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Write a file avoiding overwriting an existing one (numeric suffix if necessary).
 */
export function safeWriteFile(filePath: string, content: string): string {
  let finalPath = filePath;
  let counter = 1;

  while (fs.existsSync(finalPath)) {
    const { dir, name, ext } = path.parse(filePath);
    finalPath = path.join(dir, `${name}-${counter}${ext}`);
    counter++;
  }

  fs.writeFileSync(finalPath, content);
  return finalPath;
}

/**
 * Return the current team name if we are in teams/<team>/
 */
export function getCurrentTeamName(cwd: string): string | null {
  const parts = cwd.split(path.sep);
  const idx = parts.lastIndexOf('teams');
  return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : null;
}
