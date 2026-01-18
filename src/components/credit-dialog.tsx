"use client"

import { useState } from "react";
import { Rocket, Zap, Shield, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { createCheckoutSession } from "@/actions/stripe.actions";

// Since I don't see a components/ui/dialog, I will build a premium custom modal using Framer Motion.

export default function CreditDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [loading, setLoading] = useState<string | null>(null);

    const packages = [
        {
            id: "STARTER",
            name: "Starter",
            price: "$22",
            credits: "500",
            icon: <Zap className="w-5 h-5 text-amber-400" />,
            color: "border-amber-500/20 bg-amber-500/5",
            btnColor: "bg-amber-500 hover:bg-amber-400",
            features: ["Essential Orchestration", "Standard Support"]
        },
        {
            id: "PRO",
            name: "Pro Explorer",
            price: "$33",
            credits: "1,500",
            icon: <Rocket className="w-5 h-5 text-blue-400" />,
            color: "border-blue-500/40 bg-blue-500/10",
            btnColor: "bg-blue-600 hover:bg-blue-500",
            popular: true,
            features: ["Deep Research Access", "Priority Uplink"]
        },
        {
            id: "GROWTH",
            name: "Enterprise Growth",
            price: "$49.95",
            credits: "5,000",
            icon: <Shield className="w-5 h-5 text-emerald-400" />,
            color: "border-emerald-500/20 bg-emerald-500/5",
            btnColor: "bg-emerald-600 hover:bg-emerald-500",
            features: ["Advanced Mission Control", "Custom SPEC Nodes"]
        },
        {
            id: "ENTERPRISE",
            name: "Orbiting Titan",
            price: "$99",
            credits: "15,000",
            icon: <Shield className="w-5 h-5 text-purple-400" />,
            color: "border-purple-500/20 bg-purple-500/5",
            btnColor: "bg-purple-600 hover:bg-purple-500",
            features: ["Unlimited Missions", "24/7 Priority Support", "White-glove Setup"]
        }
    ];

    async function handlePurchase(pkgId: any) {
        setLoading(pkgId);
        try {
            const result = await createCheckoutSession(pkgId);
            if (result.url) {
                window.location.href = result.url;
            }
        } catch (error) {
            console.error("Purchase failed:", error);
            alert("Failed to initialize secure checkout. Please try again.");
        } finally {
            setLoading(null);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="relative w-full max-w-4xl bg-[#0d1117] border border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden"
            >
                <div className="p-8 md:p-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">
                            Fuel Your <span className="text-blue-500">Autonomous Fleet</span>
                        </h2>
                        <p className="text-slate-400 font-medium">Select a credit package to power your Next-Gen AI missions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`relative p-8 rounded-3xl border ${pkg.color} flex flex-col transition-all hover:scale-[1.02] duration-300`}
                            >
                                {pkg.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-widest">
                                        Most Popular
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                                        {pkg.icon}
                                    </div>
                                    <h3 className="font-bold text-slate-200">{pkg.name}</h3>
                                </div>

                                <div className="mb-6">
                                    <div className="text-4xl font-black text-white">{pkg.price}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                        For {pkg.credits} Credits
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {pkg.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                            <Check className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    disabled={!!loading}
                                    onClick={() => handlePurchase(pkg.id)}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${pkg.btnColor} ${loading === pkg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading === pkg.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Purchase Now"
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" /> SECURE STRIPE ENCRYPTED CHECKOUT
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
