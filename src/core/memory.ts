import fs from 'node:fs';
import path from 'node:path';

/**
 * Shared simple memory between agents.
 * Stores results in memory and on disk (cache.json) for local persistence.
 */
export class Memory {
  private store: Record<string, unknown> = {};
  private cachePath: string;

  constructor(baseDir: string = process.cwd()) {
    this.cachePath = path.join(baseDir, 'cache.json');
    if (fs.existsSync(this.cachePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
        this.store = data;
      } catch {
        this.store = {};
      }
    }
  }

  /**
   * Get a value from the memory
   */
  get<T = unknown>(key: string): T | null {
    return (this.store[key] as T) ?? null;
  }

  /**
   * Set a value in the memory
   */
  set<T = unknown>(key: string, value: T): void {
    this.store[key] = value;
    this.persist();
  }

  /**
   * Delete a value from the memory
   */
  delete(key: string): void {
    delete this.store[key];
    this.persist();
  }

  /**
   * Clear the memory
   */
  clear(): void {
    this.store = {};
    this.persist();
  }

  /**
   * Persist the memory
   */
  private persist(): void {
    fs.writeFileSync(this.cachePath, JSON.stringify(this.store, null, 2));
  }
}
