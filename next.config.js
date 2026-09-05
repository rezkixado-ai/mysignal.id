/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true // media comes from our own /api/media-serve route (Netlify Blobs) or Picsum placeholders
  },
  // @libsql/client ships a native per-platform binary (e.g. @libsql/linux-x64-gnu).
  // Next.js's own bundler drops that binary if it tries to bundle the package,
  // the exact same crash this project hit before with Netlify Functions'
  // esbuild bundling. Marking it external keeps it as a plain node_modules
  // require at runtime instead, preserving the native binary.
  experimental: {
    serverComponentsExternalPackages: ['@libsql/client'],
    // Next.js's client-side Router Cache normally keeps a page's fetched
    // data around for ~30s (dynamic) after you navigate away from it, even
    // though the page itself is `force-dynamic` on the server. That's what
    // made a freshly-published article invisible on /news and / until a
    // hard refresh or a brand-new tab — the server was always up to date,
    // but the browser was serving its own short-lived in-memory snapshot.
    // Setting `dynamic: 0` makes every client-side navigation revalidate
    // immediately for dynamic routes instead of reusing that snapshot.
    staleTimes: {
      dynamic: 0,
      static: 180
    }
  },
  // Belt-and-suspenders against stale CDN/edge caching of admin-editable
  // content: `export const dynamic = 'force-dynamic'` on these pages should
  // already prevent caching, but explicit headers make sure no intermediate
  // cache (Netlify's CDN included) serves an old snapshot after an edit.
  async headers() {
    const noStore = [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }];
    return [
      { source: '/', headers: noStore },
      { source: '/news', headers: noStore },
      { source: '/article/:slug*', headers: noStore },
      { source: '/api/:path*', headers: noStore }
    ];
  }
};

export default nextConfig;
