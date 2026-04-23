/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compress responses with gzip for smaller transfer sizes
  compress: true,
  // Optimize images and allow external sources if needed
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  // Reduce bundle size by removing console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Enable experimental optimisation for package imports
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
