import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/google';
import { billingGate } from '../middleware/costGate';

/**
 * searchConsoleAudit
 * Retrieves the last 30 days of performance data for a site.
 */
export async function searchConsoleAudit(clerkId: string, siteUrl: string) {
  await billingGate(clerkId, 'DEEP_RESEARCH');

  const auth = await getGoogleAuth(clerkId);
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        dimensions: ['query', 'page'],
        rowLimit: 10,
      },
    });

    return {
      type: 'SEARCH_CONSOLE_AUDIT',
      siteUrl,
      rows: response.data.rows || [],
      summary: `Retrieved ${response.data.rows?.length || 0} performance vectors for global alignment.`,
    };
  } catch (error: any) {
    console.error('Search Console Auditor error:', error.message);
    throw new Error(
      `Failed to audit ${siteUrl}. Ensure the G-Pilot service account has 'Viewer' access in Search Console.`,
    );
  }
}
