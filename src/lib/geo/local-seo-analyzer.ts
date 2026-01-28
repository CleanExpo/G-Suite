/**
 * Local SEO Analyzer
 *
 * Analyzes NAP consistency, citations, local schema markup, and Google Maps integration
 */

import { parseHTML } from 'linkedom';
import type {
    NAPAnalysis,
    NAPConsistency,
    NAPInstance,
    NAPInconsistency,
    CitationAnalysis,
    Citation,
    LocalSchemaAnalysis,
    SchemaCompleteness,
    MapsIntegrationAnalysis,
    MapImplementation,
    MAJOR_DIRECTORIES
} from './types';

export class LocalSEOAnalyzer {
    /**
     * Analyze NAP (Name, Address, Phone) consistency
     */
    analyzeNAP(
        html: string,
        expectedName: string,
        expectedAddress: string,
        expectedPhone: string
    ): NAPAnalysis {
        const { document } = parseHTML(html);
        const foundInstances: NAPInstance[] = [];
        const inconsistencies: NAPInconsistency[] = [];

        // Extract NAP from structured data (schema.org)
        const schemaScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        for (const script of schemaScripts) {
            try {
                const schema = JSON.parse(script.textContent || '');
                if (schema['@type'] === 'LocalBusiness' || schema['@type'] === 'Organization') {
                    const instance: NAPInstance = {
                        source: 'schema',
                        name: schema.name,
                        address: this.formatAddress(schema.address),
                        phone: schema.telephone,
                        confidence: 1.0
                    };
                    foundInstances.push(instance);

                    // Check consistency
                    if (schema.name && !this.isSimilar(schema.name, expectedName)) {
                        inconsistencies.push({
                            field: 'name',
                            expected: expectedName,
                            found: schema.name,
                            location: 'Schema markup'
                        });
                    }
                }
            } catch (e) {
                // Invalid JSON, skip
            }
        }

        // Extract NAP from common locations
        this.extractNAPFromHeader(document, foundInstances, expectedName, expectedAddress, expectedPhone, inconsistencies);
        this.extractNAPFromFooter(document, foundInstances, expectedName, expectedAddress, expectedPhone, inconsistencies);
        this.extractNAPFromContactPage(document, foundInstances, expectedName, expectedAddress, expectedPhone, inconsistencies);

        // Calculate consistency
        const nameConsistent = !inconsistencies.some(i => i.field === 'name');
        const addressConsistent = !inconsistencies.some(i => i.field === 'address');
        const phoneConsistent = !inconsistencies.some(i => i.field === 'phone');

        const consistency: NAPConsistency = {
            nameConsistent,
            addressConsistent,
            phoneConsistent,
            foundInstances,
            inconsistencies
        };

        // Calculate score
        let score = 100;
        if (!nameConsistent) score -= 30;
        if (!addressConsistent) score -= 30;
        if (!phoneConsistent) score -= 20;
        if (foundInstances.length === 0) score -= 20;

        // Generate issues and recommendations
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (!nameConsistent) {
            issues.push('Business name is inconsistent across the website');
            recommendations.push('Ensure business name is identical everywhere (exact spelling, capitalization, punctuation)');
        }
        if (!addressConsistent) {
            issues.push('Address formatting varies across the website');
            recommendations.push('Standardize address format using USPS guidelines');
        }
        if (!phoneConsistent) {
            issues.push('Phone number format is inconsistent');
            recommendations.push('Use consistent phone format (e.g., (555) 123-4567)');
        }
        if (foundInstances.length === 0) {
            issues.push('NAP information not found on website');
            recommendations.push('Add NAP information to header, footer, and contact page');
        }

        return {
            score: Math.max(0, score),
            consistency,
            issues,
            recommendations
        };
    }

    /**
     * Analyze local citations
     */
    async analyzeCitations(
        businessName: string,
        address: string,
        phone: string
    ): Promise<CitationAnalysis> {
        // Note: In production, this would make API calls to citation checking services
        // For now, we'll create a framework that can be filled in with real API calls

        const citations: Citation[] = [];
        const missingDirectories: string[] = [];

        // Major directories to check
        const directories = [
            'Google Business Profile',
            'Yelp',
            'Facebook',
            'Apple Maps',
            'Bing Places',
            'Yellow Pages',
            'Better Business Bureau',
            'Foursquare'
        ];

        // In production, check each directory via API
        // For now, simulate with placeholder data
        for (const directory of directories) {
            // This would be replaced with actual API calls
            const citation: Citation = {
                directory,
                consistent: true,
                verified: false,
                issues: []
            };

            // Randomly mark some as missing for demonstration
            if (Math.random() > 0.6) {
                missingDirectories.push(directory);
            } else {
                citations.push(citation);
            }
        }

        const total = citations.length;
        const consistent = citations.filter(c => c.consistent).length;
        const inconsistent = total - consistent;
        const missing = missingDirectories.length;

        // Calculate score based on citations
        const citationCoverage = (total / directories.length) * 100;
        const consistencyRate = total > 0 ? (consistent / total) * 100 : 0;
        const score = Math.round((citationCoverage * 0.6) + (consistencyRate * 0.4));

        return {
            total,
            consistent,
            inconsistent,
            missing,
            score,
            citations,
            missingDirectories
        };
    }

