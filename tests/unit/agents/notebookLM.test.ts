/**
 * NotebookLM Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock puppeteer
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn().mockResolvedValue(undefined),
        waitForSelector: vi.fn().mockResolvedValue(undefined),
        click: vi.fn().mockResolvedValue(undefined),
        type: vi.fn().mockResolvedValue(undefined),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock billing gate
vi.mock('@/billing/costGate', () => ({
  billingGate: vi.fn().mockResolvedValue(undefined),
}));

import { runNotebookLMAgent } from '@/agents/notebookLM';
import { billingGate } from '@/billing/costGate';

describe('NotebookLM Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runNotebookLMAgent', () => {
    it('should check billing gate before execution', async () => {
      const result = await runNotebookLMAgent('clerk_123', '/path/to/file.pdf');

      expect(billingGate).toHaveBeenCalledWith('clerk_123', 'DEEP_RESEARCH');
    });

    it('should return session status', async () => {
      const result = await runNotebookLMAgent('clerk_123', '/path/to/file.pdf');

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('sessionUrl');
      expect(result.sessionUrl).toContain('notebooklm.google.com');
    });

    it('should launch puppeteer in headless mode', async () => {
      const puppeteer = await import('puppeteer');
      await runNotebookLMAgent('clerk_123', '/path/to/file.pdf');

      expect(puppeteer.default.launch).toHaveBeenCalledWith(
        expect.objectContaining({
          headless: true,
          args: expect.arrayContaining(['--no-sandbox'])
        })
      );
    });

    it('should navigate to NotebookLM URL', async () => {
      const puppeteer = await import('puppeteer');
      const mockBrowser = await puppeteer.default.launch();
      const mockPage = await mockBrowser.newPage();

      await runNotebookLMAgent('clerk_123', '/path/to/file.pdf');

      expect(mockPage.goto).toHaveBeenCalledWith(
        'https://notebooklm.google.com/',
        expect.objectContaining({ waitUntil: 'networkidle2' })
      );
    });

    it('should close browser after execution', async () => {
      const puppeteer = await import('puppeteer');
      const mockBrowser = await puppeteer.default.launch();

      await runNotebookLMAgent('clerk_123', '/path/to/file.pdf');

      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const puppeteer = await import('puppeteer');
      vi.mocked(puppeteer.default.launch).mockRejectedValueOnce(new Error('Browser launch failed'));

      await expect(runNotebookLMAgent('clerk_123', '/path/to/file.pdf'))
        .rejects.toThrow('Browser launch failed');
    });
  });
});
