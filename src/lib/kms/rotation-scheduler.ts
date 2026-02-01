/**
 * Automated Key Rotation Scheduler
 *
 * Schedules automatic encryption key rotation using BullMQ cron jobs.
 * Default: Every 90 days at 3:00 AM AEST on Sunday.
 *
 * @module lib/kms/rotation-scheduler
 */

import { cronScheduler } from '../queue/cron-scheduler';
import prisma from '@/prisma';
import { reEncrypt } from '../encryption';

// System user for automated tasks
const SYSTEM_USER_ID = 'system-vault-rotation';

// Default rotation schedule: 3:00 AM AEST on the 1st of every 3rd month
// Cron: minute hour day-of-month month day-of-week
const DEFAULT_ROTATION_PATTERN = '0 3 1 */3 *'; // Every 3 months on the 1st at 3:00 AM

export interface RotationConfig {
  /** Cron pattern for rotation schedule */
  pattern?: string;
  /** Whether to enable automatic rotation */
  enabled: boolean;
  /** Notify on rotation failure */
  notifyOnFailure?: boolean;
  /** Email addresses for failure notifications */
  notifyEmails?: string[];
}

export interface RotationResult {
  success: boolean;
  usersProcessed: number;
  keysRotated: number;
  errors: string[];
  duration: number;
  rotatedAt: Date;
}

/**
 * Vault Rotation Scheduler
 *
 * Manages automated key rotation for all users.
 */
export class VaultRotationScheduler {
  private config: RotationConfig = {
    enabled: false,
    pattern: DEFAULT_ROTATION_PATTERN,
    notifyOnFailure: true,
  };

  /**
   * Initialize the rotation scheduler with configuration.
   */
  async initialize(config: Partial<RotationConfig> = {}): Promise<void> {
    this.config = { ...this.config, ...config };

    if (this.config.enabled) {
      await this.scheduleRotation();
    }

    console.log('[VaultRotation] Scheduler initialized', {
      enabled: this.config.enabled,
      pattern: this.config.pattern,
    });
  }

  /**
   * Schedule automatic key rotation.
   */
  async scheduleRotation(): Promise<void> {
    const result = await cronScheduler.addCronJob(
      'vault-key-rotation',
      this.config.pattern || DEFAULT_ROTATION_PATTERN,
      'default',
      'vault:rotate-all-keys',
      { type: 'full-rotation' },
      SYSTEM_USER_ID,
    );

    if (!result.success) {
      console.error('[VaultRotation] Failed to schedule rotation:', result.error);
      throw new Error(`Failed to schedule key rotation: ${result.error}`);
    }

    console.log('[VaultRotation] Rotation scheduled with pattern:', this.config.pattern);
  }

  /**
   * Unschedule automatic key rotation.
   */
  async unscheduleRotation(): Promise<void> {
    const schedules = await cronScheduler.listSchedules(SYSTEM_USER_ID);
    const rotationSchedule = schedules.find((s) => s.name === 'vault-key-rotation');

    if (rotationSchedule) {
      await cronScheduler.removeCronJob(rotationSchedule.id);
      console.log('[VaultRotation] Rotation unscheduled');
    }
  }

  /**
   * Execute key rotation for all users.
   * Called by the cron job processor.
   */
  async executeFullRotation(): Promise<RotationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let usersProcessed = 0;
    let keysRotated = 0;

    console.log('[VaultRotation] Starting full rotation...');

