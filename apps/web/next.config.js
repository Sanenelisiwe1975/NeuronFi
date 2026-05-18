/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

// Domains the app legitimately connects to
const CONNECT_SOURCES = [
  "'self'",
  'https://rpc-testnet.gokite.ai',
  'https://testnet.kitescan.ai',
  'https://ep-gentle-math-ami3i9nk-pooler.c-5.us-east-1.aws.neon.tech',
  'https://lenient-cheetah-78792.upstash.io',
  'wss://lenient-cheetah-78792.upstash.io',
  // MetaMask provider bridge
  'wss:',
].join(' ');

const SCRIPT_SRC = isDev
  // Dev: allow eval for Turbopack HMR source maps
  ? "'self' 'unsafe-eval' 'unsafe-inline'"
  // Prod: no eval, no inline
  : "'self'";

const CSP = [
  `default-src 'self'`,
  `script-src ${SCRIPT_SRC}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com data:`,
  `img-src 'self' data: blob: https:`,
  `connect-src ${CONNECT_SOURCES}`,
  `frame-ancestors 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
].join('; ');

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',   value: CSP },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
