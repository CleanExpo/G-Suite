import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SuitePilot App - Mission Control",
    description: "Launch AI-driven missions with full workspace autonomy.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: "#2563eb",
                    colorBackground: "#0d1117",
                    colorText: "#ffffff",
                    colorInputBackground: "#161b22",
                    colorInputText: "#ffffff",
                },
                elements: {
                    card: "bg-[#0d1117] border border-white/5 shadow-2xl rounded-3xl",
                    navbar: "bg-[#0d1117]",
                    footer: "bg-[#0d1117]",
                    headerTitle: "text-white font-black italic uppercase tracking-tighter",
                    headerSubtitle: "text-slate-500",
                    socialButtonsBlockButton: "bg-white/5 border-white/5 hover:bg-white/10 text-white",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20",
                }
            }}
        >
            <html lang="en">
                <body className={inter.className} suppressHydrationWarning>{children}</body>
            </html>
        </ClerkProvider>
    );
}
