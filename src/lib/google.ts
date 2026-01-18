import { google } from 'googleapis';

/**
 * Robust Google Auth initialization.
 * Handles both plain-text private keys and Base64-encoded keys 
 * to prevent deployment-time whitespace/newline issues in environment variables.
 */
export function getGoogleAuth() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
        throw new Error("Missing Google Service Account credentials (GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY)");
    }

    // Try to decode from Base64 if it doesn't look like a standard PEM key
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        try {
            console.log("Decoding GOOGLE_PRIVATE_KEY from Base64...");
            privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
        } catch (err) {
            console.error("Failed to decode GOOGLE_PRIVATE_KEY as Base64. Ensure it is either a valid PEM or a Base64 PEM.");
        }
    }

    // Sanitize newlines if they are escaped literal "\n" strings
    privateKey = privateKey.replace(/\\n/g, '\n');

    return new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: [
            'https://www.googleapis.com/auth/presentations',
            'https://www.googleapis.com/auth/drive'
        ]
    });
}
