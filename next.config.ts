import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: [
      "@aws-sdk/client-s3",
      "@aws-sdk/s3-request-presigner",
    ],
    // Allow large file uploads (default body limit is 1MB on the App Router).
    // We forward to R2 via streamed PutObject, so this only needs to cover
    // the multipart parse buffer — set generously up to 110MB to allow
    // 100MB files + form overhead.
    serverActions: {
      bodySizeLimit: "110mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
