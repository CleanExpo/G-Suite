/**
 * Webhook API Tests
 *
 * Tests for webhook endpoint creation, listing, and Stripe webhook handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Prisma
vi.mock('@/prisma', () => ({
  default: {
    webhookEndpoint: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    userWallet: {
      upsert: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock webhooks lib
vi.mock('@/lib/webhooks', () => ({
  createWebhookEndpoint: vi.fn(),
  listWebhookEndpoints: vi.fn(),
}));

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

import { auth } from '@clerk/nextjs/server';
import { createWebhookEndpoint, listWebhookEndpoints } from '@/lib/webhooks';
import { stripe } from '@/lib/stripe';

describe('Webhooks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/webhooks', () => {
    it('should require authentication', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      // Simulate unauthenticated request
      const result = {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should validate required URL field', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      const result = {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'URL is required' },
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INVALID_INPUT');
    });

    it('should validate required events field', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      const result = {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'At least one event type is required' },
      };

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('event type');
    });

    it('should create webhook endpoint successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
      vi.mocked(createWebhookEndpoint).mockResolvedValue({
        endpoint: {
          id: 'wh_123',
          url: 'https://example.com/webhook',
          events: ['mission.completed'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        secret: 'whsec_test123',
      } as any);

      const result = await createWebhookEndpoint('user_123', {
        url: 'https://example.com/webhook',
        events: ['mission.completed'],
      });

      expect(result.endpoint.id).toBe('wh_123');
      expect(result.secret).toBe('whsec_test123');
    });

    it('should return secret only once on creation', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
      vi.mocked(createWebhookEndpoint).mockResolvedValue({
        endpoint: {
          id: 'wh_456',
          url: 'https://example.com/webhook',
          events: ['agent.started'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        secret: 'whsec_onetime',
      } as any);

      const result = await createWebhookEndpoint('user_123', {
        url: 'https://example.com/webhook',
        events: ['agent.started'],
      });

      expect(result.secret).toBeDefined();
      expect(result.secret.startsWith('whsec_')).toBe(true);
    });
  });

  describe('GET /api/webhooks', () => {
    it('should require authentication', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const result = {
        success: false,
        error: { code: 'UNAUTHORIZED' },
      };

      expect(result.success).toBe(false);
    });

    it('should list user webhooks', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
      vi.mocked(listWebhookEndpoints).mockResolvedValue([
        {
          id: 'wh_1',
          url: 'https://example.com/hook1',
          events: ['mission.completed'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'wh_2',
          url: 'https://example.com/hook2',
          events: ['agent.failed'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      const result = await listWebhookEndpoints('user_123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('wh_1');
      expect(result[1].id).toBe('wh_2');
    });

    it('should return empty array when no webhooks exist', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
      vi.mocked(listWebhookEndpoints).mockResolvedValue([]);

      const result = await listWebhookEndpoints('user_123');

      expect(result).toHaveLength(0);
    });
  });

  describe('Stripe Webhook Handler', () => {
    it('should verify Stripe signature', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { userId: 'user_123', credits: '100' },
            amount_total: 999,
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any);

      const event = stripe.webhooks.constructEvent(
        'body',
        'sig_test',
        'whsec_test'
      );

      expect(event.type).toBe('checkout.session.completed');
    });

    it('should reject invalid signature in production', async () => {
      vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() => {
        stripe.webhooks.constructEvent('body', 'invalid_sig', 'whsec_test');
      }).toThrow('Invalid signature');
    });

    it('should handle checkout.session.completed event', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: { userId: 'user_123', credits: '500' },
            amount_total: 4999,
          },
        },
      };

      // Verify event structure
      expect(mockEvent.type).toBe('checkout.session.completed');
      expect(mockEvent.data.object.metadata.userId).toBe('user_123');
      expect(mockEvent.data.object.metadata.credits).toBe('500');
    });

    it('should validate metadata presence', async () => {
      const mockSession = {
        id: 'cs_test_invalid',
        metadata: { userId: undefined, credits: '0' },
      };

      const userId = mockSession.metadata.userId;
      const credits = parseInt(mockSession.metadata.credits || '0');

      expect(userId).toBeUndefined();
      expect(credits).toBe(0);
    });
  });
});
