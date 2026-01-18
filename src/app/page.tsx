"use client"

import { useState, useEffect } from "react";
import { getWalletData } from "@/actions/wallet-actions";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

import { Wallet, PlusCircle, History, AlertCircle, Loader2, Rocket, Play, Activity, CreditCard, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import MissionModal from "@/components/MissionModal";
import CreditDialog from "@/components/credit-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

/**
 * Authenticated content isolated to prevent unauthorized server action calls.
 * This component only mounts when the user is SignedIn.
 */
function AuthenticatedDashboard({ onOpenModal, onOpenCreditDialog }: { onOpenModal: () => void, onOpenCreditDialog: () => void }) {
    const [wallet, setWallet] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchWallet() {
        try {
            const data = await getWalletData();
            setWallet(data);
        } catch (err) {
            console.error("Failed to load wallet dashboard:", err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchWallet();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Synchronizing Uplink...</p>
            </div>
        );
    }

    if (!wallet) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md mx-auto bg-slate-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl text-center"
            >
                <div className="w-20 h-20 bg-amber-500/10 flex items-center justify-center rounded-3xl mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-3xl font-bold mb-3">No Wallet Found</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    To begin orchestrating missions, you must first initialize your secure billing ledger.
                </p>
                <button
                    onClick={onOpenCreditDialog}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                    Setup Billing Profile
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Balance Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800 shadow-lg relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2">
                        <CreditCard className="w-6 h-6 text-blue-500/50" />
                        <button
                            onClick={onOpenCreditDialog}
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 p-1.5 rounded-lg border border-blue-500/20 transition-all active:scale-95 group/btn"
                            title="Top up credits"
                        >
                            <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                        </button>
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Available Credits</h3>
                    <div className="text-5xl font-black text-white flex items-baseline gap-2 mb-2">
                        {wallet.balance.toLocaleString()}
                        <span className="text-lg text-slate-600 font-medium">pts</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">100 credits = $1.00 USD</p>
                    <div className="mt-4 text-xs font-bold text-blue-500/80 uppercase">Est. Value: ${(wallet.balance / 100).toFixed(2)} USD</div>
                </motion.div>

                {/* New Mission Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue-600 p-8 rounded-[2rem] shadow-xl shadow-blue-600/20 flex flex-col justify-between group overflow-hidden relative cursor-pointer"
                    onClick={onOpenModal}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-500">
                        <Rocket className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase">Start New <span className="text-blue-200">Mission</span></h3>
                        <p className="text-blue-100/70 text-sm mt-1 font-medium">Launch a Spec-driven AI Agent workflow.</p>
                    </div>
                    <button className="mt-8 bg-white text-blue-600 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 text-lg shadow-xl shadow-blue-900/20">
                        <Play className="w-5 h-5 fill-current" /> Initialize Uplink
                    </button>
                </motion.div>

                {/* System Status Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800 shadow-lg flex flex-col justify-center text-center"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Uplink Stable</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[200px] mx-auto">
                        All orchestrator nodes are currently standing by.
                    </p>
                </motion.div>
            </div>

            {/* Transaction Table */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-white/[0.03] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-slate-500" />
                        <h3 className="font-black italic uppercase tracking-tighter text-xl text-slate-200">Mission Audit trail</h3>
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Real-time Telemetry</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Descriptor</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Fuel Delta</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {wallet.transactions.map((tx: any, idx: number) => (
                                <motion.tr
                                    key={tx.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 + (idx * 0.05) }}
                                    className="hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-8 py-6 font-medium text-slate-300">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${tx.amount > 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"}`} />
                                            {tx.description}
                                        </div>
                                    </td>
                                    <td className={`px-8 py-6 text-center font-mono font-bold text-lg ${tx.amount > 0 ? "text-emerald-400" : "text-slate-200"}`}>
                                        {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-6 text-right text-slate-500 text-xs font-mono">
                                        {format(new Date(tx.createdAt), "dd MMM · HH:mm")}
                                    </td>
                                </motion.tr>
                            ))}
                            {wallet.transactions.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-24 text-center text-slate-600 text-sm font-bold uppercase tracking-widest italic opacity-50">
                                        Silence in the Sector. Launch a mission.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}

function DashboardContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error" | "info", message: string } | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled");

        if (success === "true") {
            setNotification({
                type: "success",
                message: "Uplink Restored: Mission Fuel Replenished Successfully."
            });
            // Clean URL
            const newUrl = window.location.pathname;
            router.replace(newUrl);
        } else if (canceled === "true") {
            setNotification({
                type: "info",
                message: "Uplink Terminated: Checkout Canceled by Commander."
            });
            // Clean URL
            const newUrl = window.location.pathname;
            router.replace(newUrl);
        }
    }, [searchParams, router]);

    return (
        <main className="min-h-screen bg-[#07090e] text-white overflow-x-hidden relative">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, x: "-50%", opacity: 0 }}
                        animate={{ y: 24, x: "-50%", opacity: 1 }}
                        exit={{ y: -100, x: "-50%", opacity: 0 }}
                        className="fixed top-0 left-1/2 z-[200] w-full max-w-md px-4"
                    >
                        <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 ${notification.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            }`}>
                            {notification.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="text-sm font-bold uppercase tracking-tight">{notification.message}</p>
                            <button
                                onClick={() => setNotification(null)}
                                className="ml-auto opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <Plus className="w-4 h-4 rotate-45" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex justify-between items-center mb-16"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight italic uppercase">
                            Suite<span className="text-blue-500">Pilot</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                            <a href="/" className="hover:text-white transition-colors text-blue-500">Dashboard</a>
                            <a href="#" className="hover:text-white transition-colors opacity-50 cursor-not-allowed">Fleet</a>
                            <a href="#" className="hover:text-white transition-colors opacity-50 cursor-not-allowed">Telemetry</a>
                        </nav>
                        <div className="h-4 w-[1px] bg-slate-800 hidden md:block" />
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-white/5">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-slate-800 hover:border-blue-500 transition-all" } }} />
                        </SignedIn>
                    </div>
                </motion.header>

                <SignedIn>
                    <AuthenticatedDashboard
                        onOpenModal={() => setIsModalOpen(true)}
                        onOpenCreditDialog={() => setIsCreditDialogOpen(true)}
                    />
                </SignedIn>

                <SignedOut>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-32 space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            System Online · Version 1.0
                        </div>
                        <h2 className="text-7xl font-black max-w-4xl mx-auto leading-[0.9] tracking-tighter">
                            AI ORCHESTRATION <br />
                            <span className="text-blue-500 italic">TRANSPARENTLY.</span>
                        </h2>
                        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
                            Experience the future of workspace autonomy. Mission-driven automation powered by LangGraph, secured by your custom ledger.
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-8">
                            <SignInButton mode="modal">
                                <button className="bg-white text-black px-10 py-5 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all active:scale-95 shadow-2xl shadow-white/10 text-xl">
                                    Get Started
                                </button>
                            </SignInButton>
                            <button className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black hover:bg-slate-800 transition-all border border-slate-800/50 text-xl">
                                Documentation
                            </button>
                        </div>
                    </motion.div>
                </SignedOut>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <MissionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => {
                            window.location.reload();
                        }}
                    />
                )}
                {isCreditDialogOpen && (
                    <CreditDialog
                        isOpen={isCreditDialogOpen}
                        onClose={() => setIsCreditDialogOpen(false)}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#07090e] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>}>
            <DashboardContent />
        </Suspense>
    );
}
