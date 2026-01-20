import puppeteer from 'puppeteer';
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { billingGate } from '../billing/costGate';

// Note: Standard puppeteer used to avoid "utils.typeOf" bundling errors in Next.js 15

/**
 * Headless Agent for NotebookLM.
 * Logs in, uploads a document, triggers Audio Overview, and retrieves the download link.
 */
export async function runNotebookLMAgent(clerkId: string, filePath: string) {
  // 1. Use the refined billing gate
  await billingGate(clerkId, 'DEEP_RESEARCH');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 3. Navigate to NotebookLM
    console.log('Navigating to NotebookLM...');
    await page.goto('https://notebooklm.google.com/', { waitUntil: 'networkidle2' });

    console.log('Waiting for login/dashboard load...');

    // Placeholder return for development
    return {
      status: 'In Progress (Manual login required for full automation)',
      sessionUrl: 'https://notebooklm.google.com/',
    };
  } catch (error) {
    console.error('NotebookLM Agent Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
