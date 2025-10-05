import type { Tool } from '@/tools/index.js';

interface FirecrawlInput {
  url: string;
  format?: 'markdown' | 'html' | 'text';
  onlyMainContent?: boolean;
}

interface FirecrawlOutput {
  url: string;
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
    [key: string]: unknown;
  };
  error?: string;
}

export class FirecrawlTool implements Tool {
  name = 'firecrawl';
  description =
    'Use it to scrape and extract clean content from any website URL. Returns markdown, HTML, or plain text with metadata.';

  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.firecrawl.dev/v1';

  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Warning: FIRECRAWL_API_KEY not found. Firecrawl tool will not work properly.');
    }
  }

  async execute(input: unknown): Promise<FirecrawlOutput> {
    const { url, format = 'markdown', onlyMainContent = true } = input as FirecrawlInput;

    if (!url) {
      return {
        url: '',
        content: '',
        error: 'No URL provided',
      };
    }

    if (!this.apiKey) {
      return {
        url,
        content: '',
        error: 'FIRECRAWL_API_KEY environment variable is required',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url,
          formats: [format],
          onlyMainContent,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Firecrawl API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      return {
        url,
        content: data.data?.[format] || data.data?.markdown || '',
        metadata: data.data?.metadata || {},
      };
    } catch (error) {
      return {
        url,
        content: '',
        error: `Failed to scrape URL: ${error}`,
      };
    }
  }
}
