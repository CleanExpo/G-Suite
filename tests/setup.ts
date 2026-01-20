import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/dom';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock environment variables
vi.stubEnv('GOOGLE_AI_STUDIO_API_KEY', 'test-api-key');
vi.stubEnv('GOOGLE_API_KEY', 'test-api-key');
vi.stubEnv('GOOGLE_CLIENT_EMAIL', 'test@test.iam.gserviceaccount.com');
vi.stubEnv('GOOGLE_PRIVATE_KEY', '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

// Global test utilities
global.fetch = vi.fn();

// Console spy for agent logs
vi.spyOn(console, 'log').mockImplementation(() => { });
vi.spyOn(console, 'error').mockImplementation(() => { });
vi.spyOn(console, 'warn').mockImplementation(() => { });