    /**
     * Analyze local schema markup
     */
    analyzeLocalSchema(html: string): LocalSchemaAnalysis {
        const { document } = parseHTML(html);
        const schemaScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

        let hasLocalBusiness = false;
        const schemaTypes: string[] = [];
        const completeness: SchemaCompleteness = {
            hasName: false,
            hasAddress: false,
            hasPhone: false,
            hasUrl: false,
            hasGeo: false,
            hasOpeningHours: false,
            hasImage: false,
            hasPriceRange: false,
            hasAggregateRating: false,
            hasReview: false,
            completenessPercentage: 0
        };

        for (const script of schemaScripts) {
            try {
                const schema = JSON.parse(script.textContent || '');
                const type = schema['@type'];

                if (type) {
                    schemaTypes.push(type);

                    if (type === 'LocalBusiness' || type.includes('LocalBusiness')) {
                        hasLocalBusiness = true;

                        // Check completeness
                        if (schema.name) completeness.hasName = true;
                        if (schema.address) completeness.hasAddress = true;
                        if (schema.telephone) completeness.hasPhone = true;
                        if (schema.url) completeness.hasUrl = true;
                        if (schema.geo) completeness.hasGeo = true;
                        if (schema.openingHoursSpecification) completeness.hasOpeningHours = true;
                        if (schema.image) completeness.hasImage = true;
                        if (schema.priceRange) completeness.hasPriceRange = true;
                        if (schema.aggregateRating) completeness.hasAggregateRating = true;
                        if (schema.review) completeness.hasReview = true;
                    }
                }
            } catch (e) {
                // Invalid JSON
            }
        }

        // Calculate completeness percentage
        const fields = Object.keys(completeness).filter(k => k !== 'completenessPercentage');
        const filledFields = fields.filter(k => completeness[k as keyof SchemaCompleteness]).length;
        completeness.completenessPercentage = Math.round((filledFields / fields.length) * 100);

        // Generate issues and recommendations
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (!hasLocalBusiness) {
            issues.push('No LocalBusiness schema markup found');
            recommendations.push('Add LocalBusiness schema markup to improve local search visibility');
        }

        if (!completeness.hasName) recommendations.push('Add business name to schema');
        if (!completeness.hasAddress) recommendations.push('Add address to schema');
        if (!completeness.hasPhone) recommendations.push('Add phone number to schema');
        if (!completeness.hasGeo) recommendations.push('Add geographic coordinates (latitude/longitude)');
        if (!completeness.hasOpeningHours) recommendations.push('Add business hours to schema');
        if (!completeness.hasImage) recommendations.push('Add business images to schema');
        if (!completeness.hasAggregateRating) recommendations.push('Add aggregate rating to schema');

        // Calculate score
        let score = hasLocalBusiness ? 50 : 0;
        score += (completeness.completenessPercentage / 2);

        return {
            score: Math.round(score),
            hasLocalBusiness,
            schemaTypes,
            completeness,
            issues,
            recommendations
        };
    }

    /**
     * Analyze Google Maps integration
     */
    analyzeMapsIntegration(html: string): MapsIntegrationAnalysis {
        const { document } = parseHTML(html);

        let hasEmbeddedMap = false;
        let hasDirectionsLink = false;
        let hasStoreLocator = false;
        let mapImplementation: MapImplementation | undefined;

        // Check for embedded maps
        const iframes = Array.from(document.querySelectorAll('iframe'));
        for (const iframe of iframes) {
            const src = iframe.getAttribute('src') || '';
            if (src.includes('google.com/maps')) {
                hasEmbeddedMap = true;
                mapImplementation = {
                    type: 'google_maps_embed',
                    features: ['embed']
                };
            }
        }

        // Check for Google Maps API usage
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const script of scripts) {
            const src = script.getAttribute('src') || '';
            if (src.includes('maps.googleapis.com')) {
                hasEmbeddedMap = true;
                const apiKeyMatch = src.match(/key=([^&]+)/);
                mapImplementation = {
                    type: 'google_maps_api',
                    apiKey: apiKeyMatch ? apiKeyMatch[1] : undefined,
                    features: ['api']
                };
            }
        }

        // Check for directions links
        const links = Array.from(document.querySelectorAll('a'));
        for (const link of links) {
            const href = link.getAttribute('href') || '';
            const text = link.textContent?.toLowerCase() || '';

            if (href.includes('google.com/maps') || text.includes('direction')) {
                hasDirectionsLink = true;
            }
            if (text.includes('store locator') || text.includes('locations')) {
                hasStoreLocator = true;
            }
        }

