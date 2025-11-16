/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // 💥 ignores all lint errors during Vercel build
  },
  typescript: {
    ignoreBuildErrors: true,   // 💥 ignores TS errors during Vercel build
  },
};

module.exports = nextConfig;