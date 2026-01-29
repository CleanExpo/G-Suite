/**
 * Test Document AI Pipeline
 * 
 * Usage: npx tsx scripts/test-doc-ai.ts
 */

import { getDocumentProcessor } from '../src/lib/document-processor/engine';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('\n📄 Testing Document AI Pipeline\n');

    // 1. Create a dummy PDF buffer (mock)
    // In a real test we'd load a file: fs.readFileSync('test-invoice.pdf');
    const mockPdfBuffer = Buffer.from('%PDF-1.4 ... (Mock Invoice content) ... Invoice #12345 Total: $500.00');

    const processor = getDocumentProcessor();

    try {
        console.log('--- Processing Mock Document ---');

        // Note: This will likely fail if no Google Creds are set, 
        // so we wrap in try/catch to at least verify the engine initializes.

        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLIENT_EMAIL) {
            console.warn('⚠️ No Google Credentials found in env. Expecting failure or mocked response if configured.');
        }

        const result = await processor.process({
            content: mockPdfBuffer,
            fileName: 'test-invoice.pdf',
            mimeType: 'application/pdf',
            extractionOptions: { classifyDocument: true }
        });

        console.log('✅ Processing Success!');
        console.log('Type:', result.classification?.type);
        console.log('Confidence:', result.metadata.confidence);
        console.log('Insights:', result.insights);

    } catch (error: any) {
        if (error.message.includes('Document AI client is not configured')) {
            console.log('✅ Engine Initialized Correctly (Failed on missing creds as expected)');
            console.log('To run fully, set DOCUMENT_AI_PROCESSOR_ID in .env.local');
        } else {
            console.error('❌ Processing Failed:', error.message);
        }
    }
}

main();
