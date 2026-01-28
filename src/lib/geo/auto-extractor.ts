/**
 * GEO Auto-Extractor
 *
 * Automatically extracts business NAP (Name, Address, Phone) data from website URLs
 * Uses multiple extraction strategies with confidence scoring
 */

import { parseHTML } from 'linkedom';

export interface ExtractedBusinessInfo {
  businessName: string | null;
  address: string | null;
  phone: string | null;
  location: string | null;  // City, State
  confidence: number;       // 0-100
  source: 'schema' | 'footer' | 'contact' | 'header' | 'none';
}

/**
 * Main extraction function
 * Tries multiple strategies and returns best result
 */
export async function extractBusinessInfo(url: string): Promise<ExtractedBusinessInfo> {
  console.log(`[AutoExtractor] Extracting from: ${url}`);

  try {
    // Fetch HTML with timeout
    const html = await fetchHTML(url);

    if (!html) {
      return createEmptyResult();
    }

    const { document } = parseHTML(html);

    // Strategy 1: Extract from LocalBusiness schema (highest confidence)
    const schemaResult = extractFromSchema(document);
    if (schemaResult.confidence > 80) {
      console.log(`[AutoExtractor] Schema extraction successful (${schemaResult.confidence}% confidence)`);
      return schemaResult;
    }

    // Strategy 2: Extract from footer (high confidence)
    const footerResult = extractFromFooter(document);
    if (footerResult.confidence > schemaResult.confidence) {
      console.log(`[AutoExtractor] Footer extraction successful (${footerResult.confidence}% confidence)`);
      return footerResult;
    }

    // Strategy 3: Extract from header (medium confidence)
    const headerResult = extractFromHeader(document);
    if (headerResult.confidence > footerResult.confidence) {
      console.log(`[AutoExtractor] Header extraction successful (${headerResult.confidence}% confidence)`);
      return headerResult;
    }

    // Strategy 4: Try contact page (high confidence but requires additional request)
    const contactResult = await extractFromContactPage(url, document);
    if (contactResult.confidence > Math.max(schemaResult.confidence, footerResult.confidence, headerResult.confidence)) {
      console.log(`[AutoExtractor] Contact page extraction successful (${contactResult.confidence}% confidence)`);
      return contactResult;
    }

    // Return best result
    const results = [schemaResult, footerResult, headerResult, contactResult];
    const bestResult = results.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    console.log(`[AutoExtractor] Best result: ${bestResult.source} (${bestResult.confidence}% confidence)`);
    return bestResult;

  } catch (error: any) {
    console.error(`[AutoExtractor] Error extracting from ${url}:`, error.message);
    return createEmptyResult();
  }
}

/**
 * Strategy 1: Extract from LocalBusiness schema
 */
function extractFromSchema(document: any): ExtractedBusinessInfo {
  try {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

    for (const script of scripts) {
      const jsonText = script.textContent || '';
      try {
        const json = JSON.parse(jsonText);

        // Handle both single object and array
        const schemas = Array.isArray(json) ? json : [json];

        for (const schema of schemas) {
          if (schema['@type'] === 'LocalBusiness' || schema['@type']?.includes('LocalBusiness')) {
            const result: ExtractedBusinessInfo = {
              businessName: schema.name || null,
              address: formatAddress(schema.address),
              phone: cleanPhone(schema.telephone),
              location: extractLocation(schema.address),
              confidence: 0,
              source: 'schema'
            };

            // Calculate confidence based on completeness
            result.confidence = calculateConfidence(result, 95);

            return result;
          }
        }
      } catch (e) {
        // Invalid JSON, skip
        continue;
      }
    }

    return createEmptyResult();
  } catch (error) {
    return createEmptyResult();
  }
}

/**
 * Strategy 2: Extract from footer
 */
function extractFromFooter(document: any): ExtractedBusinessInfo {
  try {
    const footer = document.querySelector('footer');
    if (!footer) {
      return createEmptyResult();
    }

    const footerText = footer.textContent || '';

    const result: ExtractedBusinessInfo = {
      businessName: extractBusinessNameFromText(footerText, document),
      address: extractAddressFromText(footerText),
      phone: extractPhoneFromText(footerText),
      location: null,
      confidence: 0,
      source: 'footer'
    };

    // Extract location from address
    if (result.address) {
      result.location = extractLocationFromAddress(result.address);
    }

    result.confidence = calculateConfidence(result, 85);

    return result;
  } catch (error) {
    return createEmptyResult();
  }
}

/**
 * Strategy 3: Extract from header
 */
function extractFromHeader(document: any): ExtractedBusinessInfo {
  try {
    const header = document.querySelector('header');
    if (!header) {
      return createEmptyResult();
    }

    const headerText = header.textContent || '';

    const result: ExtractedBusinessInfo = {
      businessName: extractBusinessNameFromText(headerText, document),
      address: extractAddressFromText(headerText),
      phone: extractPhoneFromText(headerText),
      location: null,
      confidence: 0,
      source: 'header'
    };

    if (result.address) {
      result.location = extractLocationFromAddress(result.address);
    }

    result.confidence = calculateConfidence(result, 75);

    return result;
  } catch (error) {
    return createEmptyResult();
  }
}

/**
 * Strategy 4: Extract from contact page
 */
