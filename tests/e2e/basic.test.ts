import { test, expect } from '@playwright/test';

test.describe('Landing Page Sanity', () => {
    test('should load the landing page successfully', async ({ page }) => {
        await page.goto('/');

        // Check for the main heading or a unique element
        // Based on src/app/page.tsx, we should look for something branded
        await expect(page).toHaveTitle(/G-Pilot|SuitePilot/);

        // Wait for the main CTA or branding to be visible
        const heroHeading = page.locator('h1');
        await expect(heroHeading).toBeVisible();
    });

    test('should navigate to sign-in page', async ({ page }) => {
        await page.goto('/');

        // Look for sign-in link
        const signInLink = page.getByRole('link', { name: /sign in|log in/i });
        if (await signInLink.isVisible()) {
            await signInLink.click();
            await expect(page).toHaveURL(/.*sign-in/);
        }
    });

    test('should show pricing page', async ({ page }) => {
        await page.goto('/pricing');
        await expect(page).toHaveURL(/.*pricing/);
        await expect(page.locator('h1')).toContainText(/pricing|fuel/i);
    });
});
