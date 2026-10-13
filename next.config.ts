import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  serverExternalPackages: ['mysql2'],
  outputFileTracingIncludes: { '/*': ['./site/**/*.html'] },
};
export default nextConfig;
