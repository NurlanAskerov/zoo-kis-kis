/** @type {import('next').NextConfig} */
const oneYear = 31536000;

const nextConfig = {
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 2
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 82, 85, 88, 90, 94],
    minimumCacheTTL: oneYear,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${oneYear}, immutable`
          }
        ]
      },
      {
        source: '/favicon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${oneYear}, immutable`
          }
        ]
      },
      {
        source: '/hero-pets.png',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${oneYear}, immutable`
          }
        ]
      },
      {
        source: '/categories/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${oneYear}, immutable`
          }
        ]
      }
    ];
  }
};

export default nextConfig;
