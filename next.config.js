// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'press.bittonik.com',  // ← AJOUTÉ!
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'bittonik.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bittonik.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '154.12.254.99',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
};

module.exports = nextConfig;