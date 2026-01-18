'use server';

import prisma from "@/prisma";
import { encrypt } from "@/lib/encryption";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface OnboardingData {
    website?: string;
    apiKey?: string;
    shopifyAccessToken?: string;
    redditApiKey?: string;
    socialApiKeys?: Record<string, string>;
}

export async function completeOnboarding(data: OnboardingData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Encrypt existing and new keys if provided
    const updateData: any = {
        clerkId: user.id,
        onboardingCompleted: true,
    };

    if (data.website) updateData.websiteUrl = data.website;
    if (data.apiKey) updateData.googleApiKey = encrypt(data.apiKey);
    if (data.shopifyAccessToken) updateData.shopifyAccessToken = encrypt(data.shopifyAccessToken);
    if (data.redditApiKey) updateData.redditApiKey = encrypt(data.redditApiKey);

    if (data.socialApiKeys) {
        const encryptedSocial: Record<string, string> = {};
        for (const [key, val] of Object.entries(data.socialApiKeys)) {
            encryptedSocial[key] = encrypt(val);
        }
        updateData.socialApiKeys = encryptedSocial;
    }

    // 2. The Mirror: Adaptive Brand Extraction
    if (data.website) {
        try {
            const { extractBrandIdentity } = await import("../tools/brandMirror.js");
            updateData.brandConfig = await extractBrandIdentity(data.website);
        } catch (err) {
            console.warn("Brand extraction failed, using defaults:", err);
            updateData.brandConfig = {
                logo: `https://www.google.com/s2/favicons?domain=${data.website}&sz=128`,
                colors: ["#3b82f6", "#0f172a"],
                font: "Inter"
            };
        }
    }

    // 3. Upsert to DB
    // @ts-ignore - Prisma client regeneration may be needed
    await prisma.userProfile.upsert({
        where: { clerkId: user.id },
        update: updateData,
        create: updateData
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/vault');
    return { success: true };
}
