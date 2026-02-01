/**
 * Local KMS Provider
 *
 * Development-only provider using environment variable for key storage.
 * Supports key versioning via in-memory store (reset on restart).
 *
 * NOT FOR PRODUCTION USE - Use AWS/GCP/Azure KMS in production.
 */

import crypto from 'crypto';
import type { KMSProvider, KeyVersion } from './index';

interface StoredKeyVersion {
  key: Buffer;
  version: number;
  createdAt: Date;
  status: 'active' | 'disabled' | 'destroyed';
}

export class LocalKMSProvider implements KMSProvider {
  name = 'local';
  private keyVersions: Map<number, StoredKeyVersion> = new Map();
  private currentVersion: number = 1;

  constructor(initialKey?: string) {
    // Initialize with the provided key or environment variable
    const baseKey =
      initialKey || process.env.ENCRYPTION_KEY || 'default-dev-key-32-chars-exactly!!';

    // Ensure key is exactly 32 bytes for AES-256
    const keyBuffer = this.normalizeKey(baseKey);

    this.keyVersions.set(1, {
      key: keyBuffer,
      version: 1,
      createdAt: new Date(),
      status: 'active',
    });
  }

  private normalizeKey(key: string): Buffer {
    // Hash the key to ensure consistent 32-byte length
    if (key.length === 32) {
      return Buffer.from(key);
    }
    return crypto.createHash('sha256').update(key).digest();
  }

  async getDataKey(): Promise<Buffer> {
    const current = this.keyVersions.get(this.currentVersion);
    if (!current) {
      throw new Error(`Current key version ${this.currentVersion} not found`);
    }
    return current.key;
  }

  async getDataKeyVersion(version: number): Promise<Buffer | null> {
    const stored = this.keyVersions.get(version);
    if (!stored || stored.status === 'destroyed') {
      return null;
    }
    return stored.key;
  }

  async rotateDataKey(): Promise<{ version: number; rotatedAt: Date }> {
    // Generate new random key
    const newKey = crypto.randomBytes(32);
    const newVersion = this.currentVersion + 1;
    const rotatedAt = new Date();

    // Mark old version as disabled
    const oldVersion = this.keyVersions.get(this.currentVersion);
    if (oldVersion) {
      oldVersion.status = 'disabled';
    }

    // Store new version
    this.keyVersions.set(newVersion, {
      key: newKey,
      version: newVersion,
      createdAt: rotatedAt,
      status: 'active',
    });

    this.currentVersion = newVersion;

    return { version: newVersion, rotatedAt };
  }

  async listKeyVersions(): Promise<KeyVersion[]> {
    return Array.from(this.keyVersions.values()).map(({ version, createdAt, status }) => ({
      version,
      createdAt,
      status,
    }));
  }

  /**
   * Get current version number
   */
  getCurrentVersion(): number {
    return this.currentVersion;
  }
}
