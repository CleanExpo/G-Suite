import { test, expect } from '@playwright/test';

test.describe('Mission Overseer Lifecycle', () => {
    test('should coordinate complex multi-agent mission', async ({ page }) => {
        await page.goto('/mission/new');

        // Select Mission Overseer (or auto-detection)
        // For this test, we assume we explicitly select the Overseer or a mode that triggers it
        const agentSelector = page.getByRole('combobox', { name: /agent/i });
        if (await agentSelector.isVisible()) {
            await agentSelector.click();
            await page.getByRole('option', { name: /mission overseer|auto-pilot/i }).click();
        }

        // Input complex mission
        await page.getByPlaceholder(/describe your mission/i).fill('Launch a full marketing campaign for G-Pilot with SEO and Social Media');
        await page.getByRole('button', { name: /start/i }).click();

        // Verify Analysis Phase
        await expect(page.getByText(/analyzing mission/i)).toBeVisible();

        // Verify Delegation (should see sub-agents appearing)
        // This assumes the UI displays active agents in the mission view
        await expect(page.getByText(/delegating to marketing-strategist/i)).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(/delegating to seo-analyst/i)).toBeVisible({ timeout: 15000 });

        // Verify Completion
        await expect(page.getByText(/mission complete/i)).toBeVisible({ timeout: 60000 });
    });
});
