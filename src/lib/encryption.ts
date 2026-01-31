/**
 * Encryption Module
 *
 * AES-256-GCM encryption with KMS-backed key management.
 * Supports versioned encryption and automatic key rotation.
 *
 * Format: "v{version}:{keyVersion}:{iv}:{authTag}:{ciphertext}"
 */

import crypto from 'crypto';
import { getKMSProvider } from './kms';

// Current encryption format version
const FORMAT_VERSION = 3;

// AES-256-GCM parameters
const GCM_ALGORITHM = 'aes-256-gcm';
const GCM_IV_LENGTH = 12; // 96 bits recommended for GCM
const GCM_AUTH_TAG_LENGTH = 16; // 128-bit auth tag

// Legacy support
const CBC_ALGORITHM = 'aes-256-cbc';
const CBC_IV_LENGTH = 16;

// Fallback key for legacy decryption
const LEGACY_KEY = process.env.ENCRYPTION_KEY || 'default-dev-key-32-chars-exactly!!';

/**
 * Encrypt plaintext using AES-256-GCM with KMS-backed key.
 *
 * Output format: "v3:{keyVersion}:{iv_hex}:{authTag_hex}:{ciphertext_hex}"
 *
 * @param text - Plaintext to encrypt
 * @returns Encrypted ciphertext with metadata
 */
export async function encryptAsync(text: string): Promise<string> {
  if (!text) return '';

  const kms = getKMSProvider();
  const key = await kms.getDataKey();
  const keyVersion = (kms as any).getCurrentVersion?.() || 1;

  const iv = crypto.randomBytes(GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv(GCM_ALGORITHM, key, iv, {
    authTagLength: GCM_AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `v${FORMAT_VERSION}:${keyVersion}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Synchronous encrypt (legacy compatibility).
 * Uses the current key from environment.
 */
export function encrypt(text: string): string {
  if (!text) return '';

  const key = normalizeKey(LEGACY_KEY);
  const iv = crypto.randomBytes(GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv(GCM_ALGORITHM, key, iv, {
    authTagLength: GCM_AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  // v2 format for sync (backward compatible)
  return `v2:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt ciphertext. Auto-detects format:
 *   - "v3:..." → KMS-backed GCM with key version
 *   - "v2:..." → Legacy GCM with env key
 *   - No prefix → Legacy CBC
 *
 * @param text - Ciphertext to decrypt
 * @returns Decrypted plaintext
 */
export async function decryptAsync(text: string): Promise<string> {
  if (!text) return '';

  // v3 format: KMS-backed with key versioning
  if (text.startsWith('v3:')) {
    return decryptV3(text);
  }

  // v2 format: GCM with env key
  if (text.startsWith('v2:')) {
    return decryptGCM(text);
  }

  // Legacy CBC format
  return decryptCBC(text);
}

/**
 * Synchronous decrypt (legacy compatibility).
 */
export function decrypt(text: string): string {
  if (!text) return '';

  if (text.startsWith('v3:')) {
    // v3 requires async - fall back to sync decryption attempt
    console.warn('[Encryption] v3 format requires async decryption');
    return decryptV3Sync(text);
  }

  if (text.startsWith('v2:')) {
    return decryptGCM(text);
  }

  return decryptCBC(text);
}

/**
 * Re-encrypt with latest key version.
 *
 * @param encryptedText - Existing ciphertext
 * @returns Re-encrypted ciphertext with latest key
 */
export async function reEncryptAsync(encryptedText: string): Promise<string> {
  if (!encryptedText) return '';
  const plaintext = await decryptAsync(encryptedText);
  return encryptAsync(plaintext);
}

/**
 * Synchronous re-encrypt (legacy compatibility).
 */
export function reEncrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  const plaintext = decrypt(encryptedText);
  return encrypt(plaintext);
}

/**
 * Check if ciphertext uses the current format version.
 */
export function isCurrentVersion(text: string): boolean {
  if (!text) return true;
  return text.startsWith(`v${FORMAT_VERSION}:`) || text.startsWith('v2:');
}

/**
 * Parse ciphertext metadata without decrypting.
 */
export function parseMetadata(text: string): {
  formatVersion: number;
  keyVersion?: number;
  algorithm: string;
} | null {
  if (!text) return null;

  if (text.startsWith('v3:')) {
    const parts = text.split(':');
    return {
      formatVersion: 3,
      keyVersion: parseInt(parts[1], 10),
      algorithm: 'AES-256-GCM',
    };
  }

  if (text.startsWith('v2:')) {
    return {
      formatVersion: 2,
      algorithm: 'AES-256-GCM',
    };
  }

  return {
    formatVersion: 1,
    algorithm: 'AES-256-CBC',
  };
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

function normalizeKey(key: string): Buffer {
  if (key.length === 32) {
    return Buffer.from(key);
  }
  return crypto.createHash('sha256').update(key).digest();
}

async function decryptV3(text: string): Promise<string> {
  // Format: "v3:{keyVersion}:{iv}:{authTag}:{ciphertext}"
  const parts = text.split(':');
  const keyVersion = parseInt(parts[1], 10);
  const iv = Buffer.from(parts[2], 'hex');
  const authTag = Buffer.from(parts[3], 'hex');
  const ciphertext = Buffer.from(parts[4], 'hex');

  const kms = getKMSProvider();
  const key = await kms.getDataKeyVersion(keyVersion);

  if (!key) {
    throw new Error(`Key version ${keyVersion} not found or destroyed`);
  }

  const decipher = crypto.createDecipheriv(GCM_ALGORITHM, key, iv, {
    authTagLength: GCM_AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

function decryptV3Sync(text: string): string {
  // Fallback for sync context - use legacy key
  const parts = text.split(':');
  const iv = Buffer.from(parts[2], 'hex');
  const authTag = Buffer.from(parts[3], 'hex');
  const ciphertext = Buffer.from(parts[4], 'hex');

  const key = normalizeKey(LEGACY_KEY);

  const decipher = crypto.createDecipheriv(GCM_ALGORITHM, key, iv, {
    authTagLength: GCM_AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

function decryptGCM(text: string): string {
  // Format: "v2:{iv}:{authTag}:{ciphertext}"
  const parts = text.split(':');
  const iv = Buffer.from(parts[1], 'hex');
  const authTag = Buffer.from(parts[2], 'hex');
  const ciphertext = Buffer.from(parts[3], 'hex');

  const key = normalizeKey(LEGACY_KEY);

  const decipher = crypto.createDecipheriv(GCM_ALGORITHM, key, iv, {
    authTagLength: GCM_AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

function decryptCBC(text: string): string {
  // Legacy format: "{iv_hex}:{ciphertext_hex}"
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');

  const key = normalizeKey(LEGACY_KEY);

  const decipher = crypto.createDecipheriv(CBC_ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
