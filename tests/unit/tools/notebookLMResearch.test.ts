
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    notebookLMResearch,
    createResearchNotebook,
    notebookLMQuery,
    notebookLMAudioOverview,
    ResearchSource
} from '@/tools/notebookLMResearch';
import { GoogleGenerativeAI } from '@google/generative-ai';

vi.mock('@google/generative-ai', () => {
    const generateContent = vi.fn();
    const getGenerativeModel = vi.fn(() => ({
        generateContent
    }));

    class MockGoogleGenerativeAI {
        static __mocks = { generateContent, getGenerativeModel };
        getGenerativeModel = getGenerativeModel;
    }

    return {
        GoogleGenerativeAI: MockGoogleGenerativeAI
    };
});

describe('NotebookLM Research Tool', () => {
    const mocks = (GoogleGenerativeAI as any).__mocks;

    const mockSources: ResearchSource[] = [
        {
            type: 'text',
            content: 'Source content 1',
            title: 'Source 1'
        },
        {
            type: 'text',
            content: 'Source content 2',
            title: 'Source 2'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createResearchNotebook', () => {
        it('should create a notebook with summary and key topics', async () => {
            const mockResponse = {
                summary: 'Test summary',
                keyTopics: ['Topic A', 'Topic B']
            };

            mocks.generateContent.mockResolvedValueOnce({
                response: {
                    text: () => JSON.stringify(mockResponse)
                }
            });

            const result = await createResearchNotebook('user123', 'Test Notebook', mockSources);

            expect(result.success).toBe(true);
            expect(result.notebook).toBeDefined();
            expect(result.notebook?.summary).toBe(mockResponse.summary);
            expect(result.notebook?.keyTopics).toEqual(mockResponse.keyTopics);
            expect(mocks.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-3-pro-preview' });
        });

        it('should handle errors during creation', async () => {
            mocks.generateContent.mockRejectedValueOnce(new Error('API failure'));

            const result = await createResearchNotebook('user123', 'Test Notebook', mockSources);

            expect(result.success).toBe(false);
            expect(result.error).toBe('API failure');
        });
    });

    describe('notebookLMResearch', () => {
        it('should perform deep research synthesis', async () => {
            const mockResponse = {
                summary: 'Detailed summary',
                keyFindings: ['Finding 1', 'Finding 2'],
                topics: ['Topic 1'],
                sourceAnalysis: [
                    { title: 'Source 1', relevance: 0.9, keyPoints: ['Point A'] }
                ]
            };

            mocks.generateContent.mockResolvedValueOnce({
                response: {
                    text: () => JSON.stringify(mockResponse),
                    usageMetadata: { totalTokenCount: 100 }
                }
            });

            const result = await notebookLMResearch('user123', 'Research Topic', mockSources);

            expect(result.success).toBe(true);
            expect(result.synthesis.summary).toBe(mockResponse.summary);
            expect(result.sources).toHaveLength(1);
            expect(result.cost).toBeGreaterThan(0);
        });

        it('should handle comprehensive depth option', async () => {
            mocks.generateContent.mockResolvedValueOnce({
                response: {
                    text: () => JSON.stringify({ summary: 'Comp summary', keyFindings: [], topics: [] }),
                    usageMetadata: { totalTokenCount: 200 }
                }
            });

            const result = await notebookLMResearch('user123', 'Topic', mockSources, { depth: 'comprehensive' });
            expect(result.success).toBe(true);
        });

        it('should return default structure on error', async () => {
            mocks.generateContent.mockRejectedValueOnce(new Error('Research failed'));

            const result = await notebookLMResearch('user123', 'Topic', mockSources);

            expect(result.success).toBe(false);
            expect(result.synthesis.summary).toBe('Research failed');
        });
    });

    describe('notebookLMQuery', () => {
        it('should return answers with citations', async () => {
            const mockResponse = {
                answer: 'The answer is 42',
                citations: [{ source: 'Source 1', quote: '42' }],
                confidence: 0.95
            };

            mocks.generateContent.mockResolvedValueOnce({
                response: {
                    text: () => JSON.stringify(mockResponse)
                }
            });

            const result = await notebookLMQuery('user123', 'nb_1', 'What is the answer?', mockSources);

            expect(result.success).toBe(true);
            expect(result.answer).toBe(mockResponse.answer);
            expect(result.citations).toEqual(mockResponse.citations);
            expect(mocks.getGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({ model: 'gemini-3-flash-preview' }));
        });
    });

    describe('notebookLMAudioOverview', () => {
        it('should generate audio script and url', async () => {
            const mockScript = 'Host A: Hello. Host B: Hi.';
            mocks.generateContent.mockResolvedValueOnce({
                response: {
                    text: () => mockScript
                }
            });

            const synthesis = {
                summary: 'Sum',
                keyFindings: ['F1'],
                topics: ['T1']
            };

            const result = await notebookLMAudioOverview('user123', synthesis as any);

            expect(result.success).toBe(true);
            expect(result.script).toBe(mockScript);
            expect(result.audioUrl).toContain('https://storage.googleapis.com');
            expect(result.durationSeconds).toBeGreaterThan(0);
        });
    });
});
