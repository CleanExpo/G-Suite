/**
 * Key Management Service (KMS) Abstraction
 *
 * Provides a unified interface for key management across:
 * - Local development (environment variable)
 * - AWS KMS
 * - GCP Cloud KMS
 * - Azure Key Vault
 *
 * @module lib/kms
 */

export interface KMSProvider {
  /** Provider name for logging */
  name: string;

  /** Get the current data encryption key */
  getDataKey(): Promise<Buffer>;

  /** Get a specific version of the data key */
  getDataKeyVersion(version: number): Promise<Buffer | null>;

  /** Rotate the data key and return the new version */
  rotateDataKey(): Promise<{ version: number; rotatedAt: Date }>;

  /** List all key versions */
  listKeyVersions(): Promise<KeyVersion[]>;
}

export interface KeyVersion {
  version: number;
  createdAt: Date;
  status: 'active' | 'disabled' | 'destroyed';
}

export interface KMSConfig {
  provider: 'local' | 'aws' | 'gcp' | 'azure';
  /** For local provider */
  localKey?: string;
  /** For AWS KMS */
  awsKeyId?: string;
  awsRegion?: string;
  /** For GCP KMS */
  gcpKeyName?: string;
  gcpProjectId?: string;
  /** For Azure Key Vault */
  azureVaultUrl?: string;
  azureKeyName?: string;
}

// Re-export implementations
export { LocalKMSProvider } from './local-provider';
export { createKMSProvider, getKMSProvider } from './factory';