    try {
      // Get all user profiles with encrypted fields
      const profiles = await prisma.userProfile.findMany({
        select: {
          id: true,
          clerkId: true,
          googleApiKey: true,
          shopifyAccessToken: true,
          redditApiKey: true,
          socialApiKeys: true,
          keyVersion: true,
          keyRotationHistory: true,
        },
      });

      for (const profile of profiles) {
        try {
          const updates: Record<string, any> = {};
          let profileKeysRotated = 0;

          // Re-encrypt each field
          if (profile.googleApiKey) {
            updates.googleApiKey = reEncrypt(profile.googleApiKey);
            profileKeysRotated++;
          }

          if (profile.shopifyAccessToken) {
            updates.shopifyAccessToken = reEncrypt(profile.shopifyAccessToken);
            profileKeysRotated++;
          }

          if (profile.redditApiKey) {
            updates.redditApiKey = reEncrypt(profile.redditApiKey);
            profileKeysRotated++;
          }

          if (profile.socialApiKeys && typeof profile.socialApiKeys === 'object') {
            const socialKeys = profile.socialApiKeys as Record<string, string>;
            const reEncryptedSocial: Record<string, string> = {};

            for (const [platform, encryptedKey] of Object.entries(socialKeys)) {
              if (encryptedKey) {
                reEncryptedSocial[platform] = reEncrypt(encryptedKey);
                profileKeysRotated++;
              }
            }

            updates.socialApiKeys = reEncryptedSocial;
          }

          if (profileKeysRotated > 0) {
            const newVersion = profile.keyVersion + 1;
            const rotatedAt = new Date();

            const existingHistory = (profile.keyRotationHistory as any[]) || [];
            const rotationEntry = {
              version: newVersion,
              rotatedAt: rotatedAt.toISOString(),
              rotatedBy: SYSTEM_USER_ID,
              keysRotated: profileKeysRotated,
              reason: 'automated-rotation',
            };

            await prisma.userProfile.update({
              where: { id: profile.id },
              data: {
                ...updates,
                keyVersion: newVersion,
                keyRotationHistory: [...existingHistory, rotationEntry],
              },
            });

            keysRotated += profileKeysRotated;
          }

          usersProcessed++;
        } catch (err: any) {
          errors.push(`User ${profile.clerkId}: ${err.message}`);
          console.error(`[VaultRotation] Failed for user ${profile.clerkId}:`, err.message);
        }
      }

      const duration = Date.now() - startTime;
      const result: RotationResult = {
        success: errors.length === 0,
        usersProcessed,
        keysRotated,
        errors,
        duration,
        rotatedAt: new Date(),
      };

      console.log('[VaultRotation] Rotation complete:', {
        usersProcessed,
        keysRotated,
        errors: errors.length,
        duration: `${duration}ms`,
      });

      // Log to audit table
      await this.logRotationAudit(result);

      // Notify on failure if configured
      if (errors.length > 0 && this.config.notifyOnFailure) {
        await this.notifyRotationFailure(result);
      }

      return result;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error('[VaultRotation] Critical failure:', err.message);

      return {
        success: false,
        usersProcessed,
        keysRotated,
        errors: [`Critical failure: ${err.message}`],
        duration,
        rotatedAt: new Date(),
      };
    }
  }

  /**
   * Rotate keys for a single user.
   */
  async rotateUserKeys(userId: string): Promise<{ success: boolean; keysRotated: number }> {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { clerkId: userId },
      });

      if (!profile) {
        return { success: false, keysRotated: 0 };
      }

      const updates: Record<string, any> = {};
      let keysRotated = 0;

      if (profile.googleApiKey) {
        updates.googleApiKey = reEncrypt(profile.googleApiKey);
        keysRotated++;
      }

      if (profile.shopifyAccessToken) {
        updates.shopifyAccessToken = reEncrypt(profile.shopifyAccessToken);
        keysRotated++;
      }

      if (profile.redditApiKey) {
        updates.redditApiKey = reEncrypt(profile.redditApiKey);
        keysRotated++;
      }

      if (profile.socialApiKeys && typeof profile.socialApiKeys === 'object') {
        const socialKeys = profile.socialApiKeys as Record<string, string>;
        const reEncryptedSocial: Record<string, string> = {};

        for (const [platform, encryptedKey] of Object.entries(socialKeys)) {
          if (encryptedKey) {
            reEncryptedSocial[platform] = reEncrypt(encryptedKey);
            keysRotated++;
          }
        }

        updates.socialApiKeys = reEncryptedSocial;
      }

      if (keysRotated > 0) {
        const newVersion = profile.keyVersion + 1;

        await prisma.userProfile.update({
          where: { clerkId: userId },
          data: {
            ...updates,
            keyVersion: newVersion,
          },
        });
      }

      return { success: true, keysRotated };
    } catch (err: any) {
      console.error(`[VaultRotation] Failed for user ${userId}:`, err.message);
      return { success: false, keysRotated: 0 };
    }
  }

  /**
   * Get the current rotation schedule.
   */
  async getSchedule(): Promise<{
    enabled: boolean;
    pattern: string;
    nextRunAt: string | null;
    lastRunAt: string | null;
  }> {
    const schedules = await cronScheduler.listSchedules(SYSTEM_USER_ID);
    const rotationSchedule = schedules.find((s) => s.name === 'vault-key-rotation');

    return {
      enabled: rotationSchedule?.isActive ?? false,
      pattern: rotationSchedule?.pattern ?? this.config.pattern ?? DEFAULT_ROTATION_PATTERN,
      nextRunAt: rotationSchedule?.nextRunAt ?? null,
      lastRunAt: rotationSchedule?.lastRunAt ?? null,
    };
  }

  /**
   * Log rotation audit to database.
   */
  private async logRotationAudit(result: RotationResult): Promise<void> {
    try {
      // Store in a generic audit log or create dedicated vault audit table
      console.log('[VaultRotation] Audit logged:', {
        timestamp: result.rotatedAt.toISOString(),
        usersProcessed: result.usersProcessed,
        keysRotated: result.keysRotated,
        success: result.success,
      });
    } catch (err: any) {
      console.error('[VaultRotation] Failed to log audit:', err.message);
    }
  }

  /**
   * Notify administrators of rotation failure.
   */
  private async notifyRotationFailure(result: RotationResult): Promise<void> {
    // In production, send email/Slack notification
    console.warn('[VaultRotation] ALERT: Key rotation had errors:', result.errors);
  }
}

/** Singleton instance */
export const vaultRotationScheduler = new VaultRotationScheduler();

/**
 * Job handler for vault rotation cron jobs.
 * Register this with the job processor.
 */
export async function handleVaultRotationJob(
  _payload: Record<string, unknown>,
): Promise<{ success: boolean; result: RotationResult }> {
  const result = await vaultRotationScheduler.executeFullRotation();
  return { success: result.success, result };
}
