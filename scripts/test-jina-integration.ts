/**
 * Test Jina Integration
 * 
 * Usage: npx tsx scripts/test-jina-integration.ts --url <url>
 */

import { getJinaClient } from '../src/lib/jina/client';
import { brandExtractor } from '../src/lib/brand/extractor';
import { parseArgs } from 'util';

async function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2),
        options: {
            url: { type: 'string' }
        }
    });

    const url = values.url || 'https://example.com';

    console.log(`\n🧪 Testing Jina Integration for: ${url}\n`);

    // 1. Test Jina Reader
    console.log('--- Step 1: Jina Reader ---');
    const jina = getJinaClient();
    let content = '';

    try {
        const result = await jina.read(url, { withImagesSummary: true });
        console.log(`✅ Read Success! Title: ${result.title}`);
        console.log(`📝 Content Length: ${result.content.length} chars`);
        content = result.content;
    } catch (error: any) {
        console.error('❌ Jina Read Failed:', error.message);
        process.exit(1);
    }

    // 2. Test Brand Extractor
    console.log('\n--- Step 2: Brand Extractor ---');
    try {
        const brand = await brandExtractor.extract(content, url);
        console.log('✅ Extraction Success!');
        console.log('🎨 Brand Profile:');
        console.log(JSON.stringify(brand, null, 2));
    } catch (error: any) {
        console.error('❌ Brand Extraction Failed:', error.message);
        process.exit(1);
    }
}

main();
