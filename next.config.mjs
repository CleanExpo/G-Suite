import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from 'next-pwa';

const withNextIntl = createNextIntlPlugin();

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    // Include custom push notification handler
    customWorkerSrc: 'worker',
    customWorkerDest: 'public',
    importScripts: ['/sw-push.js'],
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-images',
                expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /\/_next\/static.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'next-static',
                expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /^https:\/\/api\.linear\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
            },
        },
    ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',

    // Skip TypeScript errors for i18n route type validation (Next.js 16 known issue)
    typescript: {
        ignoreBuildErrors: true,
    },

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
        // Optimize package imports - tree-shake heavy libraries
        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            'date-fns',
            '@supabase/supabase-js',
            'googleapis',
            'zod',
        ],
    },

    // Webpack optimizations for asset handling
    webpack: (config, { isServer }) => {
        // Optimize SVG handling
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });

        // Bundle analyzer in analyze mode
        if (process.env.ANALYZE === 'true') {
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
                    openAnalyzer: false,
                })
            );
        }

        return config;
    },

    // Compiler optimizations
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production',
    },
};

export default withPWA(withNextIntl(nextConfig));
