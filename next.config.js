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
    serverComponentsExternalPackages: ['@libsql/client']
  }
};

export default nextConfig;
