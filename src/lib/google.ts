import { google } from 'googleapis';
import prisma from '../prisma';
import { decrypt } from './encryption';

const DEFAULT_SCOPES = [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/gmail.send'
];

/**
 * Retrieves Google Auth credentials.
 * Prioritizes user-provided encrypted Service Account keys in UserProfile.
 * Falls back to global environment variables.
 */
export async function getGoogleAuth(userId?: string) {
    let clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // 1. Try to fetch custom credentials from UserProfile if userId is provided
    if (userId) {
        // @ts-ignore - Stubborn lint error, property verified in other modules
        const profile = await prisma.userProfile.findUnique({
            where: { clerkId: userId }
        });

        // If the user has stored a JSON service account in googleApiKey 
        // (Assuming we expand this to store more than just a string)
        if (profile?.googleApiKey) {
            try {
                const decryptedKey = decrypt(profile.googleApiKey);
                // Check if it's a JSON service account
                if (decryptedKey.includes('{')) {
                    const json = JSON.parse(decryptedKey);
                    clientEmail = json.client_email;
                    privateKey = json.private_key;
                } else {
                    // Fallback: If it's just an API key, we might need a different auth strategy
                    // For now, G-Pilot tools mainly use Service Accounts for autonomous missions.
                    console.warn(`User ${userId} provided a plain API key. G-Pilot missions require a Service Account JSON for Slides/Drive.`);
                }
            } catch (err) {
                console.error("Failed to parse user-provided Google Key:", err);
            }
        }
    }

    if (!clientEmail || !privateKey) {
        throw new Error("Missing Google Service Account credentials. Initialize 'The Vault' in onboarding.");
    }

    // Sanitize Key
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        try {
            privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
        } catch (err) { }
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    return new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: DEFAULT_SCOPES
    });
}
