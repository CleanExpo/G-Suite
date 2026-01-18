"use client"

import { useState, useEffect, Suspense, useRef } from "react";
import { getWalletData } from "@/actions/wallet-actions";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
    Wallet,
    Rocket,
    Activity,
    CreditCard,
    Plus,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Zap,
    Cpu,
    Target,
    Layout,
    Shield,
    History,
    Lock as LockIcon
} from "lucide-react";
import { format } from "date-fns";
import MissionModal from "@/components/MissionModal";
import CreditDialog from "@/components/credit-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

import { TelemetryPanel } from "@/components/telemetry-panel";
import { FleetStatus } from "@/components/fleet-status";

function AuthenticatedDashboard({ onOpenModal, onOpenCreditDialog }: { onOpenModal: () => void, onOpenCreditDialog: () => void }) {
    const [wallet, setWallet] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchWallet() {
        try {
            const data = await getWalletData();
            setWallet(data);
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchWallet();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-[2rem] border-4 border-blue-600 border-t-transparent shadow-2xl shadow-blue-600/20"
                />
                <div className="space-y-2 text-center">
                    <p className="text-gray-400 font-black text-xs uppercase tracking-[0.4em] animate-pulse">Syncing Mission Ledger</p>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest opacity-50">G-PILOT CORE v7.2 ACTIVE</p>
                </div>
            </div>
        );
    }

    if (!wallet) {
        return (
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-xl mx-auto bg-white dark:bg-[#161b22] p-16 rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-2xl text-center space-y-10"
            >
                <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center rounded-[2.5rem] mx-auto border border-amber-100 dark:border-amber-800">
                    <AlertCircle className="w-12 h-12 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase dark:text-white mb-4 leading-none">Uplink Invalid.</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">
                        No active billing ledger detected in the current sector. Initialize your secure credit tunnel to begin deployment.
                    </p>
                </div>
                <button
                    onClick={onOpenCreditDialog}
                    className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-2xl transition-all shadow-2xl shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-4"
                >
                    Initialize Vault <ArrowRight className="w-6 h-6" />
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-16 pb-24">
            {/* Live Telemetry Node */}
            <TelemetryPanel />

            {/* Tactical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">

                {/* Ledger Card: Multi-Layer Spatial */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="lg:col-span-1 bg-white dark:bg-[#161b22] p-12 rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
                >
                    <div className="absolute top-0 right-0 p-10 flex flex-col items-end gap-6">
                        <div className="flex gap-4">
                            <Link href="/dashboard/vault">
                                <button className="bg-gray-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white p-3 rounded-xl transition-all active:scale-90 border border-gray-100 dark:border-white/10 group/vault">
                                    <Shield className="w-5 h-5" />
                                </button>
                            </Link>
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800 group-hover:bg-blue-600 transition-all duration-500">
                                <Wallet className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        <button
                            onClick={onOpenCreditDialog}
                            className="bg-gray-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white p-3 rounded-xl transition-all active:scale-90 border border-gray-100 dark:border-white/10"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-12">
                        <div>
                            <h3 className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Mission Fuel Reserve</h3>
                            <div className="text-8xl font-black text-gray-900 dark:text-white tracking-tighter flex items-baseline gap-2 leading-none">
                                {wallet.balance.toLocaleString()}
                                <span className="text-2xl text-blue-600 font-black uppercase italic tracking-widest">PTS</span>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100 dark:border-white/5 space-y-4">
                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                                <span>Estimated Sector Value</span>
                                <span className="text-gray-900 dark:text-white text-lg font-black">${(wallet.balance / 100).toFixed(2)} USD</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div animate={{ width: "70%" }} className="h-full bg-blue-600" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Command Launchpad: Kinetic Energy */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    onClick={onOpenModal}
                    className="lg:col-span-2 bg-blue-600 p-12 lg:p-16 rounded-[4.5rem] shadow-[0_50px_100px_rgba(37,99,235,0.2)] flex flex-col justify-between group overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all"
                >
                    <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-150 transition-transform duration-1000 pointer-events-none">
                        <Cpu className="w-64 h-64 text-white" />
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30">
                                <Rocket className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white font-black uppercase tracking-[0.3em] text-[10px] opacity-80">Command Authority v9.4</span>
                        </div>
                        <h2 className="text-6xl lg:text-[7rem] font-black italic uppercase text-white tracking-tighter leading-[0.8]">
                            Deploy <br />
                            <span className="text-blue-200">New Mission.</span>
                        </h2>
                        <p className="text-blue-100/70 text-2xl font-medium max-w-xl leading-relaxed italic">
                            "Initialize high-fidelity reasoning swarms for complex agentic orchestration."
                        </p>
                    </div>

                    <div className="mt-12 flex items-center gap-6 group relative z-10">
                        <div className="h-24 px-12 bg-white text-blue-600 rounded-[2rem] font-black flex items-center justify-center gap-4 group-hover:bg-gray-50 shadow-2xl text-2xl transition-all">
                            IGNITE <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                        </div>
                        <div className="hidden lg:flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                            <Shield className="w-4 h-4" /> AES-256 Vault Active
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Fleet Readiness Node */}
            <FleetStatus />

            {/* Audit Archive: High-Fidelity Ledger */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#161b22] rounded-[4.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
            >
                <div className="px-12 py-12 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <History className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-black italic uppercase tracking-tighter text-4xl text-gray-900 dark:text-white leading-none">Mission Archive Ledger</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Telemetry Sync: Stable</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                <th className="px-12 py-10 text-[12px] font-black text-gray-400 uppercase tracking-[0.3em]">Deployment Profile</th>
                                <th className="px-12 py-10 text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">Fuel Delta</th>
                                <th className="px-12 py-10 text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {wallet.transactions.map((tx: any, idx: number) => (
                                <motion.tr
                                    key={tx.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 + (idx * 0.05) }}
                                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-default"
                                >
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-8">
                                            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${tx.amount > 0 ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-600" : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600"}`}>
                                                {tx.amount > 0 ? <Plus className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white text-2xl italic tracking-tighter uppercase leading-none mb-2">{tx.description}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">UUID: {tx.id.slice(0, 8)}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/10" />
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-600">Verified Dispatch</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`px-12 py-10 text-center`}>
                                        <div className={`inline-flex items-center justify-center h-16 px-8 rounded-[1.5rem] font-black text-3xl font-mono tracking-tighter ${tx.amount > 0 ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "text-gray-900 dark:text-white bg-gray-50 dark:bg-white/10"}`}>
                                            {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                        </div>
                                    </td>
                                    <td className="px-12 py-10 text-right">
                                        <div className="text-gray-900 dark:text-white font-black text-lg tracking-tight uppercase italic">{format(new Date(tx.createdAt), "dd MMM · HH:mm")}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-2 flex items-center justify-end gap-2">
                                            <Shield className="w-3 h-3 text-emerald-500" /> SECURE UPLINK FINALIZED
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {wallet.transactions.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-40 text-center">
                                        <div className="flex flex-col items-center gap-8 opacity-20 group">
                                            <Target className="w-24 h-24 group-hover:scale-110 transition-transform duration-1000" />
                                            <div className="space-y-2">
                                                <p className="text-3xl font-black uppercase italic tracking-tighter">Sector Silence Detected.</p>
                                                <p className="text-xs font-black uppercase tracking-[0.4em]">Establish Initial Mission Flow</p>
                                            </div>
                                        </div>
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
        const prompt = searchParams.get("prompt");

        if (success === "true") {
            setNotification({
                type: "success",
                message: "Uplink Restored: Ledger Replenished Successfully."
            });
            router.replace("/dashboard");
        } else if (canceled === "true") {
            setNotification({
                type: "info",
                message: "Uplink Terminated: Secure Checkout Aborted."
            });
            router.replace("/dashboard");
        } else if (prompt) {
            setIsModalOpen(true);
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors relative font-sans overflow-x-hidden">
            <Navbar />

            {/* High-Fidelity Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, x: "-50%", opacity: 0, scale: 0.9 }}
                        animate={{ y: 80, x: "-50%", opacity: 1, scale: 1 }}
                        exit={{ y: -100, x: "-50%", opacity: 0, scale: 0.9 }}
                        className="fixed top-0 left-1/2 z-[300] w-full max-w-md px-6"
                    >
                        <div className={`p-6 rounded-[2rem] border shadow-[0_30px_60px_rgba(0,0,0,0.1)] flex items-center gap-6 ${notification.type === "success"
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-blue-600 text-white border-blue-500"
                            }`}>
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">System Message</p>
                                <p className="text-lg font-black italic uppercase tracking-tighter">{notification.message}</p>
                            </div>
                            <button onClick={() => setNotification(null)} className="p-2 opacity-50 hover:opacity-100 transition-all"><Plus className="w-6 h-6 rotate-45" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="relative z-10 p-6 md:p-12 lg:pt-32 max-w-7xl mx-auto">
                <SignedIn>
                    <AuthenticatedDashboard
                        onOpenModal={() => setIsModalOpen(true)}
                        onOpenCreditDialog={() => setIsCreditDialogOpen(true)}
                    />
                </SignedIn>

                <SignedOut>
                    <div className="text-center py-40 space-y-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.3em] shadow-sm"
                        >
                            <LockIcon className="w-4 h-4" /> Secure Hub Lockdown
                        </motion.div>
                        <h2 className="text-7xl lg:text-[10rem] font-black italic tracking-tighter uppercase dark:text-white leading-[0.75]">
                            Verify your <br />
                            <span className="text-blue-600">Identity.</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                            The G-Pilot Mission Hub requires an encrypted secure session
                            to access the tactical dashboard and mission ledger.
                        </p>
                        <div className="flex items-center justify-center gap-8 pt-12">
                            <SignInButton mode="modal">
                                <button className="h-24 px-16 bg-blue-600 text-white rounded-[2rem] font-black text-2xl hover:scale-105 transition-all shadow-[0_30px_60px_rgba(37,99,235,0.3)] active:scale-95 group">
                                    Initialize Login <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                                </button>
                            </SignInButton>
                        </div>
                    </div>
                </SignedOut>
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <MissionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => window.location.reload()}
                        initialInput={searchParams.get("prompt") || ""}
                    />
                )}
                {isCreditDialogOpen && (
                    <CreditDialog isOpen={isCreditDialogOpen} onClose={() => setIsCreditDialogOpen(false)} />
                )}
            </AnimatePresence>

            {/* Background Texture (Spatial) */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05] grayscale">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-50" />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-[#0b0e14] flex flex-col items-center justify-center gap-8">
                <div className="w-20 h-20 rounded-[2rem] border-4 border-blue-600 border-t-transparent animate-spin shadow-2xl shadow-blue-600/20" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 animate-pulse">Syncing G-Pilot Core</p>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
