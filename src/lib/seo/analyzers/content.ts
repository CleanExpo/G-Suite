/**
 * Content Analyzer
 *
 * Analyzes content quality, readability, word count, and keyword density.
 */

import { parseHTML } from 'linkedom';
import {
    ContentAnalysis,
    ReadingLevel,
    KeywordDensity,
    ContentQuality
} from '../types';

export class ContentAnalyzer {
    /**
     * Analyze content quality and readability
     */
    async analyze(html: string, targetKeywords: string[] = []): Promise<ContentAnalysis> {
        const { document: doc } = parseHTML(html);

        // Extract text content (exclude scripts, styles, headers, footers)
        const textContent = this.extractTextContent(doc);
        const wordCount = this.countWords(textContent);
        const readingLevel = this.calculateReadingLevel(textContent);
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/minute

        const keywordDensity = this.calculateKeywordDensity(textContent, targetKeywords);
        const contentQuality = this.assessContentQuality(doc, textContent);

        // Calculate overall content score
        let score = 100;

        // Word count scoring
        if (wordCount < 300) {
            score -= 30;
        } else if (wordCount < 600) {
            score -= 15;
        }

        // Reading level scoring (prefer 60-70 Flesch score = 8th-9th grade)
        if (readingLevel.fleschScore < 30 || readingLevel.fleschScore > 80) {
            score -= 10;
        }

        // Keyword density scoring
        const primaryKeywordDensity = keywordDensity[0]?.density || 0;
        if (primaryKeywordDensity < 0.5 || primaryKeywordDensity > 3) {
            score -= 15;
        }

        // Content quality scoring
        score -= (100 - contentQuality.score) * 0.4;

        return {
            wordCount,
            readingLevel,
            readingTime,
            keywordDensity,
            contentQuality,
            uniqueness: 100, // Placeholder - would need external API for duplicate detection
            score: Math.max(0, Math.round(score))
        };
    }

    /**
     * Extract meaningful text content from HTML
     */
    private extractTextContent(doc: Document): string {
        // Remove scripts, styles, and non-content elements
        const elementsToRemove = ['script', 'style', 'nav', 'header', 'footer', 'aside'];
        elementsToRemove.forEach(tag => {
            const elements = doc.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });

        // Get text from body
        const body = doc.querySelector('body');
        return body?.textContent?.trim() || '';
    }

