/**
 * Google Cloud Document AI Client
 *
 * Provides document processing capabilities including:
 * - OCR (Optical Character Recognition)
 * - Form parsing (invoices, receipts, contracts)
 * - Entity extraction (names, dates, amounts, addresses)
 * - Document classification
 * - Handwriting recognition
 * - Multi-language support
 *
 * @see https://cloud.google.com/document-ai/docs
 */

import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';

// ============================================================================
// Types
// ============================================================================

export interface DocumentAIConfig {
  projectId: string;
  location: string; // 'us' or 'eu'
  processorId: string; // Created in Cloud Console
  credentials?: {
    client_email: string;
    private_key: string;
  };
}

export interface ProcessDocumentOptions {
  content?: Buffer | string; // Base64 encoded or Buffer
  gcsUri?: string; // Alternative: GCS URI
  mimeType:
    | 'application/pdf'
    | 'image/png'
    | 'image/jpeg'
    | 'image/tiff'
    | 'image/gif'
    | 'image/bmp';
}

export interface DocumentEntity {
  type: string; // e.g., 'person', 'date', 'total_amount', 'invoice_number'
  mentionText: string; // The actual text extracted
  confidence: number; // 0-1
  normalizedValue?: string; // Standardized value (e.g., date in ISO format)
  pageRef?: number; // Page number (0-indexed)
}

export interface FormField {
  fieldName: string;
  fieldValue: string;
  nameConfidence: number; // 0-1
  valueConfidence: number; // 0-1
  pageRef?: number;
}

export interface DocumentPage {
  pageNumber: number;
  width: number;
  height: number;
  paragraphs: string[];
  tables?: TableData[];
}

export interface TableData {
  rowCount: number;
  columnCount: number;
  headerRows: string[][];
  bodyRows: string[][];
}

export interface ProcessedDocument {
  text: string; // Full extracted text
  entities: DocumentEntity[];
  formFields: FormField[];
  pages: DocumentPage[];
  language?: string;
  confidence: number; // Overall confidence (0-1)
}

// ============================================================================
// Document AI Client
// ============================================================================

export class DocumentAIClient {
  private client: DocumentProcessorServiceClient | null = null;
  private config: DocumentAIConfig;
  private isConfigured: boolean = false;

  constructor(config?: Partial<DocumentAIConfig>) {
    // Try to load from environment
    const projectId = config?.projectId || process.env.GOOGLE_CLOUD_PROJECT;
    const location = config?.location || process.env.DOCUMENT_AI_LOCATION || 'us';
    const processorId = config?.processorId || process.env.DOCUMENT_AI_PROCESSOR_ID;

    if (!projectId || !processorId) {
      console.warn(
        '[DocumentAIClient] Missing configuration. Document processing will be disabled.',
      );
      this.config = {} as DocumentAIConfig;
      return;
    }

    this.config = {
      projectId,
      location,
      processorId,
      credentials: config?.credentials,
    };

    try {
      // Initialize Google Auth
      const authOptions: any = {};

      if (this.config.credentials) {
        // Use provided credentials
        authOptions.credentials = this.config.credentials;
      } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        // Use environment variables
        authOptions.credentials = {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
      }
      // Otherwise will use Application Default Credentials

      // Set API endpoint based on location
      const apiEndpoint = `${this.config.location}-documentai.googleapis.com`;

      this.client = new DocumentProcessorServiceClient({
        ...authOptions,
        apiEndpoint,
      });

      this.isConfigured = true;
      console.log(`[DocumentAIClient] Initialized with processor ${processorId} in ${location}`);
    } catch (error: any) {
      console.error('[DocumentAIClient] Failed to initialize:', error.message);
    }
  }

  /**
   * Check if Document AI is configured
   */
  public configured(): boolean {
    return this.isConfigured;
  }

  /**
   * Process a document and extract structured data
   */
  async processDocument(options: ProcessDocumentOptions): Promise<ProcessedDocument> {
    if (!this.isConfigured || !this.client) {
      throw new Error(
        'Document AI client is not configured. Please set GOOGLE_CLOUD_PROJECT and DOCUMENT_AI_PROCESSOR_ID environment variables.',
      );
    }

    try {
      const { projectId, location, processorId } = this.config;
      const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

      // Prepare document content
      let documentContent: any;

      if (options.gcsUri) {
        // Use GCS URI
        documentContent = {
          gcsUri: options.gcsUri,
          mimeType: options.mimeType,
        };
      } else if (options.content) {
        // Use raw content (Buffer or base64 string)
        const content = Buffer.isBuffer(options.content)
          ? options.content.toString('base64')
          : options.content;

        documentContent = {
          content,
          mimeType: options.mimeType,
        };
      } else {
        throw new Error('Either content or gcsUri must be provided');
      }

      // Create request
      const request = {
        name,
        rawDocument: documentContent,
      };

      console.log(`[DocumentAIClient] Processing document with processor ${processorId}...`);

      // Process document
      const [result] = await this.client.processDocument(request);
      const document = result.document;

      if (!document) {
        throw new Error('No document returned from Document AI');
      }

      // Extract text
      const text = document.text || '';

      // Extract entities
      const entities = this.extractEntities(document, text);

      // Extract form fields
      const formFields = this.extractFormFields(document, text);

      // Extract pages
      const pages = this.extractPages(document, text);

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(entities, formFields);

      return {
        text,
        entities,
        formFields,
        pages,
        language: document.pages?.[0]?.detectedLanguages?.[0]?.languageCode || undefined,
        confidence,
      };
    } catch (error: any) {
      console.error('[DocumentAIClient] Error processing document:', error.message);
      throw error;
    }
  }

