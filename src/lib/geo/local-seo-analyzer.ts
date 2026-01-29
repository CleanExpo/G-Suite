/**
 * Local SEO Analyzer
 * 
 * Performs NAP (Name, Address, Phone) consistency audits and 
 * citation analysis across the web.
 */

import { getJinaClient } from '../jina/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export interface NAPAuditResult {
    consistent: boolean;
    score: number; // 0-100
    expected: {
        name: string;
        address: string;
        phone: string;
    };
    citations: {
        source: string;
        url: string;
        foundName?: string;
        foundAddress?: string;
        foundPhone?: string;
        status: 'match' | 'mismatch' | 'missing';
    }[];
    recommendations: string[];
}

export class LocalSEOAnalyzer {
    private jina = getJinaClient();
    private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    /**
     * Perform a full NAP Audit
     */
    async auditNAP(name: string, address: string, phone: string): Promise<NAPAuditResult> {
        console.log(`[LocalSEO] Auditing NAP for: ${name}`);

        // 1. Search for instances of the business
        const searchQuery = `"${name}" "${phone}" OR "${address}"`;
        const searchResults = await this.jina.search(searchQuery);

        // 2. Analyze search results for consistency
        const prompt = `
            Analyze these search results for NAP Consistency (Name, Address, Phone) for the business:
            EXPECTED NAME: ${name}
            EXPECTED ADDRESS: ${address}
            EXPECTED PHONE: ${phone}
            
            SEARCH RESULTS:
            ${searchResults.map(r => `SOURCE: ${r.title}\nURL: ${r.url}\nCONTENT: ${r.content.substring(0, 500)}`).join('\n---\n')}
            
            Return a detailed JSON audit identifying matches and mismatches.
            Format:
            {
                "score": 0-100,
                "consistent": true/false,
                "citations": [
                    { "source": "...", "url": "...", "foundName": "...", "foundAddress": "...", "foundPhone": "...", "status": "match|mismatch|missing" }
                ],
                "recommendations": ["..."]
            }
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/gi, '').trim();
            const audit = JSON.parse(text);

            return {
                ...audit,
                expected: { name, address, phone }
            };
        } catch (error: any) {
            console.error('[LocalSEO] Audit failed:', error.message);
            throw error;
        }
    }

    /**
     * Check for Local Business Schema
     */
    async checkLocalSchema(url: string) {
        const content = await this.jina.read(url);
        const hasSchema = content.content.includes('ld+json') && content.content.includes('LocalBusiness');

        return {
            hasSchema,
            type: hasSchema ? 'LocalBusiness' : 'None',
            recommendation: hasSchema ? 'Optimize existing schema' : 'Add JSON-LD LocalBusiness schema'
        };
    }
}

// Singleton
export const localSEOAnalyzer = new LocalSEOAnalyzer();
