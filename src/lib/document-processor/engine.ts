/**
 * Document Processing Engine
 *
 * High-level document processing with classification, entity extraction,
 * and specialized data parsing for invoices, receipts, contracts, etc.
 */

import { getDocumentAIClient, getMimeTypeFromExtension } from '@/lib/google/document-ai-client';
import type { ProcessedDocument, DocumentEntity, FormField, ProcessDocumentOptions } from '@/lib/google/document-ai-client';
import type {
    DocumentProcessingRequest,
    DocumentProcessingResult,
    DocumentClassification,
    DocumentType,
    ExtractionOptions,
    InvoiceData,
    ReceiptData,
    ContractData,
    FormData,
    ResumeData,
    DocumentInsights,
    DocumentMetadata,
    BatchProcessingRequest,
    BatchProcessingResult,
    BatchProgress,
    BatchSummary
} from './types';
import { readFileSync } from 'fs';

// ============================================================================
// Document Processing Engine
// ============================================================================

export class DocumentProcessor {
    private client = getDocumentAIClient();

    /**
     * Process a single document
     */
    async process(request: DocumentProcessingRequest): Promise<DocumentProcessingResult> {
        const startTime = Date.now();

        try {
            // Prepare document content
            const { content, mimeType } = await this.prepareDocument(request);

            // Default extraction options
            const options: Required<ExtractionOptions> = {
                classifyDocument: true,
                extractEntities: true,
                extractFormFields: true,
                extractTables: true,
                parseSpecializedData: true,
                ocrLanguages: ['en'],
                ...request.extractionOptions
            };

            // Process with Document AI
            const raw = await this.client.processDocument({
                content,
                mimeType: mimeType as ProcessDocumentOptions['mimeType']
            });

            // Classify document
            const classification = options.classifyDocument
                ? this.classifyDocument(raw)
                : undefined;

            // Extract specialized data based on classification
            let invoiceData: InvoiceData | undefined;
            let receiptData: ReceiptData | undefined;
            let contractData: ContractData | undefined;
            let formData: FormData | undefined;
            let resumeData: ResumeData | undefined;

            if (options.parseSpecializedData && classification) {
                switch (classification.type) {
                    case 'invoice':
                        invoiceData = this.extractInvoiceData(raw);
                        break;
                    case 'receipt':
                        receiptData = this.extractReceiptData(raw);
                        break;
                    case 'contract':
                        contractData = this.extractContractData(raw);
                        break;
                    case 'form':
                        formData = this.extractFormData(raw);
                        break;
                    case 'resume':
                        resumeData = this.extractResumeData(raw);
                        break;
                }
            }

            // Extract insights
            const insights = this.extractInsights(raw);

            // Build metadata
            const processingTime = Date.now() - startTime;
            const metadata: DocumentMetadata = {
                fileName: request.fileName,
                mimeType,
                pageCount: raw.pages.length,
                processingTime,
                confidence: raw.confidence,
                language: raw.language,
                processedAt: new Date()
            };

            return {
                raw,
                classification,
                invoiceData,
                receiptData,
                contractData,
                formData,
                resumeData,
                insights,
                metadata
            };
        } catch (error: any) {
            console.error('[DocumentProcessor] Error processing document:', error.message);
            throw error;
        }
    }

