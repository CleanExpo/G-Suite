/**
 * Token Tracker Tests
 *
 * Phase 9.2: Tests for per-agent token usage tracking.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TokenTracker, wrapGeminiModel } from '@/lib/telemetry/token-tracker';

describe('TokenTracker', () => {
  let tracker: TokenTracker;

  beforeEach(() => {
    tracker = new TokenTracker();
  });

  describe('recordGemini', () => {
    it('should record token usage from Gemini response', () => {
      const mockResponse = {
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150,
        },
      };

      tracker.recordGemini(mockResponse, 'gemini-3-flash');

      const usage = tracker.getUsage();
      expect(usage.promptTokens).toBe(100);
      expect(usage.completionTokens).toBe(50);
      expect(usage.totalTokens).toBe(150);
      expect(usage.model).toBe('gemini-3-flash');
    });

    it('should accumulate tokens across multiple calls', () => {
      tracker.recordGemini({
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 },
      });
      tracker.recordGemini({
        usageMetadata: { promptTokenCount: 200, candidatesTokenCount: 100 },
      });

      const usage = tracker.getUsage();
      expect(usage.promptTokens).toBe(300);
      expect(usage.completionTokens).toBe(150);
      expect(usage.totalTokens).toBe(450);
    });

    it('should handle missing usageMetadata gracefully', () => {
      tracker.recordGemini({});

      const usage = tracker.getUsage();
      expect(usage.promptTokens).toBe(0);
      expect(usage.completionTokens).toBe(0);
      expect(usage.totalTokens).toBe(0);
    });
  });

  describe('recordOpenAI', () => {
    it('should record token usage from OpenAI response', () => {
      const mockResponse = {
        usage: {
          prompt_tokens: 75,
          completion_tokens: 125,
          total_tokens: 200,
        },
      };

      tracker.recordOpenAI(mockResponse, 'gpt-4');

      const usage = tracker.getUsage();
      expect(usage.promptTokens).toBe(75);
      expect(usage.completionTokens).toBe(125);
      expect(usage.totalTokens).toBe(200);
      expect(usage.model).toBe('gpt-4');
    });

    it('should handle missing usage gracefully', () => {
      tracker.recordOpenAI({});

      const usage = tracker.getUsage();
      expect(usage.totalTokens).toBe(0);
    });
  });

  describe('record', () => {
    it('should allow manual token recording', () => {
      tracker.record(500, 300, 'custom-model');

      const usage = tracker.getUsage();
      expect(usage.promptTokens).toBe(500);
      expect(usage.completionTokens).toBe(300);
      expect(usage.totalTokens).toBe(800);
      expect(usage.model).toBe('custom-model');
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost based on token usage', () => {
      tracker.record(1000, 500);

      // 1500 tokens at 1000 tokens per credit = 2 credits
      const cost = tracker.estimateCost();
      expect(cost).toBe(2);
    });

    it('should return 0 for no tokens', () => {
      expect(tracker.estimateCost()).toBe(0);
    });

    it('should round up partial credits', () => {
      tracker.record(100, 100); // 200 tokens = 0.2 credits, rounds to 1
      expect(tracker.estimateCost()).toBe(1);
    });
  });

  describe('reset', () => {
    it('should clear all accumulated data', () => {
      tracker.record(1000, 500, 'test-model');
      tracker.reset();

      const usage = tracker.getUsage();
      expect(usage.promptTokens).toBe(0);
      expect(usage.completionTokens).toBe(0);
      expect(usage.totalTokens).toBe(0);
      expect(usage.model).toBeUndefined();
    });
  });

  describe('mixed provider usage', () => {
    it('should accumulate tokens from different providers', () => {
      tracker.recordGemini({
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 },
      });
      tracker.recordOpenAI({
        usage: { prompt_tokens: 200, completion_tokens: 100 },
      });
      tracker.record(50, 25);

      const usage = tracker.getUsage();
      expect(usage.promptTokens).toBe(350);
      expect(usage.completionTokens).toBe(175);
      expect(usage.totalTokens).toBe(525);
    });
  });
});

describe('wrapGeminiModel', () => {
  it('should wrap generateContent and track tokens', async () => {
    const tracker = new TokenTracker();

    const mockModel = {
      generateContent: async () => ({
        response: {
          text: () => 'Hello world',
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 5,
          },
        },
      }),
    };

    const wrappedModel = wrapGeminiModel(mockModel, tracker, 'test-model');
    await wrappedModel.generateContent('test prompt');

    const usage = tracker.getUsage();
    expect(usage.promptTokens).toBe(10);
    expect(usage.completionTokens).toBe(5);
    expect(usage.model).toBe('test-model');
  });

  it('should preserve original response', async () => {
    const tracker = new TokenTracker();

    const mockModel = {
      generateContent: async () => ({
        response: {
          text: () => 'Original response text',
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 3 },
        },
      }),
    };

    const wrappedModel = wrapGeminiModel(mockModel, tracker);
    const result = await wrappedModel.generateContent('test');

    expect(result.response.text()).toBe('Original response text');
  });
});
