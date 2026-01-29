'use client';

import { useLocale, useTranslations } from 'next-intl';
import { routing, useRouter, usePathname } from '@/i18n/routing';
import { setUserLocale } from '@/lib/locale';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
    ];

    async function onSelectLocale(nextLocale: string) {
        setIsOpen(false);
        await setUserLocale(nextLocale);
        router.replace(pathname, { locale: nextLocale });
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-gray-500 dark:text-gray-400 group"
            >
                <Globe className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-48 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] p-2"
                    >
                        <div className="grid grid-cols-1 gap-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => onSelectLocale(lang.code)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${locale === lang.code
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <span>{lang.name}</span>
                                    <span className="text-base grayscale-0 group-hover:grayscale">{lang.flag}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
