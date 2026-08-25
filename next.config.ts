import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Same-origin proxy to the live Buoy API. Handled here (Next server) so it
  // works in local dev AND on Vercel; vercel.json carries the same rewrite as
  // an edge-level belt. Keeps the browser same-origin -> no CORS anywhere.
  async rewrites() {
    return [
      {
        source: "/buoy-api/:path*",
        destination: "https://api.buoylist.com/:path*",
      },
    ];
  },
};

export default nextConfig;
