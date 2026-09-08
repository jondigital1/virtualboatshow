import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Printed QR codes point here, never at a page directly. A QR is permanent
  // once it is on a banner; this path is not. If the destination ever needs
  // to change, change it here and every printed code follows. Temporary (307)
  // on purpose so browsers do not cache the target. The UTM tags are the only
  // way a scan can be told apart from a typed URL, since a scan has no
  // referrer, and lib/attribution.ts carries them into every lead.
  async redirects() {
    return [
      {
        source: "/scan",
        destination: "/inventory?utm_source=qr&utm_medium=print&utm_campaign=acbs-2026&utm_content=browse-boats",
        permanent: false,
      },
      // The show's own link to the virtual show, for its emails, social posts
      // and website. Lands on the homepage, the front door for someone who has
      // not been here before, tagged so those visits show up in Vercel
      // Analytics as their own source. Same reasoning as /scan: the path is
      // what gets published, so the destination can move without republishing.
      {
        source: "/show",
        destination: "/?utm_source=acinwaterboatshow&utm_medium=referral&utm_campaign=acbs-2026&utm_content=show-link",
        permanent: false,
      },
    ];
  },
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
