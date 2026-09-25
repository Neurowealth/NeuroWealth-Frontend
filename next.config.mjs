/** @type {import('next').NextConfig} */
// Fixes issue 443: Implement frontend performance optimization pass
const nextConfig = {
  output: "standalone",
  eslint: {
    // Lint errors must be resolved before a production build succeeds.
    ignoreDuringBuilds: false,
  },
  reactStrictMode: true,
  staticPageGenerationTimeout: 0,
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
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  async redirects() {
    return [
      {
        source: "/signin",
        destination: "/login",
        permanent: true,
      },
    ];
  },
  // Fixes issue 653: Basename security headers applied to all routes
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          // Prevent clickjacking by disallowing framing
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Restrict referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict browser features/APIs
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
          },
          // Enforce HTTPS and HSTS for subresources
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Baseline CSP: restrict to self for most directives
          // 'unsafe-inline' and 'unsafe-eval' kept for Next.js runtime
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.neurowealth.io https://*.stellar.org https://*.futurenet.stellar.org",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

// Bundle analyzer (dev-only, enabled via ANALYZE=true)
import withBundleAnalyzer from '@next/bundle-analyzer';

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);