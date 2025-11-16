/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Image optimization
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev'],
    formats: ['image/avif', 'image/webp'],
  },
  // Compression
  compress: true,
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
