import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  images: {
    // AVIF first: ~30% smaller than WebP on these photos. Next falls back
    // automatically for clients that don't send the Accept header.
    formats: ['image/avif', 'image/webp'],
    // Trimmed to the widths this layout can actually paint (largest render is
    // the 620px hero at 2x). Fewer entries = fewer transforms and a shorter
    // srcset on every <img>.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [200, 300, 400, 600],
    minimumCacheTTL: 31536000,
  },

  async headers() {
    return [
      {
        // Subset fonts are content-hashed by name and never mutate in place.
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
