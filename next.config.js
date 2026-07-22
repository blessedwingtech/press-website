// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 INDISPENSABLE pour générer .next/standalone/server.js
  output: 'standalone',

  // 🔥 Ignorer les erreurs ESLint pendant le build (vous pourrez les corriger plus tard)
  eslint: {
    ignoreDuringBuilds: true,
  },

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
        hostname: 'press.bittonik.com',
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
      {
        protocol: 'https',
        hostname: 'pub-89e90effd8c84fc486672a8cfe792db8.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
};

module.exports = nextConfig;