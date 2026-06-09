// next.config.js - À créer à la racine du projet

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // DÉVELOPPEMENT (localhost)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/media/**',
      },
      
      // PRODUCTION (votre domaine)
      {
        protocol: 'https',
        hostname: 'bittonik.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bittonik.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '154.12.254.99',
        pathname: '/media/**',
      },
      
      // CLOUDFLARE R2 (FUTUR - si vous utilisez)
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
};

module.exports = nextConfig;
