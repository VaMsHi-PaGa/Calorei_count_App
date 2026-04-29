import type { NextConfig } from "next";

const backendUrl = process.env.FASTAPI_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=10, must-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: `${backendUrl}/dashboard`,
      },
      {
        source: "/food-log",
        destination: `${backendUrl}/food-log`,
      },
      {
        source: "/weight-log",
        destination: `${backendUrl}/weight-log`,
      },
      {
        source: "/users",
        destination: `${backendUrl}/users`,
      },
      {
        source: "/users/:path*",
        destination: `${backendUrl}/users/:path*`,
      },
    ];
  },
};

export default nextConfig;
