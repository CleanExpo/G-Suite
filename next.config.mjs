/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    env: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_c2F2ZWQtYnV6emFyZC0xNy5jbGVyay5hY2NvdW50cy5kZXYk",
    },
};

export default nextConfig;
