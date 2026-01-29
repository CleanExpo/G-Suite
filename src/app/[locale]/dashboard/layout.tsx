"use client";

import { Sidebar } from '@/components/sidebar';
import { useAuth } from '@/components/auth/auth-provider';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;
    if (!user) return <>{children}</>; // Landing page handled by page.tsx

    return (
        <div className="flex min-h-screen bg-[#0b0e14] transition-colors relative">
            <Sidebar />

            {/* Main Viewport */}
            <main className="flex-1 ml-20 lg:ml-auto pl-0 lg:pl-[80px] group-data-[collapsed=false]:lg:pl-[280px] transition-all duration-300">
                <div className="max-w-[1600px] mx-auto p-6 md:p-12 lg:p-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full" />
            </div>
        </div>
    );
}
