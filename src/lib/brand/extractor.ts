/**
 * Brand DNA Extractor
 * 
 * Uses Gemini to analyze raw website content (from Jina) and extract the "Brand DNA":
 * - Color Palette (Hex codes)
 * - Typography (Font families)
 * - Tone of Voice (Vibe)
 * - Key Messaging
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export interface BrandProfile {
    name: string;
    palette: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    typography: {
        headings: string;
        body: string;
    };
    tone: {
        voice: string; // e.g., "Professional", "Playful"
        keywords: string[];
    };
    imagery: {
        style: string; // Description for Imagen 3
        preferredSubjects: string[];
    };
}

export class BrandExtractor {

    /**
     * Extract Brand DNA from markdown content
     */
    async extract(content: string, url: string): Promise<BrandProfile> {
        try {
            const prompt = `
        You are a Chief Marketing Officer. Analyze the following website content (scraped from ${url}) and extract the "Brand DNA".
        
        Input Content:
        """
        ${content.substring(0, 20000)} 
        """
        // Truncated for token limits, but 20k chars is usually plenty for Gemini 2.0 Flash

        Your goal is to infer the brand's visual and tonal identity. 
        
        Strict JSON Output Format:
        {
          "name": "Brand Name",
          "palette": {
            "primary": "#hex",
            "secondary": "#hex",
            "accent": "#hex",
            "background": "#hex",
            "text": "#hex"
          },
          "typography": {
            "headings": "Font Family Name (or similar Google Font)",
            "body": "Font Family Name (or similar Google Font)"
          },
          "tone": {
            "voice": "adjective", 
            "keywords": ["key", "word", "list"]
          },
          "imagery": {
            "style": "Detailed prompt description for AI image generation that matches this brand's style (e.g., 'Minimalist, high-key lighting, corporate setting')",
            "preferredSubjects": ["subject1", "subject2"]
          }
        }
        
        Instructions:
        1. Look for CSS variables or visual descriptions in the text for colors. If not explicit, infer typical colors for this industry or mood.
        2. For typography, infer closest Google Fonts matches if specific fonts aren't mentioned.
        3. Be precise with the "imagery.style" - this will be used to generate assets.
      `;

            const result = await model.generateContent(prompt);
            const outputText = result.response.text();

            // Clean JSON (markdown code block removal)
            const cleanJson = outputText.replace(/```json|```/gi, '').trim();

            return JSON.parse(cleanJson) as BrandProfile;

        } catch (error: any) {
            console.error('[BrandExtractor] Extraction failed:', error.message);

            // Fallback Profile
            return {
                name: 'Unknown Brand',
                palette: {
                    primary: '#000000',
                    secondary: '#ffffff',
                    accent: '#0066cc',
                    background: '#ffffff',
                    text: '#333333'
                },
                typography: { headings: 'Inter', body: 'Roboto' },
                tone: { voice: 'Neutral', keywords: [] },
                imagery: { style: 'Generic corporate style', preferredSubjects: [] }
            };
        }
    }
}

// Singleton
export const brandExtractor = new BrandExtractor();
