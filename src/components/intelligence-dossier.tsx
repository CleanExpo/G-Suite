'use client';

import { motion } from 'framer-motion';
import { FileText, ArrowRight, Shield, Star, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface DossierProps {
    report: {
        id: string;
        mission: string;
        summary: string;
        score: number;
        timestamp: Date;
        artifactCount: number;
        previewUrl?: string | null;
    } | null;
}

export function IntelligenceDossier({ report }: DossierProps) {
    const t = useTranslations('IntelligenceDossier');
    if (!report) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 lg:col-span-3 bg-[#0f1117] border border-white/5 rounded-[3rem] overflow-hidden relative group"
        >
            <div className="absolute top-0 right-0 p-8 flex items-center gap-4 z-20">
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('highProbability')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left side: Metadata & Text */}
                <div className="p-8 md:p-12 space-y-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                                {t('dossierId')} #{report.id.slice(0, 6)}
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none mb-6">
                            {t('title').split(' ').slice(0, -1).join(' ')} <br /> <span className="text-blue-500">{t('title').split(' ').slice(-1)}</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-md italic">
                            "{report.summary}"
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">{t('qualityScore')}</span>
                            <span className="text-2xl font-black text-emerald-400 italic">{report.score}%</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">{t('artifacts')}</span>
                            <span className="text-2xl font-black text-white italic">{report.artifactCount}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">{t('sectorOrigin')}</span>
                            <span className="text-2xl font-black text-blue-500 italic">G-PILOT-8</span>
                        </div>
                    </div>

                    <div className="pt-6 flex items-center gap-6">
                        <button className="h-14 px-8 bg-white text-black font-black flex items-center gap-3 rounded-2xl hover:bg-blue-50 transition-all text-sm uppercase italic tracking-tighter">
                            {t('openDossier')} <ArrowRight className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 text-gray-500">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">{t('verifiedBy')}</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Preview or Abstract Art */}
                <div className="h-64 md:h-auto bg-[#1a1c23] relative overflow-hidden">
                    {report.previewUrl ? (
                        <img
                            src={report.previewUrl}
                            alt="Mission Preview"
                            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                                <Info className="w-24 h-24 text-blue-500/20 relative z-10" />
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117] via-transparent to-transparent hidden md:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent md:hidden" />
                </div>
            </div>
        </motion.div>
    );
}
