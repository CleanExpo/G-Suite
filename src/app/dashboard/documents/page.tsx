'use client';

/**
 * Document Processing Dashboard
 *
 * Upload, process, and analyze documents with Google Document AI
 */

import { useState, useRef } from 'react';
import type { DocumentProcessingResult } from '@/lib/document-processor/types';

interface ProcessingResponse {
    success: boolean;
    data?: DocumentProcessingResult;
    error?: string;
}

export default function DocumentsPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<DocumentProcessingResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // Processing options
    const [options, setOptions] = useState({
        classifyDocument: true,
        extractEntities: true,
        extractFormFields: true,
        extractTables: true,
        parseSpecializedData: true
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handle file selection
     */
    const handleFileSelect = (file: File) => {
        // Validate file size (20MB max)
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
            return;
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
        if (!supportedTypes.includes(file.type)) {
            setError('Unsupported file type. Please upload PDF or image files.');
            return;
        }

        setSelectedFile(file);
        setError(null);
        setResult(null);
    };

    /**
     * Handle drag & drop
     */
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    /**
     * Process document
     */
    const handleProcess = async () => {
        if (!selectedFile) return;

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('classifyDocument', options.classifyDocument.toString());
            formData.append('extractEntities', options.extractEntities.toString());
            formData.append('extractFormFields', options.extractFormFields.toString());
            formData.append('extractTables', options.extractTables.toString());
            formData.append('parseSpecializedData', options.parseSpecializedData.toString());

            const response = await fetch('/api/documents/process', {
                method: 'POST',
                body: formData
            });

            const data: ProcessingResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Processing failed');
            }

            if (data.data) {
                setResult(data.data);
            } else {
                throw new Error('No data returned from processing');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to process document');
        } finally {
            setProcessing(false);
        }
    };

    /**
     * Get confidence color
     */
    const getConfidenceColor = (confidence: number): string => {
        if (confidence >= 0.9) return 'bg-green-500';
        if (confidence >= 0.7) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getConfidenceTextColor = (confidence: number): string => {
        if (confidence >= 0.9) return 'text-green-600';
        if (confidence >= 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Processing</h1>
                    <p className="text-gray-600">
                        Upload documents for OCR, entity extraction, and intelligent data parsing
                    </p>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Upload Document</h2>

                    {/* Drag & Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                            dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {selectedFile ? (
                            <div className="space-y-2">
                                <div className="text-6xl">📄</div>
                                <div className="text-lg font-medium text-gray-900">
                                    {selectedFile.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setResult(null);
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-6xl">📁</div>
                                <div>
                                    <p className="text-lg text-gray-700 mb-2">
                                        Drag and drop your document here
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        or
                                    </p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Choose File
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg,.tiff,.gif,.bmp"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleFileSelect(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">
                                    Supported: PDF, PNG, JPEG, TIFF, GIF, BMP (Max 20MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Processing Options */}
                    {selectedFile && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Processing Options</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(options).map(([key, value]) => (
                                    <label key={key} className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) =>
                                                setOptions({ ...options, [key]: e.target.checked })
                                            }
                                            className="w-5 h-5 text-blue-600 rounded"
                                        />
                                        <span className="text-gray-700">
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Process Button */}
                    {selectedFile && (
                        <button
                            onClick={handleProcess}
                            disabled={processing}
                            className={`mt-6 w-full py-4 rounded-lg font-semibold text-white transition-colors ${
                                processing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {processing ? 'Processing Document...' : 'Process Document'}
                        </button>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {result && (
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-semibold mb-4">Processing Results</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">Confidence</div>
                                    <div className={`text-3xl font-bold ${getConfidenceTextColor(result.metadata.confidence)}`}>
                                        {Math.round(result.metadata.confidence * 100)}%
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">Pages</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.metadata.pageCount}
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">Processing Time</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {(result.metadata.processingTime / 1000).toFixed(1)}s
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">Language</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.metadata.language?.toUpperCase() || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Classification */}
                        {result.classification && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-semibold mb-4">Document Classification</h3>
                                <div className="flex items-center space-x-4">
                                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold capitalize">
                                        {result.classification.type.replace('_', ' ')}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">Classification Confidence</span>
                                            <span className={`text-sm font-medium ${getConfidenceTextColor(result.classification.confidence)}`}>
                                                {Math.round(result.classification.confidence * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getConfidenceColor(result.classification.confidence)}`}
                                                style={{ width: `${result.classification.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invoice Data */}
                        {result.invoiceData && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-semibold mb-4">Invoice Data</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.invoiceData.invoiceNumber && (
                                        <div>
                                            <div className="text-sm text-gray-600">Invoice Number</div>
                                            <div className="font-medium">{result.invoiceData.invoiceNumber}</div>
                                        </div>
                                    )}
                                    {result.invoiceData.invoiceDate && (
                                        <div>
                                            <div className="text-sm text-gray-600">Invoice Date</div>
                                            <div className="font-medium">{result.invoiceData.invoiceDate}</div>
                                        </div>
                                    )}
                                    {result.invoiceData.supplierName && (
                                        <div>
                                            <div className="text-sm text-gray-600">Supplier</div>
                                            <div className="font-medium">{result.invoiceData.supplierName}</div>
                                        </div>
                                    )}
                                    {result.invoiceData.totalAmount !== undefined && (
                                        <div>
                                            <div className="text-sm text-gray-600">Total Amount</div>
                                            <div className="font-medium text-lg">
                                                {result.invoiceData.currency || '$'}{result.invoiceData.totalAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {result.invoiceData.lineItems.length > 0 && (
                                    <div className="mt-4">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Line Items</div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Description</th>
                                                    <th className="px-4 py-2 text-right">Quantity</th>
                                                    <th className="px-4 py-2 text-right">Unit Price</th>
                                                    <th className="px-4 py-2 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.invoiceData.lineItems.map((item, idx) => (
                                                    <tr key={idx} className="border-t">
                                                        <td className="px-4 py-2">{item.description}</td>
                                                        <td className="px-4 py-2 text-right">{item.quantity || '-'}</td>
                                                        <td className="px-4 py-2 text-right">{item.unitPrice?.toFixed(2) || '-'}</td>
                                                        <td className="px-4 py-2 text-right">{item.amount?.toFixed(2) || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Insights */}
                        {result.insights && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-semibold mb-4">Extracted Insights</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.insights.keyPeople.length > 0 && (
                                        <div>
                                            <div className="text-sm font-semibold text-gray-700 mb-2">People</div>
                                            <div className="space-y-1">
                                                {result.insights.keyPeople.map((person, idx) => (
                                                    <div key={idx} className="px-3 py-1 bg-purple-50 text-purple-800 rounded inline-block mr-2">
                                                        {person}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {result.insights.keyOrganizations.length > 0 && (
                                        <div>
                                            <div className="text-sm font-semibold text-gray-700 mb-2">Organizations</div>
                                            <div className="space-y-1">
                                                {result.insights.keyOrganizations.map((org, idx) => (
                                                    <div key={idx} className="px-3 py-1 bg-blue-50 text-blue-800 rounded inline-block mr-2">
                                                        {org}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {result.insights.keyDates.length > 0 && (
                                        <div>
                                            <div className="text-sm font-semibold text-gray-700 mb-2">Dates</div>
                                            <div className="space-y-1">
                                                {result.insights.keyDates.map((date, idx) => (
                                                    <div key={idx} className="px-3 py-1 bg-green-50 text-green-800 rounded inline-block mr-2">
                                                        {date}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {result.insights.keyAmounts.length > 0 && (
                                        <div>
                                            <div className="text-sm font-semibold text-gray-700 mb-2">Amounts</div>
                                            <div className="space-y-1">
                                                {result.insights.keyAmounts.map((amount, idx) => (
                                                    <div key={idx} className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded inline-block mr-2">
                                                        ${amount.toFixed(2)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Extracted Text */}
                        {result.raw?.text && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-semibold mb-4">Extracted Text</h3>
                                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                    <pre className="text-sm whitespace-pre-wrap text-gray-700">
                                        {result.raw.text}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
