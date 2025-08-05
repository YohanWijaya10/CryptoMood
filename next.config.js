/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      // CoinDesk
      {
        protocol: 'https',
        hostname: 'www.coindesk.com',
      },
      {
        protocol: 'https',
        hostname: 'coindesk.com',
      },
      // Cointelegraph
      {
        protocol: 'https',
        hostname: 'images.cointelegraph.com',
      },
      {
        protocol: 'https',
        hostname: 'cointelegraph.com',
      },
      // Decrypt
      {
        protocol: 'https',
        hostname: 'cdn.decrypt.co',
      },
      {
        protocol: 'https',
        hostname: 'decrypt.co',
      },
      // Yahoo Finance
      {
        protocol: 'https',
        hostname: 's.yimg.com',
      },
      {
        protocol: 'https',
        hostname: 'finance.yahoo.com',
      },
      // MarketWatch
      {
        protocol: 'https',
        hostname: 'images.mktw.net',
      },
      {
        protocol: 'https',
        hostname: 'mw3.wsj.net',
      },
      {
        protocol: 'https',
        hostname: 'marketwatch.com',
      },
      // Unsplash (for fallback images)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // JWPlayer (video thumbnails)
      {
        protocol: 'https',
        hostname: 'cdn.jwplayer.com',
      },
      // Additional common RSS image domains
      {
        protocol: 'https',
        hostname: 'www.reuters.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cnn.com',
      },
      {
        protocol: 'https',
        hostname: 'media.cnn.com',
      },
      {
        protocol: 'https',
        hostname: 'techcrunch.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bloomberg.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.bwbx.io',
      },
      // Generic patterns for RSS feeds
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '*.wp.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      // Catch common CDN patterns
      {
        protocol: 'https',
        hostname: '*.fastly.com',
      },
      {
        protocol: 'https',
        hostname: '*.akamaized.net',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.*',
      }
    ],
  },
}

module.exports = nextConfig