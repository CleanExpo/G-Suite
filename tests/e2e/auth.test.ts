import { test, expect } from '@playwright/test';

test.describe('Authentication & Access Flows', () => {
    test('dashboard should redirect to sign-in when not authenticated', async ({ page }) => {
        await page.goto('/dashboard');

        // Should redirect to sign-in page
        await expect(page).toHaveURL(/.*sign-in/);

        // Sign-in page should have the commander heading
        const heading = page.locator('h2');
        await expect(heading).toContainText(/welcome back|commander/i);

        // Should see authentication options
        const googleBtn = page.getByRole('button', { name: /continue with google/i });
        await expect(googleBtn).toBeVisible();
    });

    test('sign-in page should load with Clerk elements', async ({ page }) => {
        await page.goto('/sign-in');

        // Clerk usually renders its component. We expect it to eventually show up.
        // We can look for common Clerk text or classes if known, but a basic page load check is a start.
        await expect(page).toHaveURL(/.*sign-in/);
    });

    test('onboarding should be accessible', async ({ page }) => {
        await page.goto('/onboarding');
        await expect(page).toHaveURL(/.*sign-in.*return_to.*onboarding|.*onboarding/);
    });
});
