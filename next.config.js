/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['www.coindesk.com', 'coindesk.com'],
  },
}

module.exports = nextConfig