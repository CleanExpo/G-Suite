/**
 * KMS Provider Factory
 *
 * Creates the appropriate KMS provider based on environment configuration.
 * Singleton pattern ensures consistent key management across the application.
 */

import type { KMSProvider, KMSConfig } from './index';
import { LocalKMSProvider } from './local-provider';

let kmsInstance: KMSProvider | null = null;

/**
 * Create a KMS provider based on configuration.
 *
 * @param config - KMS configuration
 * @returns KMS provider instance
 */
export function createKMSProvider(config: KMSConfig): KMSProvider {
  switch (config.provider) {
    case 'local':
      return new LocalKMSProvider(config.localKey);

    case 'aws':
      // AWS KMS integration placeholder
      // TODO: Implement when @aws-sdk/client-kms is added
      console.warn('[KMS] AWS KMS not implemented, falling back to local');
      return new LocalKMSProvider(config.localKey);

    case 'gcp':
      // GCP Cloud KMS integration placeholder
      // TODO: Implement when @google-cloud/kms is added
      console.warn('[KMS] GCP KMS not implemented, falling back to local');
      return new LocalKMSProvider(config.localKey);

    case 'azure':
      // Azure Key Vault integration placeholder
      // TODO: Implement when @azure/keyvault-keys is added
      console.warn('[KMS] Azure Key Vault not implemented, falling back to local');
      return new LocalKMSProvider(config.localKey);

    default:
      throw new Error(`Unknown KMS provider: ${config.provider}`);
  }
}

/**
 * Get the singleton KMS provider instance.
 * Auto-configures based on environment variables.
 *
 * Priority:
 * 1. AWS_KMS_KEY_ID → AWS KMS
 * 2. GCP_KMS_KEY_NAME → GCP Cloud KMS
 * 3. AZURE_VAULT_URL → Azure Key Vault
 * 4. ENCRYPTION_KEY → Local provider
 *
 * @returns Configured KMS provider
 */
export function getKMSProvider(): KMSProvider {
  if (kmsInstance) {
    return kmsInstance;
  }

  // Auto-detect provider from environment
  const config: KMSConfig = detectKMSConfig();

  kmsInstance = createKMSProvider(config);

  console.log(`[KMS] Initialized with provider: ${kmsInstance.name}`);

  return kmsInstance;
}

/**
 * Detect KMS configuration from environment variables.
 */
function detectKMSConfig(): KMSConfig {
  // AWS KMS
  if (process.env.AWS_KMS_KEY_ID) {
    return {
      provider: 'aws',
      awsKeyId: process.env.AWS_KMS_KEY_ID,
      awsRegion: process.env.AWS_REGION || 'ap-southeast-2', // Sydney default
    };
  }

  // GCP Cloud KMS
  if (process.env.GCP_KMS_KEY_NAME) {
    return {
      provider: 'gcp',
      gcpKeyName: process.env.GCP_KMS_KEY_NAME,
      gcpProjectId: process.env.GCP_PROJECT_ID,
    };
  }

  // Azure Key Vault
  if (process.env.AZURE_VAULT_URL) {
    return {
      provider: 'azure',
      azureVaultUrl: process.env.AZURE_VAULT_URL,
      azureKeyName: process.env.AZURE_KEY_NAME,
    };
  }

  // Default to local
  return {
    provider: 'local',
    localKey: process.env.ENCRYPTION_KEY,
  };
}

/**
 * Reset the KMS singleton (for testing).
 */
export function resetKMSProvider(): void {
  kmsInstance = null;
}
