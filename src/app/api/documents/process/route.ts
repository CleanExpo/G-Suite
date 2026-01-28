/**
 * Document Processing API
 *
 * POST /api/documents/process
 *
 * Processes uploaded documents with OCR, entity extraction, and classification
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDocumentProcessor } from '@/lib/document-processor/engine';
import { getMimeTypeFromExtension } from '@/lib/google/document-ai-client';
import type { DocumentProcessingRequest, ExtractionOptions } from '@/lib/document-processor/types';

export const maxDuration = 300; // 5 minutes for document processing

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized - Please sign in' },
                { status: 401 }
            );
        }

        // Parse form data
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Get extraction options
        const classifyDocument = formData.get('classifyDocument') === 'true';
        const extractEntities = formData.get('extractEntities') !== 'false'; // Default true
        const extractFormFields = formData.get('extractFormFields') !== 'false'; // Default true
        const extractTables = formData.get('extractTables') !== 'false'; // Default true
        const parseSpecializedData = formData.get('parseSpecializedData') !== 'false'; // Default true

        const extractionOptions: ExtractionOptions = {
            classifyDocument,
            extractEntities,
            extractFormFields,
            extractTables,
            parseSpecializedData
        };

        // Validate file size (max 20MB)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Validate file type
        const supportedTypes = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/tiff',
            'image/gif',
            'image/bmp'
        ];

        let mimeType: string;
        try {
            mimeType = file.type || getMimeTypeFromExtension(file.name);
        } catch {
            return NextResponse.json(
                { error: 'Unsupported file type' },
                { status: 400 }
            );
        }

        if (!supportedTypes.includes(mimeType)) {
            return NextResponse.json(
                {
                    error: 'Unsupported file type. Supported: PDF, PNG, JPEG, TIFF, GIF, BMP',
                    supportedTypes
                },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Prepare processing request
        const processingRequest: DocumentProcessingRequest = {
            content: buffer,
            fileName: file.name,
            mimeType,
            extractionOptions
        };

        // Process document
        const processor = getDocumentProcessor();
        const result = await processor.process(processingRequest);

        // Return result
        return NextResponse.json({
            success: true,
            data: {
                // Include all processing results
                classification: result.classification,
                invoiceData: result.invoiceData,
                receiptData: result.receiptData,
                contractData: result.contractData,
                formData: result.formData,
                resumeData: result.resumeData,
                insights: result.insights,
                metadata: result.metadata,
                // Include raw data for debugging
                raw: {
                    text: result.raw.text,
                    entities: result.raw.entities,
                    formFields: result.raw.formFields,
                    pageCount: result.raw.pages.length,
                    confidence: result.raw.confidence
                }
            }
        });
    } catch (error: any) {
        console.error('[API] Error processing document:', error);

        // Handle specific error cases
        if (error.message?.includes('not configured')) {
            return NextResponse.json(
                {
                    error: 'Document AI is not configured. Please set up Google Cloud Document AI credentials.',
                    details: error.message
                },
                { status: 503 }
            );
        }

        if (error.message?.includes('quota')) {
            return NextResponse.json(
                { error: 'Document AI quota exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to process document',
                details: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/documents/process
 *
 * Returns API information and supported file types
 */
export async function GET() {
    return NextResponse.json({
        endpoint: '/api/documents/process',
        method: 'POST',
        description: 'Process documents with OCR, entity extraction, and classification',
        supportedFormats: ['PDF', 'PNG', 'JPEG', 'TIFF', 'GIF', 'BMP'],
        maxFileSize: '20MB',
        features: {
            ocr: 'Optical Character Recognition',
            entityExtraction: 'Extract names, dates, amounts, addresses',
            formParsing: 'Extract form fields and key-value pairs',
            tableParsing: 'Extract structured table data',
            classification: 'Auto-detect document type (invoice, receipt, contract, etc.)',
            specializedParsing: 'Parse invoice/receipt/contract specific data'
        },
        options: {
            classifyDocument: 'boolean (default: true) - Classify document type',
            extractEntities: 'boolean (default: true) - Extract named entities',
            extractFormFields: 'boolean (default: true) - Extract form fields',
            extractTables: 'boolean (default: true) - Extract table data',
            parseSpecializedData: 'boolean (default: true) - Parse specialized data'
        },
        example: {
            method: 'POST',
            body: 'FormData with "file" field',
            response: {
                success: true,
                data: {
                    classification: { type: 'invoice', confidence: 0.9 },
                    invoiceData: { invoiceNumber: 'INV-001', totalAmount: 1234.56 },
                    insights: {
                        keyPeople: ['John Doe'],
                        keyOrganizations: ['Acme Corp'],
                        keyDates: ['2024-01-15'],
                        keyAmounts: [1234.56]
                    },
                    metadata: {
                        fileName: 'invoice.pdf',
                        mimeType: 'application/pdf',
                        pageCount: 1,
                        confidence: 0.95,
                        processingTime: 2500
                    }
                }
            }
        }
    });
}
