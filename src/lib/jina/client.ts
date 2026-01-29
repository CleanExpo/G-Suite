/**
 * Jina AI Client
 * 
 * Provides interface to Jina's Reader and Search APIs for AI-friendly web access.
 * 
 * Capability:
 * - Reader: Converts URLs to clean LLM-ready markdown
 * - Search: Performs web searches optimized for RAG
 */

export interface JinaReaderOptions {
  withImagesSummary?: boolean; // Summarize images
  withGeneratedAlt?: boolean;  // Generate alt text for images
  targetSelector?: string;     // CSS selector for specific content
  waitForSelector?: string;    // Wait for selector before scraping
  proxyUrl?: string;           // Use custom proxy if needed
}

export interface JinaSearchResult {
  title: string;
  url: string;
  description: string;
  content: string;
  score?: number;
}

export interface JinaReaderResult {
  title: string;
  url: string;
  content: string; // Markdown
  images?: Record<string, string>; // Image URL -> Alt/Summary
  links?: Record<string, string>;  // Link Text -> URL
}

export class JinaClient {
  private apiKey: string;
  private readonly baseUrl = 'https://r.jina.ai/';
  private readonly searchUrl = 'https://s.jina.ai/';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.JINA_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[JinaClient] Warning: No API key provided. Free tier limits may apply.');
    }
  }

  /**
   * Read a webpage and convert to AI-friendly Markdown
   */
  async read(url: string, options: JinaReaderOptions = {}): Promise<JinaReaderResult> {
    try {
      // Clean up URL
      const cleanUrl = url.trim();
      
      // Construct endpoint request
      const requestUrl = `${this.baseUrl}${cleanUrl}`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
      };

      // Add specialized headers
      if (options.withImagesSummary) headers['X-With-Images-Summary'] = 'true';
      if (options.withGeneratedAlt) headers['X-With-Generated-Alt'] = 'true';
      if (options.targetSelector) headers['X-Target-Selector'] = options.targetSelector;
      if (options.waitForSelector) headers['X-Wait-For-Selector'] = options.waitForSelector;
      if (options.proxyUrl) headers['X-Proxy-Url'] = options.proxyUrl;

      // Ensure clean output format
      headers['X-Return-Format'] = 'markdown'; // Although default, explicit is good

      console.log(`[JinaClient] Reading ${cleanUrl}...`);

      const response = await fetch(requestUrl, {
        method: 'POST', // Jina supports GET but POST/JSON body or headers is cleaner for complex opts
        headers
      });

      if (!response.ok) {
        throw new Error(`Jina Reader API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.code && data.code !== 200) {
        throw new Error(`Jina Reader Service error: ${data.details || 'Unknown error'}`);
      }

      // Check format of response.
      // Jina usually returns the raw content if Accept is text/plain, 
      // or JSON wrapper if Accept is application/json.
      return {
        title: data.data?.title || 'No Title',
        url: data.data?.url || url,
        content: data.data?.content || '',
        links: data.data?.links,
        images: data.data?.images
      };

    } catch (error: any) {
      console.error('[JinaClient] Read error:', error.message);
      throw error;
    }
  }

  /**
   * Search the web for AI-friendly results
   */
  async search(query: string): Promise<JinaSearchResult[]> {
    try {
      const requestUrl = `${this.searchUrl}${encodeURIComponent(query)}`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
      };

      console.log(`[JinaClient] Searching: ${query}...`);

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Jina Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        return [];
      }

      return data.data.map((item: any) => ({
        title: item.title,
        url: item.url,
        description: item.description,
        content: item.content,
        score: item.score
      }));

    } catch (error: any) {
      console.error('[JinaClient] Search error:', error.message);
      throw error;
    }
  }
}

// Singleton instance
let jinaInstance: JinaClient | null = null;

export function getJinaClient(): JinaClient {
  if (!jinaInstance) {
    jinaInstance = new JinaClient();
  }
  return jinaInstance;
}
