import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Deep Research Client
 *
 * Leverages Gemini 2.0 with Google Search grounding to perform
 * high-fidelity market research, competitor analysis, and trend synthesis.
 */
export class DeepResearchClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey || process.env.GOOGLE_API_KEY || '');

    // Using gemini-2.0-flash which is optimized for tool use and speed
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [
        {
          googleSearch: {},
        } as any,
      ],
    });
  }

  /**
   * Perform deep research on a topic
   */
  async research(
    topic: string,
    options: {
      depth?: 'shallow' | 'moderate' | 'deep';
      focusAreas?: string[];
      maxSources?: number;
    } = {},
  ) {
    const { depth = 'moderate', focusAreas = [], maxSources = 10 } = options;

    console.log(`[DeepResearchClient] Researching: ${topic} (Depth: ${depth})`);

    const systemInstruction = `
            You are a Senior Research Analyst. Your goal is to provide high-fidelity, data-driven research.
            Use Google Search to find current facts, market data, and competitor information.
            
            Structure your report with:
            1. Executive Summary
            2. Key Findings (with data points)
            3. Detailed Analysis
            4. Sources & Citations
            5. Strategic Recommendations
            
            Be objective, precise, and cite your findings using [Source Name/URL].
        `;

    const prompt = `
            Conduct a ${depth} research project on: "${topic}"
            ${focusAreas.length > 0 ? `Focus specifically on these areas: ${focusAreas.join(', ')}` : ''}
            
            Perform multiple searches if necessary to get comprehensive data on:
            - Current market size and trends
            - Major competitors and their positioning
            - Future outlook and potential risks
            - Specific data points and statistics
            
            Return the result in detailed Markdown format.
        `;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2, // Low temperature for factual consistency
          maxOutputTokens: 8192,
        },
      });

      const response = result.response;
      const text = response.text();

      // Extract grounding metadata if available (standard in SDK now)
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources = groundingMetadata?.searchEntryPoint?.renderedContent || '';

      return {
        success: true,
        topic,
        content: text,
        sources: sources,
        rawMetadata: groundingMetadata,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[DeepResearchClient] Research failed:', error.message);
      return {
        success: false,
        error: error.message,
        topic,
      };
    }
  }
}

// Singleton instance
export const deepResearchClient = new DeepResearchClient();
