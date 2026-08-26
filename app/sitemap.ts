import type { MetadataRoute } from "next";
import { showBoats } from "@/lib/showboats";

const BASE = "https://acvirtualboatshow.com";

/** Sitemap for search engines: core pages plus every boat in the show.
 *  The boat list regenerates with each deploy, so daily inventory syncs
 *  keep this current automatically. */
export default function sitemap(): MetadataRoute.Sitemap {
  const core: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/inventory`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/vendors`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/map`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/plan`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/sponsors`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
  const boats: MetadataRoute.Sitemap = showBoats.map((b) => ({
    url: `${BASE}/boats/${b.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));
  return [...core, ...boats];
}
