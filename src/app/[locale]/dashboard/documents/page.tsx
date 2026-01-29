"use client";

import { useState } from 'react';

export default function DocumentAnalysisPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('classifyDocument', 'true');

        try {
            const response = await fetch('/api/documents/process', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process document');
            }

            setResult(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-white">Document Intelligence</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 text-emerald-400">Upload Document</h2>

                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer block">
                            <div className="text-4xl mb-2">📄</div>
                            <span className="text-slate-300">
                                {file ? file.name : "Click to select Invoice, Receipt, or Contract"}
                            </span>
                        </label>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className={`mt-6 w-full py-3 rounded-lg font-bold transition-all ${!file || loading
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                            }`}
                    >
                        {loading ? 'Processing...' : 'Analyze Document'}
                    </button>

                    {error && (
                        <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 h-[600px] overflow-auto">
                    <h2 className="text-xl font-semibold mb-4 text-emerald-400">Analysis Results</h2>

                    {result ? (
                        <div className="space-y-6">

                            {/* Classification */}
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <div className="text-sm text-slate-400">Document Type</div>
                                <div className="text-2xl font-bold capitalize text-white">
                                    {result.classification?.type || 'Unknown'}
                                    <span className="text-sm font-normal text-emerald-500 ml-2">
                                        ({Math.round((result.classification?.confidence || 0) * 100)}% Match)
                                    </span>
                                </div>
                            </div>

                            {/* Key Insights */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    <div className="text-xs text-slate-400">Total Amounts</div>
                                    <div className="text-lg font-mono text-emerald-300">
                                        {result.insights?.keyAmounts?.length > 0
                                            ? result.insights.keyAmounts.map((amt: number) => `$${amt.toFixed(2)}`).join(', ')
                                            : '--'}
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    <div className="text-xs text-slate-400">Key Organizations</div>
                                    <div className="text-sm font-medium text-blue-300">
                                        {result.insights?.keyOrganizations?.join(', ') || '--'}
                                    </div>
                                </div>
                            </div>

                            {/* Raw Data (JSON Tree) */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase">Extracted Data</h3>
                                <pre className="bg-black/50 p-4 rounded-lg text-xs font-mono text-green-400 overflow-x-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>

                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-600">
                            Waiting for analysis...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
