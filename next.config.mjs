import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
export default {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: root,
  poweredByHeader: false,
  transpilePackages: ['@veilops/shared', '@veilops/encryption', '@veilops/policy-engine', '@veilops/proof-engine', '@veilops/sdk', '@veilops/solana-adapter'],
  async headers() { return [{ source: '/:path*', headers: securityHeaders }]; },
};
