import { google } from 'googleapis';
import { billingGate } from '../middleware/costGate';

// The ID of the folder where the client drops their logos/marketing pics
const ASSETS_FOLDER_ID = process.env.GOOGLE_ASSETS_FOLDER_ID;

/**
 * Refined Brand-Safe Asset Retriever.
 * Uses high-res thumbnail hack and improved logging.
 */
export async function findAsset(clerkId: string, query: string) {
  // Deduct minor cost for retrieval
  await billingGate(clerkId, 'SIMPLE_CHAT');

  if (!ASSETS_FOLDER_ID) {
    throw new Error('GOOGLE_ASSETS_FOLDER_ID is not configured.');
  }

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    console.log(`🔍 Searching for asset: "${query}" in folder ${ASSETS_FOLDER_ID}...`);

    const res = await drive.files.list({
      q: `'${ASSETS_FOLDER_ID}' in parents and name contains '${query}' and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, webContentLink, thumbnailLink)',
      pageSize: 1, // We only need the best match
    });

    const file = res.data.files?.[0];

    if (!file) {
      console.warn(`⚠️ No asset found for "${query}". Using fallback.`);
      return null; // The Agent will handle this (e.g., use text instead)
    }

    console.log(`✅ Found asset: ${file.name}`);

    // Google Slides API needs a publicly accessible URL usually,
    // but if the Service Account has access, 'thumbnailLink' often works
    // or we use the file ID for internal copying.
    return {
      name: file.name,
      url: file.thumbnailLink?.replace('=s220', '=s1600'), // Hack: Request high-res version
    };
  } catch (error) {
    console.error('❌ Asset Search Failed:', error);
    throw new Error('Failed to retrieve brand assets.');
  }
}