    /**
     * Count words in text
     */
    private countWords(text: string): number {
        const words = text
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0);
        return words.length;
    }

    /**
     * Calculate Flesch reading ease score and grade level
     */
    private calculateReadingLevel(text: string): ReadingLevel {
        // Count sentences (approximate)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const sentenceCount = sentences.length || 1;

        // Count syllables (simplified heuristic)
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length || 1;

        let syllableCount = 0;
        words.forEach(word => {
            syllableCount += this.countSyllables(word);
        });

        // Flesch Reading Ease formula:
        // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
        const avgWordsPerSentence = wordCount / sentenceCount;
        const avgSyllablesPerWord = syllableCount / wordCount;

        const fleschScore = Math.round(
            206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
        );

        // Clamp to 0-100
        const clampedScore = Math.max(0, Math.min(100, fleschScore));

        // Convert to grade level (Flesch-Kincaid Grade Level formula)
        // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
        const gradeLevel = Math.max(
            0,
            Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59)
        );

        // Interpret score
        let interpretation: string;
        if (clampedScore >= 90) {
            interpretation = 'Very easy (5th grade)';
        } else if (clampedScore >= 80) {
            interpretation = 'Easy (6th grade)';
        } else if (clampedScore >= 70) {
            interpretation = 'Fairly easy (7th grade)';
        } else if (clampedScore >= 60) {
            interpretation = 'Standard (8th-9th grade)';
        } else if (clampedScore >= 50) {
            interpretation = 'Fairly difficult (10th-12th grade)';
        } else if (clampedScore >= 30) {
            interpretation = 'Difficult (College level)';
        } else {
            interpretation = 'Very difficult (College graduate)';
        }

        return {
            fleschScore: clampedScore,
            grade: gradeLevel,
            interpretation
        };
    }

    /**
     * Count syllables in a word (simplified heuristic)
     */
    private countSyllables(word: string): number {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (word.length === 0) return 0;
        if (word.length <= 3) return 1;

        // Count vowel groups
        const vowels = 'aeiouy';
        let syllableCount = 0;
        let previousWasVowel = false;

        for (let i = 0; i < word.length; i++) {
            const isVowel = vowels.includes(word[i]);

            if (isVowel && !previousWasVowel) {
                syllableCount++;
            }

            previousWasVowel = isVowel;
        }

        // Adjust for silent 'e'
        if (word.endsWith('e') && syllableCount > 1) {
            syllableCount--;
        }

        // Ensure at least 1 syllable
        return Math.max(1, syllableCount);
    }

    /**
     * Calculate keyword density for target keywords
     */
    private calculateKeywordDensity(text: string, keywords: string[]): KeywordDensity[] {
        const lowerText = text.toLowerCase();
        const words = lowerText.split(/\s+/).filter(w => w.length > 0);
        const totalWords = words.length;

        if (totalWords === 0) {
            return [];
        }

        const densities: KeywordDensity[] = [];

        keywords.forEach(keyword => {
            const lowerKeyword = keyword.toLowerCase();

            // Count occurrences
            let count = 0;
            let firstPosition = -1;

            // Search for keyword (whole word or phrase)
            const keywordRegex = new RegExp(`\\b${this.escapeRegex(lowerKeyword)}\\b`, 'gi');
            const matches = lowerText.match(keywordRegex);
            count = matches?.length || 0;

            if (count > 0) {
                const firstMatch = lowerText.search(keywordRegex);
                firstPosition = firstMatch;
            }

            // Calculate density (percentage)
            const density = (count / totalWords) * 100;

            // Calculate prominence (0-100 based on first position)
            let prominence = 0;
            if (firstPosition >= 0) {
                prominence = Math.max(0, 100 - (firstPosition / text.length) * 100);
            }

            densities.push({
                keyword,
                count,
                density: parseFloat(density.toFixed(2)),
                prominence: Math.round(prominence),
                inTitle: false, // Would need title text to check
                inDescription: false, // Would need meta description to check
                inH1: false // Would need H1 text to check
            });
        });

        // Sort by count (descending)
        densities.sort((a, b) => b.count - a.count);

        return densities;
    }

    /**
     * Escape special regex characters
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Assess overall content quality
     */
    private assessContentQuality(doc: Document, textContent: string): ContentQuality {
        const issues: string[] = [];
        let score = 100;

        // Check text length
        const textLength = textContent.length;
        if (textLength < 500) {
            issues.push('Content is too short (< 500 characters)');
            score -= 30;
        } else if (textLength < 1500) {
            issues.push('Content is relatively short (< 1500 characters)');
            score -= 10;
        }

        // Check for boilerplate content (common phrases that indicate low quality)
        const boilerplatePatterns = [
            /lorem ipsum/i,
            /under construction/i,
            /coming soon/i,
            /click here to enter/i
        ];

        const hasBoilerplate = boilerplatePatterns.some(pattern => pattern.test(textContent));
        if (hasBoilerplate) {
            issues.push('Content contains boilerplate text');
            score -= 40;
        }

        // Calculate content-to-code ratio
        const htmlLength = doc.documentElement?.outerHTML?.length || 1;
        const contentToCodeRatio = (textLength / htmlLength) * 100;

        if (contentToCodeRatio < 10) {
            issues.push('Low content-to-code ratio (< 10%) - page is code-heavy');
            score -= 20;
        } else if (contentToCodeRatio < 20) {
            issues.push('Below average content-to-code ratio (< 20%)');
            score -= 10;
        }

        // Check for duplicate content (simplified - check for repeated paragraphs)
        const paragraphs = Array.from(doc.querySelectorAll('p'))
            .map(p => p.textContent?.trim())
            .filter(text => text && text.length > 50);

        const uniqueParagraphs = new Set(paragraphs);
        const hasDuplicateContent = paragraphs.length > uniqueParagraphs.size;

        if (hasDuplicateContent) {
            issues.push('Duplicate paragraphs detected within page');
            score -= 15;
        }

        return {
            hasDuplicateContent,
            hasBoilerplate,
            contentToCodeRatio: parseFloat(contentToCodeRatio.toFixed(2)),
            textLength,
            score: Math.max(0, score),
            issues
        };
    }
}

/**
 * Create and export singleton instance
 */
let analyzerInstance: ContentAnalyzer | null = null;

export function getContentAnalyzer(): ContentAnalyzer {
    if (!analyzerInstance) {
        analyzerInstance = new ContentAnalyzer();
    }
    return analyzerInstance;
}
