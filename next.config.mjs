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
  /**
   * The Vercel marketplace listing points its EULA link at /eula, and that
   * URL is public now. The terms page is the EULA, so keep one canonical
   * page and let the other address reach it.
   */
  async redirects() {
    return [{ source: '/eula', destination: '/terms', permanent: true }];
  },
};

export default nextConfig;
