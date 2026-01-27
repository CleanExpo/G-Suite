import crypto from 'crypto';

// Master key from environment (32 bytes for AES-256)
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default-dev-key-32-chars-exactly!!';

// Current encryption version
const CURRENT_VERSION = 2;

// ─── AES-256-GCM (v2+) ─────────────────────────────────────────────────────
const GCM_ALGORITHM = 'aes-256-gcm';
const GCM_IV_LENGTH = 12;   // 96 bits recommended for GCM
const GCM_AUTH_TAG_LENGTH = 16; // 128-bit auth tag

// ─── Legacy AES-256-CBC (v1) ────────────────────────────────────────────────
const CBC_ALGORITHM = 'aes-256-cbc';
const CBC_IV_LENGTH = 16;

/**
 * Encrypt plaintext using AES-256-GCM (versioned format).
 * Output: "v2:{iv_hex}:{authTag_hex}:{ciphertext_hex}"
 */
export function encrypt(text: string): string {
  if (!text) return '';

  const iv = crypto.randomBytes(GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv(GCM_ALGORITHM, Buffer.from(SECRET_KEY), iv, {
    authTagLength: GCM_AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `v${CURRENT_VERSION}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt ciphertext. Auto-detects format:
 *   - "v2:..." → AES-256-GCM decryption
 *   - No "v" prefix → Legacy AES-256-CBC decryption
 */
export function decrypt(text: string): string {
  if (!text) return '';

  // Detect versioned format
  if (text.startsWith('v2:')) {
    return decryptGCM(text);
  }

  // Legacy CBC format: "{iv_hex}:{ciphertext_hex}"
  return decryptCBC(text);
}

/**
 * Re-encrypt: decrypt with whatever format, re-encrypt with latest GCM.
 * Returns the new ciphertext or empty string if input is empty.
 */
export function reEncrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  const plaintext = decrypt(encryptedText);
  return encrypt(plaintext);
}

/**
 * Check if a ciphertext is using the latest encryption version.
 */
export function isCurrentVersion(text: string): boolean {
  if (!text) return true;
  return text.startsWith(`v${CURRENT_VERSION}:`);
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

function decryptGCM(text: string): string {
  // Format: "v2:{iv}:{authTag}:{ciphertext}"
  const parts = text.split(':');
  // parts[0] = "v2", parts[1] = iv, parts[2] = authTag, parts[3] = ciphertext
  const iv = Buffer.from(parts[1], 'hex');
  const authTag = Buffer.from(parts[2], 'hex');
  const ciphertext = Buffer.from(parts[3], 'hex');

  const decipher = crypto.createDecipheriv(GCM_ALGORITHM, Buffer.from(SECRET_KEY), iv, {
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
  const decipher = crypto.createDecipheriv(CBC_ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
