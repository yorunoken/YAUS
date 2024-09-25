/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverActions: {
            allowedOrigins: ["short.yorunoken.com", "127.0.0.1:3005"],
        },
    },
};

export default nextConfig;
