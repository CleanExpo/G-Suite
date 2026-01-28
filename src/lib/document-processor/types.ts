/**
 * Document Processor Types
 *
 * Comprehensive types for document processing, classification, and data extraction
 */

import type { ProcessedDocument, DocumentEntity, FormField } from '@/lib/google/document-ai-client';

// ============================================================================
// Document Classification
// ============================================================================

export type DocumentType =
    | 'invoice'
    | 'receipt'
    | 'contract'
    | 'form'
    | 'letter'
    | 'resume'
    | 'report'
    | 'marketing_material'
    | 'presentation'
    | 'spreadsheet'
    | 'other';

export interface DocumentClassification {
    type: DocumentType;
    confidence: number; // 0-1
    subtype?: string; // e.g., 'purchase_order', 'tax_invoice'
}

// ============================================================================
// Specialized Document Types
// ============================================================================

export interface InvoiceData {
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    supplierName?: string;
    supplierAddress?: string;
    supplierTaxId?: string;
    customerName?: string;
    customerAddress?: string;
    lineItems: InvoiceLineItem[];
    subtotal?: number;
    taxAmount?: number;
    totalAmount?: number;
    currency?: string;
    paymentTerms?: string;
}

export interface InvoiceLineItem {
    description: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
}

export interface ReceiptData {
    merchantName?: string;
    merchantAddress?: string;
    transactionDate?: string;
    transactionTime?: string;
    items: ReceiptItem[];
    subtotal?: number;
    tax?: number;
    tip?: number;
    total?: number;
    currency?: string;
    paymentMethod?: string;
    cardLastFour?: string;
}

export interface ReceiptItem {
    description: string;
    quantity?: number;
    price?: number;
}

export interface ContractData {
    contractTitle?: string;
    contractDate?: string;
    effectiveDate?: string;
    expirationDate?: string;
    parties: ContractParty[];
    terms: string[];
    signatures: ContractSignature[];
}

export interface ContractParty {
    name: string;
    role: 'party_a' | 'party_b' | 'witness' | 'other';
    address?: string;
    representative?: string;
}

export interface ContractSignature {
    signerName?: string;
    signatureDate?: string;
    title?: string;
}

export interface FormData {
    formType?: string;
    submissionDate?: string;
    fields: Record<string, string | number | boolean>;
}

export interface ResumeData {
    candidateName?: string;
    email?: string;
    phone?: string;
    address?: string;
    summary?: string;
    workExperience: WorkExperience[];
    education: Education[];
    skills: string[];
    certifications: string[];
}

export interface WorkExperience {
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface Education {
    institution: string;
    degree?: string;
    field?: string;
    graduationDate?: string;
}

// ============================================================================
// Processing Request & Result
// ============================================================================

export interface DocumentProcessingRequest {
    content?: Buffer | string; // Document content
    filePath?: string; // Alternative: file path
    gcsUri?: string; // Alternative: GCS URI
    fileName?: string; // Original file name
    mimeType?: string; // Will be auto-detected if not provided
    extractionOptions?: ExtractionOptions;
}

export interface ExtractionOptions {
    classifyDocument?: boolean; // Auto-detect document type
    extractEntities?: boolean; // Extract named entities
    extractFormFields?: boolean; // Extract form key-value pairs
    extractTables?: boolean; // Extract table data
    parseSpecializedData?: boolean; // Parse invoice/receipt/contract specific data
    ocrLanguages?: string[]; // OCR language hints (e.g., ['en', 'es'])
}

export interface DocumentProcessingResult {
    // Original data from Document AI
    raw: ProcessedDocument;

    // Classification
    classification?: DocumentClassification;

    // Specialized data (if applicable)
    invoiceData?: InvoiceData;
    receiptData?: ReceiptData;
    contractData?: ContractData;
    formData?: FormData;
    resumeData?: ResumeData;

    // Extracted insights
    insights: DocumentInsights;

    // Metadata
    metadata: DocumentMetadata;
}

export interface DocumentInsights {
    keyPeople: string[]; // Extracted person names
    keyOrganizations: string[]; // Extracted company/org names
    keyDates: string[]; // Important dates
    keyAmounts: number[]; // Monetary amounts
    keyLocations: string[]; // Locations/addresses
    topics: string[]; // Identified topics/themes
    sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface DocumentMetadata {
    fileName?: string;
    fileSize?: number;
    mimeType: string;
    pageCount: number;
    processingTime: number; // milliseconds
    confidence: number; // Overall confidence (0-1)
    language?: string;
    processedAt: Date;
}

// ============================================================================
// Batch Processing
// ============================================================================

export interface BatchProcessingRequest {
    documents: DocumentProcessingRequest[];
    extractionOptions?: ExtractionOptions;
    onProgress?: (progress: BatchProgress) => void;
}

export interface BatchProgress {
    total: number;
    completed: number;
    failed: number;
    currentDocument?: string;
}

export interface BatchProcessingResult {
    results: DocumentProcessingResult[];
    summary: BatchSummary;
}

export interface BatchSummary {
    total: number;
    successful: number;
    failed: number;
    totalProcessingTime: number; // milliseconds
    averageConfidence: number;
    documentTypeBreakdown: Record<DocumentType, number>;
}

// ============================================================================
// Document Storage
// ============================================================================

export interface StoredDocument {
    id: string;
    userId: string;
    originalFileName: string;
    storagePath: string; // GCS or local path
    mimeType: string;
    fileSize: number;
    classification: DocumentClassification;
    extractedData: DocumentProcessingResult;
    uploadedAt: Date;
    processedAt: Date;
    tags: string[];
    metadata: Record<string, unknown>;
}

// ============================================================================
// Search & Query
// ============================================================================

export interface DocumentSearchQuery {
    userId: string;
    text?: string; // Full-text search
    documentType?: DocumentType;
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
    minConfidence?: number;
    limit?: number;
    offset?: number;
}

export interface DocumentSearchResult {
    documents: StoredDocument[];
    total: number;
    hasMore: boolean;
}

// ============================================================================
// Analytics
// ============================================================================

export interface DocumentAnalytics {
    userId: string;
    totalDocuments: number;
    documentsByType: Record<DocumentType, number>;
    averageConfidence: number;
    totalProcessingTime: number;
    mostCommonEntities: EntityFrequency[];
    recentDocuments: StoredDocument[];
}

export interface EntityFrequency {
    type: string;
    value: string;
    count: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ProcessingError {
    code: 'INVALID_FORMAT' | 'PROCESSING_FAILED' | 'QUOTA_EXCEEDED' | 'UNKNOWN_ERROR';
    message: string;
    details?: unknown;
}
