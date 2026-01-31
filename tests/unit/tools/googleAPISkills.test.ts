// Mock the Google Generative AI
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            summary: 'Test summary',
                            keyFindings: ['Finding 1', 'Finding 2'],
                            sources: [{ title: 'Source 1', url: 'https://example.com', relevance: 0.9 }],
                            synthesis: 'Test synthesis'
                        }),
                        usageMetadata: { totalTokenCount: 150 }
                    }
                })
            };
        }
    }
}));

import {
    gemini3Flash,
    deepResearch,
    veo31Generate,
    documentAIExtract
} from '@/tools/googleAPISkills';

describe('Google API Skills', () => {
    describe('gemini3Flash', () => {
        it('should generate content with Gemini 3', async () => {
            const result = await gemini3Flash('test-user', 'Test prompt');

            expect(result.success).toBe(true);
            expect(result.text).toBeDefined();
        });

        it('should accept custom options', async () => {
            const result = await gemini3Flash('test-user', 'Test prompt', {
                temperature: 0.5,
                maxTokens: 4096,
                systemInstruction: 'Be concise'
            });

            expect(result.success).toBe(true);
        });
    });

    describe('deepResearch', () => {
        it('should perform shallow research', async () => {
            const result = await deepResearch('test-user', 'AI Agents', {
                depth: 'shallow'
            });

            expect(result.success).toBe(true);
            expect(result.topic).toBe('AI Agents');
            expect(result.keyFindings).toBeDefined();
        });

        it('should perform deep research with focus areas', async () => {
            const result = await deepResearch('test-user', 'Marketing Automation', {
                depth: 'deep',
                focusAreas: ['ROI', 'Implementation']
            });

            expect(result.success).toBe(true);
            expect(result.synthesis).toBeDefined();
        });
    });

    describe('veo31Generate', () => {
        it('should generate video with default options', async () => {
            const result = await veo31Generate('test-user', 'A sunset over mountains');

            expect(result.success).toBe(true);
            expect(result.duration).toBe(8);
            expect(result.resolution).toBe('720p');
            expect(result.aspectRatio).toBe('16:9');
        });

        it('should generate video with custom options', async () => {
            const result = await veo31Generate('test-user', 'Product showcase', {
                duration: 8,
                resolution: '4k',
                aspectRatio: '9:16'
            });

            expect(result.success).toBe(true);
            expect(result.duration).toBe(8);
            expect(result.resolution).toBe('4k');
            expect(result.aspectRatio).toBe('9:16');
        });
    });

    describe('documentAIExtract', () => {
        it('should extract text from document', async () => {
            const result = await documentAIExtract(
                'test-user',
                'https://example.com/doc.pdf'
            );

            expect(result.success).toBe(true);
            expect(result.documentType).toBe('PDF');
            expect(result.extractedText).toBeDefined();
        });

        it('should extract tables when requested', async () => {
            const result = await documentAIExtract(
                'test-user',
                'https://example.com/doc.pdf',
                { extractType: 'table' }
            );

            expect(result.success).toBe(true);
            expect(result.tables).toBeDefined();
        });
    });
});
