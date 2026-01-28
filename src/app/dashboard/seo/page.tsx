'use client';

/**
 * SEO Analysis Dashboard
 *
 * Comprehensive dashboard for analyzing website SEO and viewing recommendations.
 */

import { useState } from 'react';
import { SEOAnalysisResult } from '@/lib/seo/types';

export default function SEODashboardPage() {
    const [url, setUrl] = useState('');
    const [keywords, setKeywords] = useState('');
    const [includePerformance, setIncludePerformance] = useState(true);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<SEOAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!url) {
            setError('Please enter a URL');
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const response = await fetch('/api/seo/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url,
                    keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
                    includePerformance
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Analysis failed');
            }

            setAnalysis({
                ...data.data,
                analyzedAt: new Date(data.data.analyzedAt)
            });
        } catch (err: any) {
            setError(err.message || 'Failed to analyze URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        SEO Analysis Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Comprehensive SEO audit and optimization recommendations powered by Google APIs and SEMrush
                    </p>
                </div>

                {/* Analysis Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                                Website URL
                            </label>
                            <input
                                id="url"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                                Target Keywords (comma-separated)
                            </label>
                            <input
                                id="keywords"
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="seo optimization, digital marketing, content strategy"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="performance"
                                type="checkbox"
                                checked={includePerformance}
                                onChange={(e) => setIncludePerformance(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="performance" className="ml-2 block text-sm text-gray-700">
                                Include performance metrics (Core Web Vitals via Google PageSpeed)
                            </label>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !url}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            {loading ? 'Analyzing...' : 'Analyze SEO'}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {analysis && (
                    <div className="space-y-6">
                        {/* Overall Score */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall SEO Score</h2>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="relative pt-1">
                                        <div className="flex mb-2 items-center justify-between">
                                            <div>
                                                <span className={`text-6xl font-bold ${
                                                    analysis.overallScore >= 90 ? 'text-green-600' :
                                                    analysis.overallScore >= 75 ? 'text-blue-600' :
                                                    analysis.overallScore >= 60 ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {analysis.overallScore}
                                                </span>
                                                <span className="text-2xl text-gray-500">/100</span>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-lg font-semibold ${
                                                    analysis.overallScore >= 90 ? 'text-green-600' :
                                                    analysis.overallScore >= 75 ? 'text-blue-600' :
                                                    analysis.overallScore >= 60 ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {analysis.overallScore >= 90 ? 'Excellent' :
                                                     analysis.overallScore >= 75 ? 'Good' :
                                                     analysis.overallScore >= 60 ? 'Fair' :
                                                     'Needs Improvement'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Analyzed: {analysis.analyzedAt.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
                                            <div
                                                style={{ width: `${analysis.overallScore}%` }}
                                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                                    analysis.overallScore >= 90 ? 'bg-green-600' :
                                                    analysis.overallScore >= 75 ? 'bg-blue-600' :
                                                    analysis.overallScore >= 60 ? 'bg-yellow-600' :
                                                    'bg-red-600'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Component Scores */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Component Scores</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {Object.entries(analysis.scores).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900">{value}</div>
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    value >= 80 ? 'bg-green-500' :
                                                    value >= 60 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Recommendations ({analysis.recommendations.length})
                            </h2>
                            <div className="space-y-4">
                                {analysis.recommendations.slice(0, 10).map((rec, index) => (
                                    <div
                                        key={index}
                                        className={`border-l-4 p-4 rounded ${
                                            rec.priority === 'critical' ? 'border-red-500 bg-red-50' :
                                            rec.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                                            rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                            'border-blue-500 bg-blue-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        rec.priority === 'critical' ? 'bg-red-200 text-red-800' :
                                                        rec.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                                                        rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                        'bg-blue-200 text-blue-800'
                                                    }`}>
                                                        {rec.priority.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-gray-500 capitalize">{rec.category}</span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">{rec.title}</h3>
                                                <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                                                <p className="text-sm text-gray-600 italic">{rec.implementation}</p>
                                            </div>
                                            <div className="ml-4 text-right">
                                                <div className="text-xs text-gray-500">Impact</div>
                                                <div className="text-2xl font-bold text-gray-900">{rec.impact}</div>
                                                <div className="text-xs text-gray-500 mt-1">Effort: {rec.effort}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Issues */}
                        {analysis.issues.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Issues Detected ({analysis.issues.length})
                                </h2>
                                <div className="space-y-3">
                                    {analysis.issues.map((issue, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded border ${
                                                issue.severity === 'critical' ? 'border-red-300 bg-red-50' :
                                                issue.severity === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                                                'border-blue-300 bg-blue-50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    issue.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                                    issue.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                                                    'bg-blue-200 text-blue-800'
                                                }`}>
                                                    {issue.severity.toUpperCase()}
                                                </span>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900">{issue.title}</h3>
                                                    <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                                                    <p className="text-sm text-gray-600 mt-2 italic">{issue.fixInstructions}</p>
                                                    <p className="text-xs text-gray-500 mt-2">Impact: {issue.impact}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Keyword Analysis */}
                        {analysis.keywordAnalysis.keywords.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Keyword Analysis
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Keyword
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Volume
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Difficulty
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    CPC
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Trend
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {analysis.keywordAnalysis.keywords.map((kw, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {kw.keyword}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {kw.volume.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`px-2 py-1 rounded ${
                                                            kw.difficulty < 30 ? 'bg-green-100 text-green-800' :
                                                            kw.difficulty < 60 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {kw.difficulty}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        ${kw.cpc.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 py-1 rounded ${
                                                            kw.trend === 'rising' ? 'bg-green-100 text-green-800' :
                                                            kw.trend === 'declining' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {kw.trend}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Search Console Data */}
                        {analysis.searchConsoleData && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Google Search Console Data
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="text-sm font-medium text-blue-600">Clicks</div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {analysis.searchConsoleData.metrics.clicks.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="text-sm font-medium text-green-600">Impressions</div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {analysis.searchConsoleData.metrics.impressions.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <div className="text-sm font-medium text-purple-600">CTR</div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {(analysis.searchConsoleData.metrics.ctr * 100).toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <div className="text-sm font-medium text-orange-600">Avg Position</div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {analysis.searchConsoleData.metrics.position.toFixed(1)}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Queries */}
                                {analysis.searchConsoleData.queries.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">Top Queries</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {analysis.searchConsoleData.queries.slice(0, 10).map((query, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 text-sm text-gray-900">{query.query}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">{query.clicks}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">{query.impressions}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">{(query.ctr * 100).toFixed(2)}%</td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">{query.position.toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
