"use client"

import { useState } from "react";
import { X, Send, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { runMission } from "@/actions/mission.action";

interface MissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MissionModal({ isOpen, onClose, onSuccess }: MissionModalProps) {
    const [input, setInput] = useState("");
    const [isLaunching, setIsLaunching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLaunch() {
        if (!input) return;

        setIsLaunching(true);
        setError(null);

        try {
            const result = await runMission(input);

            if (!result.success) {
                throw new Error(result.error || "Failed to launch mission");
            }

            // Success feedback
            console.log(`✅ Mission Success: Cost ${result.cost} pts`, result.data);

            // Handle tool outputs (e.g. open presentation URL)
            const firstResult = result.data?.[0];
            const resultUrl = firstResult?.url || firstResult?.link;

            if (resultUrl) {
                window.open(resultUrl, "_blank");
            }

            setInput("");
            onSuccess();
            setTimeout(onClose, 100);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLaunching(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-[#07090e]/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-[#0d1117] w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative flex items-center justify-between p-8 border-b border-white/[0.03]">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                            Initialize <span className="text-blue-500">Mission</span>
                        </h2>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Orchestrator V1.0 · Ready for Deployment</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/5 rounded-2xl transition-all active:scale-90"
                    >
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Zap className="w-3 h-3 text-blue-500 fill-blue-500" />
                                Task Parameters
                            </label>
                            <span className="text-[10px] font-mono text-slate-600">Encrypted Uplink Active</span>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., 'Analyze our Q4 insurance data and create a 3-slide pitch deck focusing on AI cost savings.'"
                            className="w-full h-48 bg-slate-900/50 border border-white/[0.05] rounded-3xl p-6 text-white placeholder:text-slate-700 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500/50 outline-none resize-none transition-all leading-relaxed text-lg shadow-inner"
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-2xl font-medium flex items-center gap-3"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            disabled={isLaunching}
                            className="flex-1 py-5 rounded-2xl font-black text-slate-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
                        >
                            Abort Mission
                        </button>
                        <button
                            onClick={handleLaunch}
                            disabled={isLaunching || !input}
                            className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 relative overflow-hidden group"
                        >
                            {isLaunching ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Orchestrating Logic...
                                </>
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Deploy Orchestrator
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
