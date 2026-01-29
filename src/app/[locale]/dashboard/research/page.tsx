'use client';

import { useState } from 'react';
import {
    Search,
    Zap,
    BookOpen,
    Layers,
    ChevronRight,
    Download,
    Share2,
    History,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeepResearchPage() {
    const [topic, setTopic] = useState('');
    const [depth, setDepth] = useState<'shallow' | 'moderate' | 'deep'>('moderate');
    const [focusAreas, setFocusAreas] = useState<string[]>([]);
    const [currentFocus, setCurrentFocus] = useState('');
    const [loading, setLoading] = useState(false);
    const [researchResult, setResearchResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAddFocus = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentFocus.trim()) {
            setFocusAreas([...focusAreas, currentFocus.trim()]);
            setCurrentFocus('');
        }
    };

    const removeFocus = (index: number) => {
        setFocusAreas(focusAreas.filter((_, i) => i !== index));
    };

    const handleResearch = async () => {
        if (!topic.trim()) return;

        setLoading(true);
        setError(null);
        setResearchResult(null);

        try {
            const response = await fetch('/api/research/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    options: { depth, focusAreas }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Research failed');
            }

            setResearchResult(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-4 lg:p-12 font-sans selection:bg-blue-500/30">
            {/* Background Ambient Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                            <BookOpen className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Deep Research Hub
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Perform high-fidelity market analysis and competitive intelligence using Gemini 2.0 with real-time Google Search grounding.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Control Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#141417] border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Search className="w-4 h-4" /> Research Objective
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Topic or Query</label>
                                    <textarea
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g., Analysis of low-code AI automation market and major players in 2026"
                                        className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none h-32"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Research Depth</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['shallow', 'moderate', 'deep'] as const).map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDepth(d)}
                                                className={`py-2 rounded-lg text-xs font-medium border transition-all ${depth === d
                                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                                        : 'bg-[#1c1c1f] border-white/5 text-gray-400 hover:border-white/10'
                                                    }`}
                                            >
                                                {d.charAt(0).toUpperCase() + d.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Focus Areas (Optional)</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {focusAreas.map((area, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs flex items-center gap-1 group"
                                            >
                                                {area}
                                                <button onClick={() => removeFocus(idx)} className="hover:text-white">×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={currentFocus}
                                        onChange={(e) => setCurrentFocus(e.target.value)}
                                        onKeyDown={handleAddFocus}
                                        placeholder="Add and press Enter..."
                                        className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>

                                <button
                                    onClick={handleResearch}
                                    disabled={loading || !topic.trim()}
                                    className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Analyzing Market...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5 fill-black" />
                                            Initialize Deep Research
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Recent History Stub */}
                        <div className="bg-[#141417] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2"><History className="w-4 h-4" /> History</span>
                                <span className="text-[10px] text-gray-500">6 Missions</span>
                            </h2>
                            <div className="space-y-3">
                                {['SaaS Trends 2026', 'Competitor Audit: Stripe', 'Veo 3.1 Use Cases'].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group">
                                        <span className="text-sm text-gray-400 group-hover:text-white truncate">{item}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results Display */}
                    <div className="lg:col-span-8 min-h-[600px]">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="h-full flex flex-col items-center justify-center bg-[#141417] border border-white/5 rounded-2xl p-12 text-center"
                                >
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                                        <div className="relative border-4 border-blue-500/20 border-t-blue-500 rounded-full w-full h-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Search className="w-8 h-8 text-blue-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Deep Intelligence Gathering</h3>
                                    <p className="text-gray-400 max-w-sm">
                                        Scanning multiple sources, analyzing market vectors, and synthesizing a specialized report...
                                    </p>
                                    <div className="mt-8 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            animate={{ x: ["-100%", "100%"] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                </motion.div>
                            ) : researchResult ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#141417] border border-white/5 rounded-2xl flex flex-col h-full shadow-2xl"
                                >
                                    {/* Result Toolbar */}
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" /> Mission Complete
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Depth: <span className="text-gray-300 capitalize">{researchResult.topic}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                                                <Download className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Report Content */}
                                    <div className="p-8 lg:p-12 overflow-y-auto max-h-[800px] prose prose-invert prose-blue max-w-none">
                                        <div className="whitespace-pre-wrap font-serif text-gray-200 leading-relaxed text-lg">
                                            {researchResult.content}
                                        </div>

                                        {/* Grounding Attribution */}
                                        {researchResult.sources && (
                                            <div className="mt-12 pt-8 border-t border-white/5">
                                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Grounding Sources</h4>
                                                <div
                                                    className="p-4 bg-white/5 rounded-xl text-xs text-gray-400"
                                                    dangerouslySetInnerHTML={{ __html: researchResult.sources }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : error ? (
                                <div className="h-full flex flex-col items-center justify-center bg-[#141417] border border-red-500/20 rounded-2xl p-12 text-center text-red-400">
                                    <AlertCircle className="w-12 h-12 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Analysis Aborted</h3>
                                    <p className="max-w-sm text-red-400/70">{error}</p>
                                    <button
                                        onClick={() => setError(null)}
                                        className="mt-6 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all"
                                    >
                                        Retry Connection
                                    </button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-[#141417] border border-white/5 border-dashed rounded-2xl p-12 text-center">
                                    <div className="bg-white/5 p-6 rounded-full mb-6">
                                        <Info className="w-12 h-12 text-gray-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Ready for Intelligence Mission</h3>
                                    <p className="text-gray-400 max-w-sm">
                                        Configure your research objective on the left to start a high-fidelity intelligence gathering mission.
                                    </p>
                                    <div className="mt-10 grid grid-cols-2 gap-4 text-left">
                                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                            <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center mb-2">
                                                <Layers className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div className="text-xs font-bold text-gray-300">Grounding</div>
                                            <div className="text-[10px] text-gray-500">Real-time web verification</div>
                                        </div>
                                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                            <div className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center mb-2">
                                                <Zap className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <div className="text-xs font-bold text-gray-300">Synthesis</div>
                                            <div className="text-[10px] text-gray-500">Multi-step data digestion</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
