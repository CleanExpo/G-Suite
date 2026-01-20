import { test, expect } from '@playwright/test';

test.describe('Content Orchestrator Flow', () => {
    test('should execute content planning mission', async ({ page }) => {
        // Navigate to new mission page
        await page.goto('/mission/new');

        // Select Content Orchestrator agent
        // Assuming there's a dropdown or selector for agent type
        const agentSelector = page.getByRole('combobox', { name: /agent/i });
        if (await agentSelector.isVisible()) {
            await agentSelector.click();
            await page.getByRole('option', { name: /content orchestrator/i }).click();
        }

        // Input mission details
        await page.getByPlaceholder(/describe your mission/i).fill('Write a blog post about AI Agents');

        // Submit
        await page.getByRole('button', { name: /start/i }).click();

        // Verify planning phase (assuming UI shows "Planning" or similar status)
        await expect(page.getByText(/planning|analyzing/i)).toBeVisible();

        // Wait for result (in a real E2E this might take time, or we mock the backend)
        // For now, we assert that the UI transitions to a processing state
        await expect(page.getByText(/executing/i)).toBeVisible({ timeout: 10000 });
    });
});