        // Generate issues and recommendations
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (!hasEmbeddedMap) {
            issues.push('No Google Maps embed found');
            recommendations.push('Add embedded Google Map to contact or location page');
        }
        if (!hasDirectionsLink) {
            issues.push('No directions link found');
            recommendations.push('Add "Get Directions" link to Google Maps');
        }

        // Calculate score
        let score = 0;
        if (hasEmbeddedMap) score += 50;
        if (hasDirectionsLink) score += 30;
        if (hasStoreLocator) score += 20;

        return {
            score,
            hasEmbeddedMap,
            hasDirectionsLink,
            hasStoreLocator,
            mapImplementation,
            issues,
            recommendations
        };
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    /**
     * Extract NAP from header
     */
    private extractNAPFromHeader(
        document: any,
        instances: NAPInstance[],
        expectedName: string,
        expectedAddress: string,
        expectedPhone: string,
        inconsistencies: NAPInconsistency[]
    ): void {
        const header = document.querySelector('header');
        if (!header) return;

        const text = header.textContent || '';
        const phone = this.extractPhone(text);

        if (phone) {
            instances.push({
                source: 'header',
                phone,
                confidence: 0.8
            });

            if (!this.isSimilar(phone, expectedPhone)) {
                inconsistencies.push({
                    field: 'phone',
                    expected: expectedPhone,
                    found: phone,
                    location: 'Header'
                });
            }
        }
    }

    /**
     * Extract NAP from footer
     */
    private extractNAPFromFooter(
        document: any,
        instances: NAPInstance[],
        expectedName: string,
        expectedAddress: string,
        expectedPhone: string,
        inconsistencies: NAPInconsistency[]
    ): void {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const text = footer.textContent || '';
        const phone = this.extractPhone(text);
        const address = this.extractAddress(text);

        if (phone || address) {
            instances.push({
                source: 'footer',
                address,
                phone,
                confidence: 0.9
            });

            if (phone && !this.isSimilar(phone, expectedPhone)) {
                inconsistencies.push({
                    field: 'phone',
                    expected: expectedPhone,
                    found: phone,
                    location: 'Footer'
                });
            }
        }
    }

    /**
     * Extract NAP from contact page
     */
    private extractNAPFromContactPage(
        document: any,
        instances: NAPInstance[],
        expectedName: string,
        expectedAddress: string,
        expectedPhone: string,
        inconsistencies: NAPInconsistency[]
    ): void {
        // Look for contact section or page
        const contactSection = document.querySelector('[class*="contact"], [id*="contact"]');
        if (!contactSection) return;

        const text = contactSection.textContent || '';
        const phone = this.extractPhone(text);
        const address = this.extractAddress(text);

        if (phone || address) {
            instances.push({
                source: 'contact_page',
                address,
                phone,
                confidence: 0.95
            });

            if (phone && !this.isSimilar(phone, expectedPhone)) {
                inconsistencies.push({
                    field: 'phone',
                    expected: expectedPhone,
                    found: phone,
                    location: 'Contact Page'
                });
            }
        }
    }

    /**
     * Extract phone number from text
     */
    private extractPhone(text: string): string | undefined {
        const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
        const match = text.match(phoneRegex);
        return match ? match[0].trim() : undefined;
    }

    /**
     * Extract address from text (basic implementation)
     */
    private extractAddress(text: string): string | undefined {
        // This is a simplified version - in production, use a proper address parsing library
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        for (const line of lines) {
            // Look for patterns like "123 Main St" or addresses with zip codes
            if (/\d+\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|boulevard)/i.test(line)) {
                return line;
            }
            if (/\d{5}(-\d{4})?/.test(line)) {
                // Found zip code, might be part of address
                return line;
            }
        }

        return undefined;
    }

    /**
     * Format address from schema object
     */
    private formatAddress(address: any): string | undefined {
        if (typeof address === 'string') return address;
        if (!address) return undefined;

        const parts: string[] = [];
        if (address.streetAddress) parts.push(address.streetAddress);
        if (address.addressLocality) parts.push(address.addressLocality);
        if (address.addressRegion) parts.push(address.addressRegion);
        if (address.postalCode) parts.push(address.postalCode);

        return parts.length > 0 ? parts.join(', ') : undefined;
    }

    /**
     * Check if two strings are similar (allowing for minor formatting differences)
     */
    private isSimilar(str1: string, str2: string): boolean {
        // Normalize both strings
        const normalize = (s: string) =>
            s.toLowerCase()
             .replace(/[^\w\s]/g, '') // Remove punctuation
             .replace(/\s+/g, ' ')    // Normalize whitespace
             .trim();

        return normalize(str1) === normalize(str2);
    }
}

/**
 * Singleton instance
 */
let analyzerInstance: LocalSEOAnalyzer | null = null;

export function getLocalSEOAnalyzer(): LocalSEOAnalyzer {
    if (!analyzerInstance) {
        analyzerInstance = new LocalSEOAnalyzer();
    }
    return analyzerInstance;
}
