/**
 * Encryption Module Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock KMS provider
vi.mock('@/lib/kms', () => {
  const testKey = Buffer.from('test-key-32-characters-exactly!!');
  return {
    getKMSProvider: () => ({
      name: 'mock',
      getDataKey: vi.fn().mockResolvedValue(testKey),
      getDataKeyVersion: vi.fn().mockImplementation((version: number) => {
        if (version <= 2) return Promise.resolve(testKey);
        return Promise.resolve(null);
      }),
      getCurrentVersion: vi.fn().mockReturnValue(1),
    }),
  };
});

import {
  encrypt,
  decrypt,
  encryptAsync,
  decryptAsync,
  reEncrypt,
  reEncryptAsync,
  isCurrentVersion,
  parseMetadata,
} from '@/lib/encryption';

describe('Encryption Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('encrypt (synchronous)', () => {
    it('should encrypt plaintext', () => {
      const plaintext = 'Hello, World!';
      const ciphertext = encrypt(plaintext);

      expect(ciphertext).toBeTruthy();
      expect(ciphertext).not.toBe(plaintext);
      expect(ciphertext.startsWith('v2:')).toBe(true);
    });

    it('should return empty string for empty input', () => {
      expect(encrypt('')).toBe('');
    });

    it('should produce different ciphertext each time (random IV)', () => {
      const plaintext = 'Same message';
      const ciphertext1 = encrypt(plaintext);
      const ciphertext2 = encrypt(plaintext);

      expect(ciphertext1).not.toBe(ciphertext2);
    });

    it('should produce valid v2 format', () => {
      const ciphertext = encrypt('Test');
      const parts = ciphertext.split(':');

      expect(parts[0]).toBe('v2');
      expect(parts.length).toBe(4); // v2:iv:authTag:ciphertext
    });
  });

  describe('decrypt (synchronous)', () => {
    it('should decrypt v2 format ciphertext', () => {
      const plaintext = 'Hello, World!';
      const ciphertext = encrypt(plaintext);
      const decrypted = decrypt(ciphertext);

      expect(decrypted).toBe(plaintext);
    });

    it('should return empty string for empty input', () => {
      expect(decrypt('')).toBe('');
    });

    it('should handle special characters', () => {
      const plaintext = '🎉 Special chars: àéïõü & symbols!@#$%^&*()';
      const ciphertext = encrypt(plaintext);
      const decrypted = decrypt(ciphertext);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode text', () => {
      const plaintext = '日本語テスト 中文测试 한국어테스트';
      const ciphertext = encrypt(plaintext);
      const decrypted = decrypt(ciphertext);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long text', () => {
      const plaintext = 'A'.repeat(10000);
      const ciphertext = encrypt(plaintext);
      const decrypted = decrypt(ciphertext);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('encryptAsync', () => {
    it('should encrypt with v3 format', async () => {
      const plaintext = 'Async encryption test';
      const ciphertext = await encryptAsync(plaintext);

      expect(ciphertext.startsWith('v3:')).toBe(true);
    });

    it('should return empty string for empty input', async () => {
      expect(await encryptAsync('')).toBe('');
    });

    it('should include key version in output', async () => {
      const ciphertext = await encryptAsync('Test');
      const parts = ciphertext.split(':');

      expect(parts[0]).toBe('v3');
      expect(parts[1]).toBe('1'); // Key version
    });
  });

  describe('decryptAsync', () => {
    it('should decrypt v3 format', async () => {
      const plaintext = 'Async test';
      const ciphertext = await encryptAsync(plaintext);
      const decrypted = await decryptAsync(ciphertext);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt v2 format', async () => {
      const plaintext = 'Legacy test';
      const ciphertext = encrypt(plaintext);
      const decrypted = await decryptAsync(ciphertext);

      expect(decrypted).toBe(plaintext);
    });

    it('should return empty string for empty input', async () => {
      expect(await decryptAsync('')).toBe('');
    });
  });

  describe('reEncrypt', () => {
    it('should re-encrypt with current format', () => {
      const plaintext = 'Original message';
      const ciphertext = encrypt(plaintext);
      const reEncrypted = reEncrypt(ciphertext);

      expect(reEncrypted).not.toBe(ciphertext);
      expect(decrypt(reEncrypted)).toBe(plaintext);
    });

    it('should return empty string for empty input', () => {
      expect(reEncrypt('')).toBe('');
    });
  });

  describe('reEncryptAsync', () => {
    it('should re-encrypt to v3 format', async () => {
      const plaintext = 'Original message';
      const ciphertext = encrypt(plaintext);
      const reEncrypted = await reEncryptAsync(ciphertext);

      expect(reEncrypted.startsWith('v3:')).toBe(true);
      expect(await decryptAsync(reEncrypted)).toBe(plaintext);
    });
  });

  describe('isCurrentVersion', () => {
    it('should return true for v3 format', () => {
      expect(isCurrentVersion('v3:1:abc:def:ghi')).toBe(true);
    });

    it('should return true for v2 format', () => {
      expect(isCurrentVersion('v2:abc:def:ghi')).toBe(true);
    });

    it('should return false for v1/legacy format', () => {
      expect(isCurrentVersion('abc:def')).toBe(false);
    });

    it('should return true for empty input', () => {
      expect(isCurrentVersion('')).toBe(true);
    });
  });

  describe('parseMetadata', () => {
    it('should parse v3 metadata', () => {
      const metadata = parseMetadata('v3:2:iv:tag:cipher');

      expect(metadata?.formatVersion).toBe(3);
      expect(metadata?.keyVersion).toBe(2);
      expect(metadata?.algorithm).toBe('AES-256-GCM');
    });

    it('should parse v2 metadata', () => {
      const metadata = parseMetadata('v2:iv:tag:cipher');

      expect(metadata?.formatVersion).toBe(2);
      expect(metadata?.keyVersion).toBeUndefined();
      expect(metadata?.algorithm).toBe('AES-256-GCM');
    });

    it('should parse legacy metadata', () => {
      const metadata = parseMetadata('iv:cipher');

      expect(metadata?.formatVersion).toBe(1);
      expect(metadata?.algorithm).toBe('AES-256-CBC');
    });

    it('should return null for empty input', () => {
      expect(parseMetadata('')).toBeNull();
    });
  });

  describe('Round-trip encryption', () => {
    it('should handle JSON data', () => {
      const data = { user: 'test', roles: ['admin', 'user'], active: true };
      const json = JSON.stringify(data);
      const encrypted = encrypt(json);
      const decrypted = decrypt(encrypted);

      expect(JSON.parse(decrypted)).toEqual(data);
    });

    it('should handle API keys and secrets', () => {
      const secret = 'sk_live_1234567890abcdef';
      const encrypted = encrypt(secret);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(secret);
    });
  });
});