  /**
   * Process a document from file path
   */
  async processFile(
    filePath: string,
    mimeType: ProcessDocumentOptions['mimeType'],
  ): Promise<ProcessedDocument> {
    const content = readFileSync(filePath);
    return this.processDocument({ content, mimeType });
  }

  /**
   * Extract entities from document
   */
  private extractEntities(document: any, text: string): DocumentEntity[] {
    const entities: DocumentEntity[] = [];

    if (!document.entities) return entities;

    for (const entity of document.entities) {
      const pageRefs = entity.pageAnchor?.pageRefs || [];
      const pageRef = pageRefs.length > 0 ? pageRefs[0].page : undefined;

      entities.push({
        type: entity.type || 'unknown',
        mentionText: entity.mentionText || this.getTextFromAnchor(entity.textAnchor, text),
        confidence: entity.confidence || 0,
        normalizedValue: entity.normalizedValue?.text,
        pageRef,
      });
    }

    return entities;
  }

  /**
   * Extract form fields from document
   */
  private extractFormFields(document: any, text: string): FormField[] {
    const formFields: FormField[] = [];

    if (!document.pages) return formFields;

    for (const page of document.pages) {
      if (!page.formFields) continue;

      const pageNumber = page.pageNumber || 0;

      for (const field of page.formFields) {
        const fieldName = this.getTextFromAnchor(field.fieldName?.textAnchor, text);
        const fieldValue = this.getTextFromAnchor(field.fieldValue?.textAnchor, text);

        formFields.push({
          fieldName: fieldName.trim(),
          fieldValue: fieldValue.trim(),
          nameConfidence: field.fieldName?.confidence || 0,
          valueConfidence: field.fieldValue?.confidence || 0,
          pageRef: pageNumber,
        });
      }
    }

    return formFields;
  }

  /**
   * Extract pages with layout information
   */
  private extractPages(document: any, text: string): DocumentPage[] {
    const pages: DocumentPage[] = [];

    if (!document.pages) return pages;

    for (const page of document.pages) {
      const pageNumber = page.pageNumber || 0;
      const dimension = page.dimension || { width: 0, height: 0 };

      // Extract paragraphs
      const paragraphs: string[] = [];
      if (page.paragraphs) {
        for (const paragraph of page.paragraphs) {
          const paragraphText = this.getTextFromAnchor(paragraph.layout?.textAnchor, text);
          if (paragraphText.trim()) {
            paragraphs.push(paragraphText.trim());
          }
        }
      }

      // Extract tables
      const tables: TableData[] = [];
      if (page.tables) {
        for (const table of page.tables) {
          tables.push(this.extractTableData(table, text));
        }
      }

      pages.push({
        pageNumber,
        width: dimension.width,
        height: dimension.height,
        paragraphs,
        tables,
      });
    }

    return pages;
  }

  /**
   * Extract table data
   */
  private extractTableData(table: any, text: string): TableData {
    const headerRows: string[][] = [];
    const bodyRows: string[][] = [];

    // Extract header rows
    if (table.headerRows) {
      for (const row of table.headerRows) {
        const cells: string[] = [];
        if (row.cells) {
          for (const cell of row.cells) {
            const cellText = this.getTextFromAnchor(cell.layout?.textAnchor, text);
            cells.push(cellText.trim());
          }
        }
        headerRows.push(cells);
      }
    }

    // Extract body rows
    if (table.bodyRows) {
      for (const row of table.bodyRows) {
        const cells: string[] = [];
        if (row.cells) {
          for (const cell of row.cells) {
            const cellText = this.getTextFromAnchor(cell.layout?.textAnchor, text);
            cells.push(cellText.trim());
          }
        }
        bodyRows.push(cells);
      }
    }

    const columnCount =
      headerRows.length > 0 ? headerRows[0].length : bodyRows.length > 0 ? bodyRows[0].length : 0;
    const rowCount = bodyRows.length;

    return {
      rowCount,
      columnCount,
      headerRows,
      bodyRows,
    };
  }

  /**
   * Extract text from text anchor
   */
  private getTextFromAnchor(textAnchor: any, fullText: string): string {
    if (!textAnchor || !textAnchor.textSegments || textAnchor.textSegments.length === 0) {
      return '';
    }

    const segment = textAnchor.textSegments[0];
    const startIndex = parseInt(segment.startIndex) || 0;
    const endIndex = parseInt(segment.endIndex) || fullText.length;

    return fullText.substring(startIndex, endIndex);
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(entities: DocumentEntity[], formFields: FormField[]): number {
    let totalConfidence = 0;
    let count = 0;

    // Average entity confidence
    for (const entity of entities) {
      totalConfidence += entity.confidence;
      count++;
    }

    // Average form field confidence
    for (const field of formFields) {
      totalConfidence += (field.nameConfidence + field.valueConfidence) / 2;
      count++;
    }

    return count > 0 ? totalConfidence / count : 0;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let clientInstance: DocumentAIClient | null = null;

export function getDocumentAIClient(config?: Partial<DocumentAIConfig>): DocumentAIClient {
  if (!clientInstance) {
    clientInstance = new DocumentAIClient(config);
  }
  return clientInstance;
}

/**
 * Helper function to determine MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): ProcessDocumentOptions['mimeType'] {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'tif':
    case 'tiff':
      return 'image/tiff';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    default:
      throw new Error(`Unsupported file extension: ${ext}`);
  }
}
