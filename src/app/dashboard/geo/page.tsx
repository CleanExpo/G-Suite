'use client';

/**
 * GEO Dashboard
 *
 * Comprehensive local SEO analysis dashboard featuring:
 * - Business information input
 * - NAP consistency checker
 * - Citation tracker
 * - Local schema validator
 * - Google Business Profile integration
 * - Geographic ranking predictions
 * - Competitor analysis
 * - Actionable recommendations
 */

import { useState } from 'react';
import type {
    GEOAnalysisResult,
    GEOAnalysisRequest,
    RankingPrediction,
    CompetitorProfile,
    GEORecommendation
} from '@/lib/geo/types';

export default function GEODashboard() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<GEOAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        url: '',
        businessName: '',
        address: '',
        phone: '',
        targetLocation: '',
        targetKeywords: '',
        categories: ''
    });

    /**
     * Handle form input changes
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    /**
     * Submit GEO analysis
     */
    const handleAnalyze = async () => {
        setError(null);
        setIsAnalyzing(true);

        try {
            const request: GEOAnalysisRequest = {
                url: formData.url,
                businessName: formData.businessName,
                address: formData.address,
                phone: formData.phone,
                targetLocation: formData.targetLocation,
                targetKeywords: formData.targetKeywords.split(',').map(k => k.trim()).filter(k => k),
                categories: formData.categories.split(',').map(c => c.trim()).filter(c => c)
            };

            const response = await fetch('/api/geo/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Analysis failed');
            }

            setResult(data.data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        GEO Local SEO Analyzer
                    </h1>
                    <p className="text-gray-600">
                        Comprehensive local search optimization analysis and recommendations
                    </p>
                </div>

                {/* Business Information Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Business Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website URL *
                            </label>
                            <input
                                type="url"
                                name="url"
                                value={formData.url}
                                onChange={handleInputChange}
                                placeholder="https://example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Name *
                            </label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleInputChange}
                                placeholder="Example Bakery"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="123 Main St, New York, NY 10001"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="(555) 123-4567"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target Location *
                            </label>
                            <input
                                type="text"
                                name="targetLocation"
                                value={formData.targetLocation}
                                onChange={handleInputChange}
                                placeholder="New York, NY"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categories (comma-separated)
                            </label>
                            <input
                                type="text"
                                name="categories"
                                value={formData.categories}
                                onChange={handleInputChange}
                                placeholder="Bakery, Cafe, Restaurant"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Keywords (comma-separated)
                        </label>
                        <textarea
                            name="targetKeywords"
                            value={formData.targetKeywords}
                            onChange={handleInputChange}
                            placeholder="bakery near me, fresh bread nyc, artisan bakery"
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !formData.url || !formData.businessName || !formData.address || !formData.phone || !formData.targetLocation}
                        className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Local SEO'}
                    </button>
                </div>

                {/* Analysis Results */}
                {result && (
                    <>
                        {/* Overall Score */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Overall GEO Score
                            </h2>
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                                        {result.score}
                                    </div>
                                    <div className="text-gray-600 mt-2">out of 100</div>
                                    <div className="mt-4">
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getScoreBadge(result.score)}`}>
                                            {getScoreLabel(result.score)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <ScoreCard
                                title="NAP Consistency"
                                score={result.napAnalysis.score}
                                description="Name, Address, Phone consistency"
                            />
                            <ScoreCard
                                title="Citations"
                                score={result.citationAnalysis.score}
                                description={`${result.citationAnalysis.total} citations found`}
                            />
                            <ScoreCard
                                title="Local Schema"
                                score={result.localSchema.score}
                                description={result.localSchema.hasLocalBusiness ? 'Schema present' : 'No schema found'}
                            />
                            <ScoreCard
                                title="Maps Integration"
                                score={result.mapsIntegration.score}
                                description={result.mapsIntegration.hasEmbeddedMap ? 'Map embedded' : 'No map found'}
                            />
                        </div>

                        {/* Ranking Prediction */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Ranking Prediction
                            </h2>
                            <RankingPredictionDisplay prediction={result.rankingPrediction} />
                        </div>

                        {/* Competitor Analysis */}
                        {result.competitorAnalysis && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Competitor Analysis
                                </h2>
                                <CompetitorDisplay
                                    competitors={result.competitorAnalysis.competitors}
                                    summary={result.competitorAnalysis.summary}
                                />
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Recommendations
                            </h2>
                            <RecommendationsDisplay recommendations={result.recommendations} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Score Card Component
 */
function ScoreCard({ title, score, description }: { title: string; score: number; description: string }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4" style={{ borderColor: getScoreColorHex(score) }}>
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}
            </div>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
    );
}

/**
 * Ranking Prediction Display
 */
function RankingPredictionDisplay({ prediction }: { prediction: RankingPrediction }) {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <div className="mb-4">
                        <span className="text-gray-600">Keyword:</span>
                        <span className="ml-2 font-semibold">{prediction.keyword}</span>
                    </div>
                    <div className="mb-4">
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-2 font-semibold">{prediction.location}</span>
                    </div>
                    <div className="mb-4">
                        <span className="text-gray-600">Predicted Position:</span>
                        <span className="ml-2 text-2xl font-bold text-blue-600">#{prediction.predictedPosition}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Confidence:</span>
                        <span className="ml-2 font-semibold">{prediction.confidence}%</span>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Ranking Factors</h4>
                    <FactorBar
                        label="Distance"
                        score={prediction.factors.distance.score}
                        weight={prediction.factors.distance.weight}
                    />
                    <FactorBar
                        label="Relevance"
                        score={prediction.factors.relevance.score}
                        weight={prediction.factors.relevance.weight}
                    />
                    <FactorBar
                        label="Prominence"
                        score={prediction.factors.prominence.score}
                        weight={prediction.factors.prominence.weight}
                    />
                    <FactorBar
                        label="Optimization"
                        score={prediction.factors.optimization.score}
                        weight={prediction.factors.optimization.weight}
                    />
                </div>
            </div>

            {/* Top Improvements */}
            {prediction.improvements.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Top Opportunities</h4>
                    <div className="space-y-2">
                        {prediction.improvements.slice(0, 3).map((improvement, index) => (
                            <div key={index} className="flex items-start p-3 bg-blue-50 rounded-md">
                                <span className={`px-2 py-1 rounded text-xs font-semibold mr-3 ${getImpactBadge(improvement.impact)}`}>
                                    {improvement.impact.toUpperCase()}
                                </span>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">{improvement.recommendation}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Potential gain: {improvement.estimatedRankingGain} positions
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Factor Bar Component
 */
function FactorBar({ label, score, weight }: { label: string; score: number; weight: number }) {
    return (
        <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{label} ({Math.round(weight * 100)}%)</span>
                <span className="font-semibold">{score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="h-2 rounded-full transition-all"
                    style={{
                        width: `${score}%`,
                        backgroundColor: getScoreColorHex(score)
                    }}
                />
            </div>
        </div>
    );
}

/**
 * Competitor Display
 */
function CompetitorDisplay({ competitors, summary }: { competitors: CompetitorProfile[]; summary: any }) {
    return (
        <div>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{summary.totalCompetitors}</div>
                    <div className="text-sm text-gray-600">Competitors</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{summary.averageRating}</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{summary.averageReviewCount}</div>
                    <div className="text-sm text-gray-600">Avg Reviews</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">#{summary.yourRanking}</div>
                    <div className="text-sm text-gray-600">Your Ranking</div>
                </div>
            </div>

            {/* Competitor Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citations</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strengths</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {competitors.slice(0, 5).map((competitor, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {competitor.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {competitor.distance} mi
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="font-semibold">{competitor.rating}</span>
                                    <span className="text-yellow-500 ml-1">★</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {competitor.reviewCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {competitor.citationCount}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {competitor.strengths.slice(0, 2).join(', ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/**
 * Recommendations Display
 */
function RecommendationsDisplay({ recommendations }: { recommendations: GEORecommendation[] }) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div className="space-y-3">
            {recommendations.map((rec, index) => (
                <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        rec.priority === 'critical' ? 'border-red-300 bg-red-50' :
                        rec.priority === 'high' ? 'border-orange-300 bg-orange-50' :
                        rec.priority === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                        'border-gray-300 bg-gray-50'
                    }`}
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getPriorityBadge(rec.priority)}`}>
                                    {rec.priority}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold uppercase">
                                    {rec.category}
                                </span>
                                <span className="text-gray-600 text-sm">Impact: +{rec.impact} points</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                            <p className="text-sm text-gray-700">{rec.description}</p>
                        </div>
                        <div className="ml-4">
                            <span className="text-gray-400">
                                {expandedIndex === index ? '▼' : '▶'}
                            </span>
                        </div>
                    </div>

                    {expandedIndex === index && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <span className="text-sm text-gray-600">Effort:</span>
                                    <span className="ml-2 text-sm font-semibold capitalize">{rec.effort}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Estimated Time:</span>
                                    <span className="ml-2 text-sm font-semibold">{rec.estimatedTime}</span>
                                </div>
                            </div>
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-2">Implementation:</h5>
                                <p className="text-sm text-gray-700 bg-white p-3 rounded">{rec.implementation}</p>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Utility functions

function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
}

function getScoreColorHex(score: number): string {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#ca8a04';
    if (score >= 40) return '#ea580c';
    return '#dc2626';
}

function getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Needs Improvement';
    return 'Critical';
}

function getScoreBadge(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
}

function getPriorityBadge(priority: string): string {
    switch (priority) {
        case 'critical':
            return 'bg-red-600 text-white';
        case 'high':
            return 'bg-orange-600 text-white';
        case 'medium':
            return 'bg-yellow-600 text-white';
        default:
            return 'bg-gray-600 text-white';
    }
}

function getImpactBadge(impact: string): string {
    switch (impact) {
        case 'high':
            return 'bg-red-100 text-red-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-blue-100 text-blue-800';
    }
}
