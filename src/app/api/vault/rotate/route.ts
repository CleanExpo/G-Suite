import { NextResponse } from 'next/server';
import prisma from '@/prisma';
import { reEncrypt } from '@/lib/encryption';
import { getAuthUserIdOrDev } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/vault/rotate
 * Rotates all encrypted secrets for the authenticated user.
 * Re-encrypts with AES-256-GCM and increments the key version.
 */
export async function POST() {
  try {
    const userId = await getAuthUserIdOrDev();

    // Fetch user profile with all encrypted fields
    const profile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'No vault found. Complete onboarding first.' },
        { status: 404 },
      );
    }

    // Build re-encrypted fields
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

    if (keysRotated === 0) {
      return NextResponse.json({
        success: true,
        newVersion: profile.keyVersion,
        rotatedAt: new Date().toISOString(),
        keysRotated: 0,
        message: 'No keys to rotate.',
      });
    }

    // Atomic update: re-encrypted fields + version bump + audit log
    const newVersion = profile.keyVersion + 1;
    const rotatedAt = new Date().toISOString();

    const existingHistory = (profile.keyRotationHistory as any[]) || [];
    const rotationEntry = {
      version: newVersion,
      rotatedAt,
      rotatedBy: userId,
      keysRotated,
    };

    await prisma.$transaction(async (tx: any) => {
      await tx.userProfile.update({
        where: { clerkId: userId },
        data: {
          ...updates,
          keyVersion: newVersion,
          keyRotationHistory: [...existingHistory, rotationEntry],
        },
      });
    });

    return NextResponse.json({
      success: true,
      newVersion,
      rotatedAt,
      keysRotated,
    });
  } catch (error: any) {
    console.error('[Vault Rotate] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
