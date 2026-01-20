import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/google';
import { billingGate } from '../billing/costGate';

/**
 * createSheetLedger
 * Creates a new Google Sheet to store mission logs or data.
 */
export async function createSheetLedger(clerkId: string, title: string, data: any[][]) {
  await billingGate(clerkId, 'DOC_GENERATION');

  const auth = await getGoogleAuth(clerkId);
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) throw new Error('Failed to create spreadsheet');

    // Simple batch update to append data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: { values: data },
    });

    return {
      type: 'GOOGLE_SHEET',
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    };
  } catch (error: any) {
    console.error('Sheets Ledger error:', error.message);
    throw error;
  }
}
