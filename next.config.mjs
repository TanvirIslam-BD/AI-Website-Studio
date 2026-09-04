/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * The libSQL driver adapter loads a native module and resolves some of its
   * dependencies dynamically, which webpack cannot statically analyse (it tries
   * to bundle the package's README). These are server-only, so leave them as
   * real Node requires instead of bundling them.
   */
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-libsql', '@libsql/client', 'libsql'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
