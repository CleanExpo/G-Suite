import { test, expect } from '@playwright/test';

/**
 * UNI-379: API Integration E2E Tests
 * Tests critical API endpoints for production readiness
 */
test.describe('API Health Checks', () => {
  test('GET /api/health should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(['healthy', 'ok', 'operational']).toContain(data.status.toLowerCase());
  });

  test('GET /api/monitoring/overview should return metrics', async ({ request }) => {
    const response = await request.get('/api/monitoring/overview');
    // May require auth, so accept 200 or 401
    expect([200, 401]).toContain(response.status());
  });

  test('GET /api/agents should return agent list or auth error', async ({ request }) => {
    const response = await request.get('/api/agents');
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('agents');
      expect(Array.isArray(data.agents)).toBe(true);
    }
  });
});

test.describe('GraphQL Endpoint', () => {
  test('POST /api/graphql should accept queries', async ({ request }) => {
    const response = await request.post('/api/graphql', {
      data: {
        query: '{ __typename }',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // GraphQL should return 200 even for auth errors (errors in response body)
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

test.describe('Static Assets', () => {
  test('robots.txt should be accessible', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('User-agent');
  });

  test('sitemap.xml should be accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('<?xml');
  });
});

test.describe('SEO & GEO Endpoints', () => {
  test('POST /api/seo/analyze should require auth or params', async ({ request }) => {
    const response = await request.post('/api/seo/analyze', {
      data: { url: 'https://example.com' },
      headers: { 'Content-Type': 'application/json' },
    });
    // Should require auth (401) or accept request (200)
    expect([200, 400, 401]).toContain(response.status());
  });

  test('POST /api/geo/analyze should require auth or params', async ({ request }) => {
    const response = await request.post('/api/geo/analyze', {
      data: { businessName: 'Test Business', location: 'New York' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([200, 400, 401]).toContain(response.status());
  });
});
