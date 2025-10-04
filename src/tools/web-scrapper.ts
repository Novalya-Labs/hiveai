import type { Tool } from '@/tools/index.js';

/**
 * Tool to scrape a website and return the data
 */
export class WebScraperTool implements Tool {
  name = 'web-scraper';

  /**
   * Execute the web scraper tool
   */
  async execute(input: { url: string }): Promise<unknown> {
    return {
      url: input.url,
      data: [
        { name: 'John Doe', email: 'john@example.com', company: 'Acme Inc.' },
        { name: 'Jane Smith', email: 'jane@company.com', company: 'Globex' },
      ],
    };
  }
}
