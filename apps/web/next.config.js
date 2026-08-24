/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export: the dashboard is a client-only SPA that fetches the API
  // at runtime via NEXT_PUBLIC_API_URL (see web/lib/api.ts). This makes it
  // deployable to Cloudflare Pages as plain static assets (no Functions needed).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
