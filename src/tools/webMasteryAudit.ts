import puppeteer from 'puppeteer';

export interface AuditResult {
    score: number;
    checkpoints: {
        eeat: boolean;
        performance: boolean;
        accessibility: boolean;
        seo: boolean;
    };
    findings: string[];
    recommendations: string[];
}

/**
 * Web Mastery Audit Tool
 * Analyzes a URL for G-Pilot's high-fidelity SEO and E-E-A-T standards.
 */
export async function performWebMasteryAudit(url: string): Promise<AuditResult> {
    console.log(`📡 Web Mastery: Auditing ${url} for E-E-A-T and Performance...`);

    const result: AuditResult = {
        score: 0,
        checkpoints: { eeat: false, performance: false, accessibility: false, seo: false },
        findings: [],
        recommendations: []
    };

    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();

        // 1. Performance Baseline
        const start = Date.now();
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        const loadTime = Date.now() - start;

        if (loadTime < 2000) {
            result.checkpoints.performance = true;
            result.findings.push(`⚡ Performance: Rapid Load detected (${loadTime}ms).`);
        } else {
            result.recommendations.push(`Optimize LCP: The site load time is ${loadTime}ms. Target < 1.5s.`);
        }

        // 2. E-E-A-T and SEO Analysis
        const analysis = await page.evaluate(() => {
            const hasSchema = !!document.querySelector('script[type="application/ld+json"]');
            const hasPrivacy = !!Array.from(document.querySelectorAll('a')).find(a => a.innerText.toLowerCase().includes('privacy'));
            const missingAlts = Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length;
            const h1Count = document.querySelectorAll('h1').length;
            const hasCsp = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');

            return { hasSchema, hasPrivacy, missingAlts, h1Count, hasCsp };
        });

        if (analysis.hasSchema) {
            result.checkpoints.eeat = true;
            result.findings.push("🛡️ E-E-A-T: Structured Data (JSON-LD) detected.");
        } else {
            result.recommendations.push("Add JSON-LD: Implement SoftwareApplication schema to improve SERP snippets.");
        }

        if (analysis.hasPrivacy) {
            result.findings.push("⚖️ Trust: Privacy Policy link found in DOM.");
        } else {
            result.recommendations.push("Add Privacy Policy: Visible compliance links are critical for E-E-A-T trust.");
        }

        if (analysis.missingAlts === 0) {
            result.checkpoints.accessibility = true;
            result.findings.push("♿ Accessibility: 100% Alt-text coverage on images.");
        } else {
            result.recommendations.push(`Fix Accessibility: Found ${analysis.missingAlts} images missing alt text.`);
        }

        if (analysis.h1Count === 1) {
            result.checkpoints.seo = true;
        } else {
            result.recommendations.push(`Fix SEO: Found ${analysis.h1Count} H1 tags. Exactly one H1 per page is required.`);
        }

        // 3. Final Scoring
        let hits = 0;
        if (result.checkpoints.eeat) hits += 25;
        if (result.checkpoints.performance) hits += 25;
        if (result.checkpoints.accessibility) hits += 25;
        if (result.checkpoints.seo) hits += 25;
        result.score = hits;

    } catch (err: any) {
        console.error("Web Mastery Audit failed:", err.message);
        result.findings.push(`Error: Could not reach ${url}.`);
    } finally {
        if (browser) await browser.close();
    }

    return result;
}
