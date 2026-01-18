import puppeteer from 'puppeteer';

export interface BrandConfig {
  logo: string;
  colors: string[];
  font: string;
  metadata: {
    title: string;
    description: string;
  };
}

/**
 * The Mirror: Secure Brand Extraction
 * Scrapes a website to extract visual identity tokens.
 */
export async function extractBrandIdentity(url: string): Promise<BrandConfig> {
  console.log(`🔍 The Mirror: Scanning ${url} for brand tokens...`);

  // Fallback defaults
  const config: BrandConfig = {
    logo: `https://www.google.com/s2/favicons?domain=${url}&sz=128`,
    colors: ['#3b82f6', '#0f172a'],
    font: 'Inter',
    metadata: { title: '', description: '' },
  };

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // 1. Extract Metadata
    config.metadata.title = await page.title();
    config.metadata.description = await page
      .$eval('meta[name="description"]', (el) => (el as HTMLMetaElement).content)
      .catch(() => '');

    // 2. Extract Logo (Favicon or OG:Image)
    const ogImage = await page
      .$eval('meta[property="og:image"]', (el) => (el as HTMLMetaElement).content)
      .catch(() => null);
    if (ogImage) config.logo = ogImage;

    // 3. Extract Primary Colors (Scanning for dominant background colors or CSS variables)
    const colors = await page.evaluate(() => {
      const samplePoints = ['header', 'footer', 'button', 'body'];
      const colorsSet = new Set<string>();

      samplePoints.forEach((selector) => {
        const el = document.querySelector(selector);
        if (el) {
          const style = window.getComputedStyle(el);
          const bg = style.backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            colorsSet.add(bg);
          }
        }
      });
      return Array.from(colorsSet).slice(0, 3);
    });
    if (colors.length > 0) config.colors = colors;

    // 4. Extract Primary Font
    const font = await page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      return bodyStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    });
    if (font) config.font = font;

    console.log(`✅ The Mirror: Identity extracted for ${config.metadata.title}`);
  } catch (error) {
    console.error('❌ The Mirror failed to extract brand:', error);
  } finally {
    if (browser) await browser.close();
  }

  return config;
}
