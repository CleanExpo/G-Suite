/**
 * UNI-172: Import Products Page
 */

'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, Download, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface ImportResult {
  imported: number;
  failed: number;
  errors: { sku: string; error: string }[];
}

export default function ImportProductsPage() {
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvContent) {
      alert('Please upload a CSV file first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/inventory/items/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvContent }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        alert(data.error?.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `sku,name,description,category,brand,unitCost,sellingPrice,stockLevel,reorderPoint,reorderQuantity,weight,barcode,status
PROD-001,Sample Product,A sample product description,electronics,Brand A,10.00,19.99,100,20,50,0.5,123456789,active`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1000px] mx-auto">
        <Link
          href="/dashboard/inventory/items"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-8">
          Import Products
        </h1>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-[2.5rem] p-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
              Instructions
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Download the CSV template using the button below</li>
              <li>Fill in your product data following the template format</li>
              <li>Upload your completed CSV file</li>
              <li>Review the preview and click Import</li>
            </ol>
            <button
              onClick={downloadTemplate}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
              Upload CSV File
            </h2>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-xl file:border-0
                  file:text-sm file:font-bold
                  file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-600
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30
                  cursor-pointer"
              />
              {csvContent && (
                <p className="mt-4 text-sm text-green-600 font-bold">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  File loaded successfully
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          {csvContent && !result && (
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
                Preview
              </h2>
              <div className="bg-gray-50 dark:bg-[#0b0e14] p-4 rounded-xl overflow-x-auto">
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre">
                  {csvContent.split('\n').slice(0, 10).join('\n')}
                  {csvContent.split('\n').length > 10 && '\n...'}
                </pre>
              </div>
              <button
                onClick={handleImport}
                disabled={loading}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Importing...' : 'Import Products'}
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
                Import Results
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Successfully Imported
                    </span>
                  </div>
                  <p className="text-3xl font-black text-green-600">
                    {result.imported}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Failed
                    </span>
                  </div>
                  <p className="text-3xl font-black text-red-600">
                    {result.failed}
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    Errors:
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.errors.map((error, idx) => (
                      <div
                        key={idx}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3"
                      >
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          SKU: {error.sku}
                        </p>
                        <p className="text-xs text-red-600">{error.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Link
                  href="/dashboard/inventory/items"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  View Products
                </Link>
                <button
                  onClick={() => {
                    setCsvContent('');
                    setResult(null);
                  }}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Import More
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
