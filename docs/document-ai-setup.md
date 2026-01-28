# Google Cloud Document AI Setup Guide

Complete guide for setting up Document AI integration in G-Pilot.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Google Cloud Setup](#google-cloud-setup)
4. [Environment Configuration](#environment-configuration)
5. [Features](#features)
6. [API Usage](#api-usage)
7. [Dashboard Usage](#dashboard-usage)
8. [Code Examples](#code-examples)
9. [Troubleshooting](#troubleshooting)

---

## Overview

G-Pilot's Document AI integration provides:

- **OCR (Optical Character Recognition)**: Extract text from PDFs and images
- **Entity Extraction**: Identify names, dates, amounts, addresses, and more
- **Form Parsing**: Extract key-value pairs from forms
- **Table Extraction**: Parse structured table data
- **Document Classification**: Auto-detect document types (invoice, receipt, contract, etc.)
- **Specialized Parsing**: Extract invoice/receipt/contract specific data
- **Multi-language Support**: Process documents in multiple languages
- **High Accuracy**: 95%+ OCR accuracy with confidence scoring

---

## Prerequisites

- **Google Cloud Account** with billing enabled
- **G-Pilot installed** and running
- **Node.js 18+** and npm

---

## Google Cloud Setup

### Step 1: Enable Document AI API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Library**
4. Search for "Document AI API"
5. Click **Enable**

### Step 2: Create a Processor

Document AI uses processors to process documents. Create a processor for your use case:

1. Go to [Document AI Console](https://console.cloud.google.com/ai/document-ai)
2. Click **Create Processor**
3. Choose a processor type:
   - **Form Parser** - General-purpose form and document parser (recommended)
   - **OCR Processor** - Pure text extraction
   - **Invoice Parser** - Specialized invoice processing
   - **Receipt Parser** - Specialized receipt processing
   - **Contract Parser** - Contract analysis
4. Select a region: `us` or `eu`
5. Name your processor (e.g., "G-Pilot Form Parser")
6. Click **Create**
7. **Copy the Processor ID** - you'll need this for configuration

### Step 3: Create Service Account Credentials

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name: `g-pilot-document-ai`
4. Click **Create and Continue**
5. Grant role: **Document AI API User**
6. Click **Continue** > **Done**
7. Click on the created service account
8. Go to **Keys** tab
9. Click **Add Key** > **Create new key**
10. Choose **JSON** format
11. Click **Create** - JSON file will download
12. **Keep this file secure** - it contains your credentials

---

## Environment Configuration

### Option 1: Service Account (Recommended)

Add these variables to your `.env.local`:

```bash
# Google Cloud Project
GOOGLE_CLOUD_PROJECT=your-project-id

# Document AI Configuration
DOCUMENT_AI_LOCATION=us              # or 'eu'
DOCUMENT_AI_PROCESSOR_ID=abc123...   # From Step 2

# Service Account Credentials
GOOGLE_CLIENT_EMAIL=g-pilot-document-ai@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
```

**Important**: When adding the private key:
- Keep it on one line
- Replace actual newlines with `\n`
- Wrap in double quotes

### Option 2: Application Default Credentials (ADC)

If running on Google Cloud (Cloud Run, Compute Engine, etc.):

```bash
GOOGLE_CLOUD_PROJECT=your-project-id
DOCUMENT_AI_LOCATION=us
DOCUMENT_AI_PROCESSOR_ID=abc123...
```

The SDK will automatically use the environment's default credentials.

### Option 3: Local Development with gcloud CLI

Authenticate with your Google account:

```bash
gcloud auth application-default login
```

Then use the same `.env.local` as Option 2.

---

## Features

### Supported Document Types

- **PDF** (`.pdf`)
- **PNG** (`.png`)
- **JPEG** (`.jpg`, `.jpeg`)
- **TIFF** (`.tif`, `.tiff`)
- **GIF** (`.gif`)
- **BMP** (`.bmp`)

### Maximum File Size

- **20 MB** per document

### Processing Capabilities

1. **OCR**: Extract all text from document
2. **Entity Extraction**: Identify:
   - Person names
   - Organization names
   - Dates (with normalization)
   - Monetary amounts
   - Addresses
   - Phone numbers
   - Email addresses
   - Invoice numbers
   - Tax IDs
   - And more...

3. **Form Field Extraction**: Extract key-value pairs like:
   - Name: John Doe
   - Date: 2024-01-15
   - Amount: $1,234.56

4. **Table Extraction**: Parse structured tables with headers and data rows

5. **Document Classification**: Auto-detect:
   - Invoices
   - Receipts
   - Contracts
   - Forms
   - Resumes
   - Reports
   - Other document types

6. **Specialized Data Parsing**:
   - **Invoices**: Extract invoice number, dates, supplier/customer info, line items, totals
   - **Receipts**: Extract merchant info, transaction details, items, totals
   - **Contracts**: Extract parties, dates, terms, signatures
   - **Forms**: Extract all field values
   - **Resumes**: Extract candidate info, work experience, education, skills

---

## API Usage

### Endpoint

```
POST /api/documents/process
```

### Request

**Content-Type**: `multipart/form-data`

**Body Parameters**:
- `file` (File, required): Document to process
- `classifyDocument` (boolean, optional): Classify document type (default: true)
- `extractEntities` (boolean, optional): Extract named entities (default: true)
- `extractFormFields` (boolean, optional): Extract form fields (default: true)
- `extractTables` (boolean, optional): Extract tables (default: true)
- `parseSpecializedData` (boolean, optional): Parse specialized data (default: true)

### Example with cURL

```bash
curl -X POST https://your-domain.com/api/documents/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@invoice.pdf" \
  -F "classifyDocument=true" \
  -F "parseSpecializedData=true"
```

### Example with JavaScript/TypeScript

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('classifyDocument', 'true');
formData.append('extractEntities', 'true');

const response = await fetch('/api/documents/process', {
    method: 'POST',
    body: formData
});

const result = await response.json();
console.log(result.data);
```

### Response

```json
{
    "success": true,
    "data": {
        "classification": {
            "type": "invoice",
            "confidence": 0.95
        },
        "invoiceData": {
            "invoiceNumber": "INV-2024-001",
            "invoiceDate": "2024-01-15",
            "supplierName": "Acme Corp",
            "totalAmount": 1234.56,
            "currency": "USD",
            "lineItems": [
                {
                    "description": "Professional Services",
                    "quantity": 10,
                    "unitPrice": 100.00,
                    "amount": 1000.00
                }
            ]
        },
        "insights": {
            "keyPeople": ["John Doe", "Jane Smith"],
            "keyOrganizations": ["Acme Corp"],
            "keyDates": ["2024-01-15", "2024-02-15"],
            "keyAmounts": [1234.56, 1000.00],
            "keyLocations": ["123 Main St, New York, NY"]
        },
        "metadata": {
            "fileName": "invoice.pdf",
            "mimeType": "application/pdf",
            "pageCount": 1,
            "confidence": 0.95,
            "processingTime": 2500,
            "language": "en"
        },
        "raw": {
            "text": "INVOICE\nInvoice #: INV-2024-001\n...",
            "entities": [...],
            "formFields": [...],
            "pageCount": 1,
            "confidence": 0.95
        }
    }
}
```

---

## Dashboard Usage

### Accessing the Dashboard

Navigate to: `https://your-domain.com/dashboard/documents`

### Upload Document

1. **Drag and drop** a document onto the upload zone, or
2. Click **Choose File** to browse your computer
3. Select processing options (all enabled by default):
   - Classify Document
   - Extract Entities
   - Extract Form Fields
   - Extract Tables
   - Parse Specialized Data
4. Click **Process Document**

### View Results

After processing completes, you'll see:

1. **Metadata Card**:
   - Overall confidence score
   - Number of pages
   - Processing time
   - Detected language

2. **Classification Card**:
   - Document type (invoice, receipt, contract, etc.)
   - Classification confidence

3. **Specialized Data Card** (if applicable):
   - Invoice data with line items
   - Receipt data with items
   - Contract data with parties
   - Form field values

4. **Insights Card**:
   - Extracted people names
   - Organization names
   - Key dates
   - Monetary amounts
   - Locations

5. **Raw Text**:
   - Full extracted text from document

---

## Code Examples

### Basic Document Processing

```typescript
import { getDocumentProcessor } from '@/lib/document-processor/engine';
import { readFileSync } from 'fs';

const processor = getDocumentProcessor();

// Process a document
const result = await processor.process({
    filePath: '/path/to/invoice.pdf',
    mimeType: 'application/pdf',
    extractionOptions: {
        classifyDocument: true,
        extractEntities: true,
        parseSpecializedData: true
    }
});

console.log('Document type:', result.classification?.type);
console.log('Confidence:', result.metadata.confidence);
console.log('Total amount:', result.invoiceData?.totalAmount);
```

### Batch Processing

```typescript
import { getDocumentProcessor } from '@/lib/document-processor/engine';

const processor = getDocumentProcessor();

const batchResult = await processor.processBatch({
    documents: [
        { filePath: '/path/to/invoice1.pdf', mimeType: 'application/pdf' },
        { filePath: '/path/to/invoice2.pdf', mimeType: 'application/pdf' },
        { filePath: '/path/to/receipt.png', mimeType: 'image/png' }
    ],
    extractionOptions: {
        parseSpecializedData: true
    },
    onProgress: (progress) => {
        console.log(`${progress.completed}/${progress.total} completed`);
    }
});

console.log(`Processed ${batchResult.summary.successful} documents`);
console.log(`Average confidence: ${batchResult.summary.averageConfidence}`);
```

### Using DocumentAIClient Directly

```typescript
import { getDocumentAIClient } from '@/lib/google/document-ai-client';
import { readFileSync } from 'fs';

const client = getDocumentAIClient();

const content = readFileSync('/path/to/document.pdf');
const result = await client.processDocument({
    content,
    mimeType: 'application/pdf'
});

console.log('Extracted text:', result.text);
console.log('Entities:', result.entities);
console.log('Form fields:', result.formFields);
```

### Extract Invoice Data

```typescript
const result = await processor.process({
    filePath: '/path/to/invoice.pdf',
    mimeType: 'application/pdf'
});

if (result.invoiceData) {
    console.log('Invoice #:', result.invoiceData.invoiceNumber);
    console.log('Date:', result.invoiceData.invoiceDate);
    console.log('Supplier:', result.invoiceData.supplierName);
    console.log('Total:', result.invoiceData.totalAmount);

    console.log('\nLine Items:');
    for (const item of result.invoiceData.lineItems) {
        console.log(`  ${item.description}: ${item.amount}`);
    }
}
```

---

## Troubleshooting

### Error: "Document AI client is not configured"

**Solution**: Ensure you have set the required environment variables:
- `GOOGLE_CLOUD_PROJECT`
- `DOCUMENT_AI_PROCESSOR_ID`
- Either service account credentials OR ADC

### Error: "Permission denied"

**Solution**: Ensure your service account has the **Document AI API User** role.

### Error: "Processor not found"

**Solution**:
1. Verify your `DOCUMENT_AI_PROCESSOR_ID` is correct
2. Ensure the processor exists in your project
3. Check that `DOCUMENT_AI_LOCATION` matches the processor's region

### Low Confidence Scores

**Tips to improve accuracy**:
1. Use high-resolution images (300+ DPI)
2. Ensure good contrast (dark text on light background)
3. Avoid skewed or rotated images
4. Use PDF format when possible
5. Choose the appropriate processor type (e.g., Invoice Parser for invoices)

### Slow Processing

**Optimization tips**:
1. Reduce file size if possible
2. Use lower resolution images (while maintaining readability)
3. Process documents in parallel with batch processing
4. Consider using GCS URIs for large documents

### Quota Exceeded

**Solution**:
1. Check your quota in [Google Cloud Console](https://console.cloud.google.com/iam-admin/quotas)
2. Request quota increase if needed
3. Implement rate limiting in your application
4. Consider Document AI Warehouse for high-volume processing

---

## Pricing

Document AI pricing varies by processor type and volume:

- **Form Parser**: $1.50 per 1000 pages
- **OCR Processor**: $1.50 per 1000 pages
- **Specialized Parsers** (Invoice, Receipt): $30 per 1000 pages

**Free Tier**: First 1000 pages per month are free.

See [Document AI Pricing](https://cloud.google.com/document-ai/pricing) for details.

---

## Next Steps

1. **Test with sample documents** - Use the dashboard to test various document types
2. **Integrate into workflows** - Use the API to automate document processing
3. **Monitor usage** - Track API calls and costs in Google Cloud Console
4. **Optimize accuracy** - Fine-tune your documents and processing options
5. **Scale up** - Implement batch processing for high volumes

---

## Additional Resources

- [Document AI Documentation](https://cloud.google.com/document-ai/docs)
- [Node.js Client Library](https://googleapis.dev/nodejs/documentai/latest/)
- [Supported Processors](https://cloud.google.com/document-ai/docs/processors-list)
- [Best Practices](https://cloud.google.com/document-ai/docs/best-practices)

---

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review [Google Cloud Document AI Documentation](https://cloud.google.com/document-ai/docs)
- Open an issue on the G-Pilot GitHub repository
