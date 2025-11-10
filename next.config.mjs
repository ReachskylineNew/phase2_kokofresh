/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    domains: ['static.wixstatic.com'], // Allow external images from Wix
    // unoptimized: true, // Removed to enable image optimization
  },

  // ✅ Disable rewrites & middleware warnings in dev
  ...(isDev
    ? {}
    : {
        async rewrites() {
          return [
            {
              source: "/product/:slug",
              destination: "/product/slug-redirect",
            },
          ];
        },
      }),
};

export default nextConfig;
