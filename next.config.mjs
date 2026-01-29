import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // ... rest of your config

    // Image optimization for performance
    images: {
        // Enable modern formats
        formats: ['image/avif', 'image/webp'],
        // Optimize device sizes for responsive images
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        // Allow remote images if needed
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.google.com',
            },
            {
                protocol: 'https',
                hostname: '**.transparenttextures.com',
            },
        ],
    },

    // Turbopack is enabled by default in Next.js 16

    // Experimental features for better performance
    experimental: {
        // Optimize package imports
        optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns'],
    },

    // Compiler optimizations
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production',
    },
};

export default withNextIntl(nextConfig);
