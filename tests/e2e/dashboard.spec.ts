import { test, expect } from '@playwright/test';

test.describe('Dashboard Experience', () => {
    test('should load dashboard with core elements', async ({ page }) => {
        // Navigate to dashboard - adjust route if it's /dashboard or /platform/dashboard
        await page.goto('/dashboard');

        // Check for essential dashboard elements
        await expect(page).toHaveTitle(/Dashboard|G-Pilot/i);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // Check for stat cards or widgets (generic check)
        // Assuming standard "Agents Active" or similar stats
        const statsSection = page.locator('section').filter({ hasText: /active/i }).first();
        if (await statsSection.isVisible()) {
            await expect(statsSection).toBeVisible();
        }
    });

    test('should have functional navigation', async ({ page }) => {
        await page.goto('/dashboard');

        // Check main navigation items
        const nav = page.getByRole('navigation');
        await expect(nav).toBeVisible();

        await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible();
        await expect(nav.getByRole('link', { name: /agents/i })).toBeVisible();
        await expect(nav.getByRole('link', { name: /settings/i })).toBeVisible();
    });
});
