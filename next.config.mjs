/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize build cache
  experimental: {
    // Enable build cache optimizations
    turbo: {
      // Enable Turbopack for faster builds (if available)
    },
  },
  // Cache optimization
  compiler: {
    // Remove console.logs in production for better caching
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  // Static optimization
  output: 'standalone',
}

export default nextConfig