    /**
     * Process multiple documents in batch
     */
    async processBatch(request: BatchProcessingRequest): Promise<BatchProcessingResult> {
        const startTime = Date.now();
        const results: DocumentProcessingResult[] = [];
        const failed: Error[] = [];

        const progress: BatchProgress = {
            total: request.documents.length,
            completed: 0,
            failed: 0
        };

        for (const doc of request.documents) {
            try {
                progress.currentDocument = doc.fileName || 'unknown';
                request.onProgress?.(progress);

                const result = await this.process({
                    ...doc,
                    extractionOptions: request.extractionOptions
                });

                results.push(result);
                progress.completed++;
            } catch (error: any) {
                failed.push(error);
                progress.failed++;
            }

            request.onProgress?.(progress);
        }

        const totalProcessingTime = Date.now() - startTime;

        // Build summary
        const summary: BatchSummary = {
            total: request.documents.length,
            successful: results.length,
            failed: failed.length,
            totalProcessingTime,
            averageConfidence: results.reduce((sum, r) => sum + r.metadata.confidence, 0) / results.length,
            documentTypeBreakdown: this.buildDocumentTypeBreakdown(results)
        };

        return { results, summary };
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    /**
     * Prepare document content and MIME type
     */
    private async prepareDocument(
        request: DocumentProcessingRequest
    ): Promise<{ content: Buffer | string; mimeType: string }> {
        let content: Buffer | string;
        let mimeType: string;

        if (request.filePath) {
            // Read from file path
            content = readFileSync(request.filePath);
            mimeType = request.mimeType || getMimeTypeFromExtension(request.filePath);
        } else if (request.content) {
            // Use provided content
            content = request.content;
            if (!request.mimeType) {
                throw new Error('mimeType is required when providing content directly');
            }
            mimeType = request.mimeType;
        } else if (request.gcsUri) {
            // GCS URI (pass through to Document AI)
            throw new Error('GCS URI support not yet implemented in this layer');
        } else {
            throw new Error('Either content, filePath, or gcsUri must be provided');
        }

        return { content, mimeType };
    }

    /**
     * Classify document based on content analysis
     */
    private classifyDocument(doc: ProcessedDocument): DocumentClassification {
        const text = doc.text.toLowerCase();
        const entities = doc.entities.map(e => e.type.toLowerCase());

        // Invoice detection
        if (
            entities.includes('invoice_number') ||
            entities.includes('total_amount') ||
            text.includes('invoice') ||
            (text.includes('amount due') && text.includes('payment'))
        ) {
            return { type: 'invoice', confidence: 0.9 };
        }

        // Receipt detection
        if (
            entities.includes('receipt_date') ||
            text.includes('receipt') ||
            (text.includes('subtotal') && text.includes('tax') && text.includes('total'))
        ) {
            return { type: 'receipt', confidence: 0.85 };
        }

        // Contract detection
        if (
            text.includes('agreement') ||
            text.includes('contract') ||
            text.includes('party') && text.includes('whereas')
        ) {
            return { type: 'contract', confidence: 0.8 };
        }

        // Resume detection
        if (
            (text.includes('experience') || text.includes('education')) &&
            (text.includes('skills') || text.includes('employment'))
        ) {
            return { type: 'resume', confidence: 0.75 };
        }

        // Form detection
        if (doc.formFields.length > 5) {
            return { type: 'form', confidence: 0.8 };
        }

        // Default
        return { type: 'other', confidence: 0.5 };
    }

    /**
     * Extract invoice-specific data
     */
    private extractInvoiceData(doc: ProcessedDocument): InvoiceData {
        const data: InvoiceData = {
            lineItems: []
        };

        // Extract from entities
        for (const entity of doc.entities) {
            switch (entity.type.toLowerCase()) {
                case 'invoice_number':
                case 'invoice_id':
                    data.invoiceNumber = entity.mentionText;
                    break;
                case 'invoice_date':
                    data.invoiceDate = entity.normalizedValue || entity.mentionText;
                    break;
                case 'due_date':
                case 'payment_due_date':
                    data.dueDate = entity.normalizedValue || entity.mentionText;
                    break;
                case 'supplier_name':
                case 'vendor_name':
                    data.supplierName = entity.mentionText;
                    break;
                case 'supplier_address':
                    data.supplierAddress = entity.mentionText;
                    break;
                case 'receiver_name':
                case 'customer_name':
                    data.customerName = entity.mentionText;
                    break;
                case 'total_amount':
                case 'total':
                    data.totalAmount = parseFloat(entity.mentionText.replace(/[^0-9.]/g, ''));
                    break;
                case 'total_tax_amount':
                case 'tax':
                    data.taxAmount = parseFloat(entity.mentionText.replace(/[^0-9.]/g, ''));
                    break;
                case 'net_amount':
                case 'subtotal':
                    data.subtotal = parseFloat(entity.mentionText.replace(/[^0-9.]/g, ''));
                    break;
                case 'currency':
                    data.currency = entity.mentionText;
                    break;
            }
        }

        // Extract line items from tables
        for (const page of doc.pages) {
            if (page.tables) {
                for (const table of page.tables) {
                    if (table.bodyRows.length > 0) {
                        for (const row of table.bodyRows) {
                            if (row.length >= 2) {
                                data.lineItems.push({
                                    description: row[0],
                                    quantity: row.length > 1 ? parseFloat(row[1]) : undefined,
                                    unitPrice: row.length > 2 ? parseFloat(row[2].replace(/[^0-9.]/g, '')) : undefined,
                                    amount: row.length > 3 ? parseFloat(row[3].replace(/[^0-9.]/g, '')) : undefined
                                });
                            }
                        }
                    }
                }
            }
        }

        return data;
    }

    /**
     * Extract receipt-specific data
     */
    private extractReceiptData(doc: ProcessedDocument): ReceiptData {
        const data: ReceiptData = {
            items: []
        };

        for (const entity of doc.entities) {
            switch (entity.type.toLowerCase()) {
                case 'supplier_name':
                case 'merchant_name':
                    data.merchantName = entity.mentionText;
                    break;
                case 'supplier_address':
                case 'merchant_address':
                    data.merchantAddress = entity.mentionText;
                    break;
                case 'receipt_date':
                case 'transaction_date':
                    data.transactionDate = entity.normalizedValue || entity.mentionText;
                    break;
                case 'total_amount':
                    data.total = parseFloat(entity.mentionText.replace(/[^0-9.]/g, ''));
                    break;
                case 'total_tax_amount':
                    data.tax = parseFloat(entity.mentionText.replace(/[^0-9.]/g, ''));
                    break;
                case 'currency':
                    data.currency = entity.mentionText;
                    break;
            }
        }

        return data;
    }

    /**
     * Extract contract-specific data
     */
    private extractContractData(doc: ProcessedDocument): ContractData {
        const data: ContractData = {
            parties: [],
            terms: [],
            signatures: []
        };

        // Extract dates
        for (const entity of doc.entities) {
            if (entity.type.toLowerCase().includes('date')) {
                if (!data.contractDate) {
                    data.contractDate = entity.normalizedValue || entity.mentionText;
                }
            }
        }

        // Extract parties (simplified - would need more sophisticated NER)
        const personEntities = doc.entities.filter(e => e.type.toLowerCase().includes('person'));
        for (const person of personEntities) {
            data.parties.push({
                name: person.mentionText,
                role: 'party_a'
            });
        }

        return data;
    }

    /**
     * Extract form data
     */
    private extractFormData(doc: ProcessedDocument): FormData {
        const fields: Record<string, string | number | boolean> = {};

        for (const field of doc.formFields) {
            // Try to parse as number
            const numValue = parseFloat(field.fieldValue);
            if (!isNaN(numValue)) {
                fields[field.fieldName] = numValue;
            } else {
                fields[field.fieldName] = field.fieldValue;
            }
        }

        return { fields };
    }

    /**
     * Extract resume data
     */
    private extractResumeData(doc: ProcessedDocument): ResumeData {
        const data: ResumeData = {
            workExperience: [],
            education: [],
            skills: [],
            certifications: []
        };

        // Extract contact info
        for (const entity of doc.entities) {
            switch (entity.type.toLowerCase()) {
                case 'person':
                    if (!data.candidateName) {
                        data.candidateName = entity.mentionText;
                    }
                    break;
                case 'email':
                case 'email_address':
                    data.email = entity.mentionText;
                    break;
                case 'phone_number':
                    data.phone = entity.mentionText;
                    break;
            }
        }

        return data;
    }

    /**
     * Extract insights from document
     */
    private extractInsights(doc: ProcessedDocument): DocumentInsights {
        const keyPeople: Set<string> = new Set();
        const keyOrganizations: Set<string> = new Set();
        const keyDates: Set<string> = new Set();
        const keyAmounts: number[] = [];
        const keyLocations: Set<string> = new Set();

        for (const entity of doc.entities) {
            const type = entity.type.toLowerCase();

            if (type.includes('person') || type.includes('name')) {
                keyPeople.add(entity.mentionText);
            } else if (type.includes('organization') || type.includes('company')) {
                keyOrganizations.add(entity.mentionText);
            } else if (type.includes('date')) {
                keyDates.add(entity.normalizedValue || entity.mentionText);
            } else if (type.includes('amount') || type.includes('price') || type.includes('total')) {
                const amount = parseFloat(entity.mentionText.replace(/[^0-9.]/g, ''));
                if (!isNaN(amount)) {
                    keyAmounts.push(amount);
                }
            } else if (type.includes('address') || type.includes('location')) {
                keyLocations.add(entity.mentionText);
            }
        }

        return {
            keyPeople: Array.from(keyPeople),
            keyOrganizations: Array.from(keyOrganizations),
            keyDates: Array.from(keyDates),
            keyAmounts,
            keyLocations: Array.from(keyLocations),
            topics: [] // Would need topic modeling/NLP for this
        };
    }

    /**
     * Build document type breakdown
     */
    private buildDocumentTypeBreakdown(results: DocumentProcessingResult[]): Record<DocumentType, number> {
        const breakdown: Record<DocumentType, number> = {
            invoice: 0,
            receipt: 0,
            contract: 0,
            form: 0,
            letter: 0,
            resume: 0,
            report: 0,
            marketing_material: 0,
            presentation: 0,
            spreadsheet: 0,
            other: 0
        };

        for (const result of results) {
            if (result.classification) {
                breakdown[result.classification.type]++;
            }
        }

        return breakdown;
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let processorInstance: DocumentProcessor | null = null;

export function getDocumentProcessor(): DocumentProcessor {
    if (!processorInstance) {
        processorInstance = new DocumentProcessor();
    }
    return processorInstance;
}
