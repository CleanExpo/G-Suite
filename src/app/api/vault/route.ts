import { NextResponse } from 'next/server';
import prisma from '@/prisma';
import { isCurrentVersion } from '@/lib/encryption';
import { getAuthUserIdOrDev } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vault
 * Returns vault metadata for the authenticated user.
 * Never returns actual key values — only names, status, and rotation history.
 */
export async function GET() {
  try {
    const userId = await getAuthUserIdOrDev();

    const profile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'No vault found. Complete onboarding first.' },
        { status: 404 }
      );
    }

    // Build credential inventory (names + status only, never values)
    const credentials: { name: string; active: boolean; currentVersion: boolean }[] = [];

    if (profile.googleApiKey) {
      credentials.push({
        name: 'Google Gemini Pro',
        active: true,
        currentVersion: isCurrentVersion(profile.googleApiKey),
      });
    }

    if (profile.shopifyAccessToken) {
      credentials.push({
        name: 'Shopify Access Token',
        active: true,
        currentVersion: isCurrentVersion(profile.shopifyAccessToken),
      });
    }

    if (profile.redditApiKey) {
      credentials.push({
        name: 'Reddit API Key',
        active: true,
        currentVersion: isCurrentVersion(profile.redditApiKey),
      });
    }

    if (profile.socialApiKeys && typeof profile.socialApiKeys === 'object') {
      const socialKeys = profile.socialApiKeys as Record<string, string>;
      for (const [platform, encryptedKey] of Object.entries(socialKeys)) {
        if (encryptedKey) {
          credentials.push({
            name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} API Key`,
            active: true,
            currentVersion: isCurrentVersion(encryptedKey),
          });
        }
      }
    }

    const rotationHistory = (profile.keyRotationHistory as any[]) || [];

    return NextResponse.json({
      success: true,
      keyVersion: profile.keyVersion,
      credentials,
      rotationHistory,
      encryptionStandard: 'AES-256-GCM',
    });
  } catch (error: any) {
    console.error('[Vault GET] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
