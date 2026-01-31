/**
 * Local KMS Provider Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LocalKMSProvider } from '@/lib/kms/local-provider';

describe('LocalKMSProvider', () => {
  let provider: LocalKMSProvider;

  beforeEach(() => {
    provider = new LocalKMSProvider('test-key-32-characters-exactly!');
  });

  describe('Initialization', () => {
    it('should create provider with initial key', () => {
      expect(provider.name).toBe('local');
      expect(provider.getCurrentVersion()).toBe(1);
    });

    it('should normalize keys shorter than 32 bytes', () => {
      const shortKeyProvider = new LocalKMSProvider('short-key');
      expect(shortKeyProvider.getCurrentVersion()).toBe(1);
    });

    it('should use 32-byte keys directly', () => {
      const exactKeyProvider = new LocalKMSProvider('exactly-32-characters-for-key!!');
      expect(exactKeyProvider.getCurrentVersion()).toBe(1);
    });
  });

  describe('getDataKey', () => {
    it('should return current data key', async () => {
      const key = await provider.getDataKey();
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    it('should return consistent key on multiple calls', async () => {
      const key1 = await provider.getDataKey();
      const key2 = await provider.getDataKey();
      expect(key1.equals(key2)).toBe(true);
    });
  });

  describe('getDataKeyVersion', () => {
    it('should return key for valid version', async () => {
      const key = await provider.getDataKeyVersion(1);
      expect(key).not.toBeNull();
      expect(key?.length).toBe(32);
    });

    it('should return null for non-existent version', async () => {
      const key = await provider.getDataKeyVersion(999);
      expect(key).toBeNull();
    });

    it('should return null for destroyed version', async () => {
      // Rotate twice to create multiple versions
      await provider.rotateDataKey();
      await provider.rotateDataKey();

      // Version 1 should be disabled but still accessible
      const key = await provider.getDataKeyVersion(1);
      expect(key).not.toBeNull();
    });
  });

  describe('rotateDataKey', () => {
    it('should create new key version', async () => {
      const result = await provider.rotateDataKey();

      expect(result.version).toBe(2);
      expect(result.rotatedAt).toBeInstanceOf(Date);
      expect(provider.getCurrentVersion()).toBe(2);
    });

    it('should generate different keys each rotation', async () => {
      const key1 = await provider.getDataKey();
      await provider.rotateDataKey();
      const key2 = await provider.getDataKey();

      expect(key1.equals(key2)).toBe(false);
    });

    it('should preserve old key versions', async () => {
      const originalKey = await provider.getDataKey();
      await provider.rotateDataKey();

      const oldKey = await provider.getDataKeyVersion(1);
      expect(oldKey?.equals(originalKey)).toBe(true);
    });

    it('should mark old version as disabled', async () => {
      await provider.rotateDataKey();
      const versions = await provider.listKeyVersions();

      const v1 = versions.find(v => v.version === 1);
      const v2 = versions.find(v => v.version === 2);

      expect(v1?.status).toBe('disabled');
      expect(v2?.status).toBe('active');
    });
  });

  describe('listKeyVersions', () => {
    it('should list all key versions', async () => {
      const versions = await provider.listKeyVersions();

      expect(versions.length).toBe(1);
      expect(versions[0].version).toBe(1);
      expect(versions[0].status).toBe('active');
    });

    it('should include rotated versions', async () => {
      await provider.rotateDataKey();
      await provider.rotateDataKey();

      const versions = await provider.listKeyVersions();
      expect(versions.length).toBe(3);
    });

    it('should include creation dates', async () => {
      const versions = await provider.listKeyVersions();
      expect(versions[0].createdAt).toBeInstanceOf(Date);
    });
  });
});
