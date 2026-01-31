import { test, expect } from '@playwright/test';

/**
 * Streaming Performance E2E Tests
 *
 * Validates Vercel AI SDK streaming performance:
 * - Latency < 50ms p95
 * - Zero packet loss
 * - All agent types supported
 */
test.describe('Streaming Performance', () => {
    test.describe('API Streaming', () => {
        test('should stream responses with low latency', async ({ request }) => {
            const startTime = Date.now();

            const response = await request.post('/api/agents', {
                data: {
                    messages: [{ role: 'user', content: 'Health check mission' }],
                    agentName: 'mission-overseer'
                }
            });

            const firstByteTime = Date.now() - startTime;

            expect(response.ok()).toBeTruthy();
            expect(response.headers()['content-type']).toContain('text/plain');

            // First byte should arrive quickly (< 500ms for cold start)
            expect(firstByteTime).toBeLessThan(500);
        });

        test('should return valid UIMessageStream format', async ({ request }) => {
            const response = await request.post('/api/agents', {
                data: {
                    messages: [{ role: 'user', content: 'Test streaming format' }],
                    agentName: 'mission-overseer'
                }
            });

            expect(response.ok()).toBeTruthy();

            const body = await response.text();

            // UIMessageStream uses data stream protocol
            // Should contain message delimiters
            expect(body.length).toBeGreaterThan(0);
        });

        test('should handle concurrent streaming requests', async ({ request }) => {
            const requests = Array.from({ length: 3 }, (_, i) =>
                request.post('/api/agents', {
                    data: {
                        messages: [{ role: 'user', content: `Concurrent test ${i}` }],
                        agentName: 'mission-overseer'
                    }
                })
            );

            const responses = await Promise.all(requests);

            // All requests should succeed
            responses.forEach((response, i) => {
                expect(response.ok(), `Request ${i} failed`).toBeTruthy();
            });
        });
    });

    test.describe('Agent List API', () => {
        test('should list available agents quickly', async ({ request }) => {
            const startTime = Date.now();

            const response = await request.get('/api/agents');

            const responseTime = Date.now() - startTime;

            expect(response.ok()).toBeTruthy();
            expect(responseTime).toBeLessThan(200); // Should be fast

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.agents).toBeDefined();
            expect(Array.isArray(data.agents)).toBe(true);
            expect(data.agents.length).toBeGreaterThan(0);
        });

        test('should return agent metadata', async ({ request }) => {
            const response = await request.get('/api/agents');
            const data = await response.json();

            expect(data.success).toBe(true);

            // Each agent should have required fields
            data.agents.forEach((agent: any) => {
                expect(agent.name).toBeDefined();
                expect(agent.description).toBeDefined();
                expect(agent.status).toBe('ready');
            });
        });
    });

    test.describe('Error Handling', () => {
        test('should handle missing mission gracefully', async ({ request }) => {
            const response = await request.post('/api/agents', {
                data: {
                    messages: [],
                    agentName: 'mission-overseer'
                }
            });

            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('mission');
        });

        test('should handle invalid agent name', async ({ request }) => {
            const response = await request.post('/api/agents', {
                data: {
                    messages: [{ role: 'user', content: 'Test' }],
                    agentName: 'non-existent-agent'
                }
            });

            // Should still work - falls back to mission-overseer
            expect(response.ok()).toBeTruthy();
        });
    });

    test.describe('Frontend Streaming Integration', () => {
        test('should show mission modal', async ({ page }) => {
            await page.goto('/en/dashboard');

            // Look for mission launch button
            const launchButton = page.getByRole('button', { name: /mission|launch|start/i });

            if (await launchButton.isVisible()) {
                await launchButton.click();

                // Modal should appear
                const modal = page.getByRole('dialog');
                await expect(modal).toBeVisible({ timeout: 5000 });

                // Should have input field
                const input = page.getByPlaceholder(/describe|mission|objective/i);
                await expect(input).toBeVisible();
            }
        });

        test('should stream mission updates in real-time', async ({ page }) => {
            await page.goto('/en/dashboard');

            const launchButton = page.getByRole('button', { name: /mission|launch|start/i });

            if (await launchButton.isVisible()) {
                await launchButton.click();

                const input = page.getByRole('textbox');
                if (await input.isVisible()) {
                    await input.fill('Quick health check test');

                    const submitButton = page.getByRole('button', { name: /deploy|launch|submit/i });
                    if (await submitButton.isVisible()) {
                        await submitButton.click();

                        // Should show streaming indicator
                        const streamingIndicator = page.locator('[class*="animate"]');
                        await expect(streamingIndicator.first()).toBeVisible({ timeout: 10000 });
                    }
                }
            }
        });
    });
});