async function extractFromContactPage(url: string, document: any): Promise<ExtractedBusinessInfo> {
  try {
    // Find contact page link
    const contactLinks = Array.from(document.querySelectorAll('a'))
      .filter((a: any) => {
        const href = a.getAttribute('href') || '';
        const text = (a.textContent || '').toLowerCase();
        return href.includes('contact') || text.includes('contact') ||
               href.includes('about') || text.includes('about');
      });

    if (contactLinks.length === 0) {
      return createEmptyResult();
    }

    // Try first contact link
    const contactLink = contactLinks[0] as any;
    const contactHref = contactLink.getAttribute('href');
    const contactUrl = new URL(contactHref, url).href;

    const contactHTML = await fetchHTML(contactUrl);
    if (!contactHTML) {
      return createEmptyResult();
    }

    const { document: contactDoc } = parseHTML(contactHTML);
    const contactText = contactDoc.body.textContent || '';

    const result: ExtractedBusinessInfo = {
      businessName: extractBusinessNameFromText(contactText, contactDoc),
      address: extractAddressFromText(contactText),
      phone: extractPhoneFromText(contactText),
      location: null,
      confidence: 0,
      source: 'contact'
    };

    if (result.address) {
      result.location = extractLocationFromAddress(result.address);
    }

    result.confidence = calculateConfidence(result, 90);

    return result;
  } catch (error) {
    return createEmptyResult();
  }
}

/**
 * Fetch HTML from URL with timeout
 */
async function fetchHTML(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'G-Pilot SEO Analyzer/1.0'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`[AutoExtractor] Failed to fetch ${url}:`, error);
    return null;
  }
}

/**
 * Format schema.org address to string
 */
function formatAddress(addressObj: any): string | null {
  if (!addressObj) return null;

  if (typeof addressObj === 'string') return addressObj;

  const parts = [
    addressObj.streetAddress,
    addressObj.addressLocality,
    addressObj.addressRegion,
    addressObj.postalCode
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Extract location (City, State) from address object or string
 */
function extractLocation(address: any): string | null {
  if (!address) return null;

  if (typeof address === 'object') {
    const city = address.addressLocality || address.city;
    const state = address.addressRegion || address.state;
    if (city && state) {
      return `${city}, ${state}`;
    }
  }

  if (typeof address === 'string') {
    return extractLocationFromAddress(address);
  }

  return null;
}

/**
 * Extract location from address string
 */
function extractLocationFromAddress(address: string): string | null {
  // Pattern: City, State ZIP or City, State
  const match = address.match(/([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\s*\d{5}/);
  if (match) {
    return `${match[1]}, ${match[2]}`;
  }

  const simpleMatch = address.match(/([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})/);
  if (simpleMatch) {
    return `${simpleMatch[1]}, ${simpleMatch[2]}`;
  }

  return null;
}

/**
 * Extract business name from text
 */
function extractBusinessNameFromText(text: string, document: any): string | null {
  // Try to get from title
  const title = document.querySelector('title')?.textContent || '';
  if (title) {
    // Remove common suffixes
    const cleanTitle = title
      .replace(/\s*[-|]\s*.*/g, '') // Remove "- Home" or "| Services"
      .trim();
    if (cleanTitle.length > 0 && cleanTitle.length < 100) {
      return cleanTitle;
    }
  }

  // Try to extract from copyright text
  const copyrightMatch = text.match(/©\s*\d{4}\s+([^.]+)/);
  if (copyrightMatch) {
    return copyrightMatch[1].trim();
  }

  // Try to get from h1
  const h1 = document.querySelector('h1')?.textContent || '';
  if (h1 && h1.length < 100) {
    return h1.trim();
  }

  return null;
}

/**
 * Extract address from text using patterns
 */
function extractAddressFromText(text: string): string | null {
  // Pattern: Street, City, State ZIP
  const fullAddressPattern = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct),\s*[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\s*\d{5}/;
  const match = text.match(fullAddressPattern);
  if (match) {
    return match[0];
  }

  return null;
}

/**
 * Extract phone from text using patterns
 */
function extractPhoneFromText(text: string): string | null {
  // Patterns for phone numbers
  const patterns = [
    /\(\d{3}\)\s*\d{3}-\d{4}/,      // (555) 123-4567
    /\d{3}-\d{3}-\d{4}/,             // 555-123-4567
    /\d{3}\.\d{3}\.\d{4}/,           // 555.123.4567
    /\d{10}/                         // 5551234567
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return cleanPhone(match[0]);
    }
  }

  return null;
}

/**
 * Clean phone number to standard format
 */
function cleanPhone(phone: string | undefined): string | null {
  if (!phone) return null;

  // Extract just digits
  const digits = phone.replace(/\D/g, '');

  // Check if valid length (10 or 11 digits)
  if (digits.length === 10) {
    // Format as (555) 123-4567
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    // Remove leading 1
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return null;
}

/**
 * Calculate confidence score based on completeness
 */
function calculateConfidence(result: ExtractedBusinessInfo, baseConfidence: number): number {
  let fieldsFound = 0;
  let totalFields = 3; // name, address, phone

  if (result.businessName) fieldsFound++;
  if (result.address) fieldsFound++;
  if (result.phone) fieldsFound++;

  if (fieldsFound === 0) return 0;

  // Scale base confidence by completeness
  const completeness = fieldsFound / totalFields;
  return Math.round(baseConfidence * completeness);
}

/**
 * Create empty result
 */
function createEmptyResult(): ExtractedBusinessInfo {
  return {
    businessName: null,
    address: null,
    phone: null,
    location: null,
    confidence: 0,
    source: 'none'
  };
}
