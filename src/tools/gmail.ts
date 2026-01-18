import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/google';

/**
 * sendMissionAlert
 * Sends a notification email via Gmail (requires Gmail scope and delegation).
 */
export async function sendMissionAlert(clerkId: string, to: string, subject: string, body: string) {
  const auth = await getGoogleAuth(clerkId);
  const gmail = google.gmail({ version: 'v1', auth });

  // Gmail requires a base64url encoded message
  const message = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    body,
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    return { success: true, target: to };
  } catch (error: any) {
    console.error('Gmail Dispatch error:', error.message);
    throw error;
  }
}
