/**
 * Document Processor Engine
 *
 * Orchestrates document processing pipeline:
 * 1. Ingestion (Buffer/GCS)
 * 2. Processing (Google Document AI)
 * 3. Standardization (Unified Schema)
 * 4. Insight Extraction (Heuristics/AI)
 */

import {
  getDocumentAIClient,
  ProcessedDocument,
  DocumentEntity,
  FormField,
} from '@/lib/google/document-ai-client';

import type {
  DocumentProcessingRequest,
  DocumentProcessingResult,
  DocumentClassification,
  DocumentType,
  InvoiceData,
  ReceiptData,
  ContractData,
  DocumentInsights,
  DocumentMetadata,
  ExtractionOptions,
} from './types';

export class DocumentProcessor {
  private client = getDocumentAIClient();

  /**
   * Process a document
   */
  async process(request: DocumentProcessingRequest): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    const options: ExtractionOptions = request.extractionOptions || {};

    try {
      // 1. Process with Document AI
      const processedDoc = await this.client.processDocument({
        content: request.content,
        gcsUri: request.gcsUri,
        mimeType: (request.mimeType as any) || 'application/pdf',
      });

      // 2. Classify Document
      const classification = this.classifyDocument(processedDoc, request.fileName);

      // 3. Extract Specialized Data
      const invoiceData =
        classification.type === 'invoice' ? this.extractInvoiceData(processedDoc) : undefined;
      const receiptData =
        classification.type === 'receipt' ? this.extractReceiptData(processedDoc) : undefined;
      const contractData =
        classification.type === 'contract' ? this.extractContractData(processedDoc) : undefined;

      // 4. Generate Insights
      const insights = this.generateInsights(processedDoc);

      // 5. Compile Metadata
      const metadata: DocumentMetadata = {
        fileName: request.fileName,
        mimeType: request.mimeType || 'unknown',
        pageCount: processedDoc.pages.length,
        processingTime: Date.now() - startTime,
        confidence: processedDoc.confidence,
        language: processedDoc.language,
        processedAt: new Date(),
      };

      return {
        raw: processedDoc,
        classification,
        invoiceData,
        receiptData,
        contractData,
        insights,
        metadata,
      };
    } catch (error: any) {
      console.error('[DocumentProcessor] Error:', error.message);
      throw error;
    }
  }

  /**
   * Classify document based on entities and text
   */
  private classifyDocument(doc: ProcessedDocument, fileName?: string): DocumentClassification {
    const text = doc.text.toLowerCase();

    // Simple heuristic classification
    // In a real scenario, this would use a dedicated classifier processor

    if (text.includes('invoice') || text.includes('bill to') || text.includes('amount due')) {
      return { type: 'invoice', confidence: 0.8 };
    }

    if (text.includes('receipt') || (text.includes('total') && text.includes('tax'))) {
      return { type: 'receipt', confidence: 0.7 };
    }

    if (text.includes('agreement') || text.includes('contract') || text.includes('parties')) {
      return { type: 'contract', confidence: 0.8 };
    }

    if (
      fileName?.toLowerCase().includes('resume') ||
      (text.includes('experience') && text.includes('education'))
    ) {
      return { type: 'resume', confidence: 0.7 };
    }

    return { type: 'other', confidence: 0.5 };
  }

  /**
   * Extract Invoice Data
   */
  private extractInvoiceData(doc: ProcessedDocument): InvoiceData {
    const getEntity = (type: string) => doc.entities.find((e) => e.type === type)?.mentionText;
    const getAmount = (type: string) => {
      const val = doc.entities.find((e) => e.type === type)?.normalizedValue;
      return val ? parseFloat(val) : undefined;
    };

    return {
      invoiceNumber: getEntity('invoice_id') || this.findField(doc.formFields, 'Invoice #'),
      invoiceDate: getEntity('invoice_date') || this.findField(doc.formFields, 'Date'),
      totalAmount: getAmount('total_amount'),
      currency: getEntity('currency'),
      supplierName: getEntity('supplier_name'),
      lineItems: [], // Would require complex visual parsing logic
    };
  }

  /**
   * Extract Receipt Data
   */
  private extractReceiptData(doc: ProcessedDocument): ReceiptData {
    const getEntity = (type: string) => doc.entities.find((e) => e.type === type)?.mentionText;

    return {
      merchantName: getEntity('supplier_name') || getEntity('merchant_name'),
      transactionDate: getEntity('receipt_date'),
      total: parseFloat(getEntity('total_amount') || '0'),
      items: [],
    };
  }

  /**
   * Extract Contract Data
   */
  private extractContractData(doc: ProcessedDocument): ContractData {
    return {
      parties: [],
      terms: [],
      signatures: [],
    };
  }

  private findField(fields: FormField[], name: string): string | undefined {
    return fields.find((f) => f.fieldName.toLowerCase().includes(name.toLowerCase()))?.fieldValue;
  }

  /**
   * Generate Insights
   */
  private generateInsights(doc: ProcessedDocument): DocumentInsights {
    // Extract specialized entities
    const moneyEntities = doc.entities.filter(
      (e) => e.type.includes('amount') || e.type.includes('money'),
    );
    const dateEntities = doc.entities.filter((e) => e.type.includes('date'));
    const orgEntities = doc.entities.filter(
      (e) => e.type.includes('org') || e.type.includes('supplier') || e.type.includes('company'),
    );
    const personEntities = doc.entities.filter(
      (e) => e.type.includes('person') || e.type.includes('name'),
    );
    const locEntities = doc.entities.filter(
      (e) => e.type.includes('address') || e.type.includes('location'),
    );

    return {
      keyAmounts: moneyEntities
        .map((e) => parseFloat(e.normalizedValue || '0'))
        .filter((n) => !isNaN(n)),
      keyDates: dateEntities.map((e) => e.normalizedValue || e.mentionText),
      keyOrganizations: [...new Set(orgEntities.map((e) => e.mentionText))],
      keyPeople: [...new Set(personEntities.map((e) => e.mentionText))],
      keyLocations: [...new Set(locEntities.map((e) => e.mentionText))],
      topics: [],
      sentiment: 'neutral',
    };
  }
}

// Singleton
let processorInstance: DocumentProcessor | null = null;

export function getDocumentProcessor(): DocumentProcessor {
  if (!processorInstance) {
    processorInstance = new DocumentProcessor();
  }
  return processorInstance;
}
