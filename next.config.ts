import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/faq", destination: "/help", permanent: true },
      { source: "/contact", destination: "/help?intent=report", permanent: true },
      { source: "/indore", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
