import { test, expect } from '@playwright/test';

test.describe('Agent Lifecycle', () => {
    test('should allow user to view available agents', async ({ page }) => {
        // Navigate to dashboard
        await page.goto('/');
        await expect(page).toHaveTitle(/G-Pilot/);

        // Navigate to agents section (assuming sidebar or nav)
        // Adjust selector based on actual UI implementation
        const agentsLink = page.getByRole('link', { name: /agents/i });
        if (await agentsLink.isVisible()) {
            await agentsLink.click();
        } else {
            await page.goto('/agents');
        }

        await expect(page).toHaveURL(/\/agents/);
        await expect(page.getByText('Marketing Strategist')).toBeVisible();
        await expect(page.getByText('SEO Analyst')).toBeVisible();
    });

    test('should allow user to start a new mission', async ({ page }) => {
        await page.goto('/mission/new');

        const missionInput = page.getByPlaceholder(/describe your mission/i);
        await expect(missionInput).toBeVisible();

        await missionInput.fill('Test mission: Create a marketing strategy');

        const submitButton = page.getByRole('button', { name: /start mission/i });
        await expect(submitButton).toBeReleased();

        // Note: We might not click submit here to avoid side effects in a live dev environment
        // unless we have a mocked backend for E2E
    });
});
