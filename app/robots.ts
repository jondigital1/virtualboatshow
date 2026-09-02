import type { MetadataRoute } from "next";

/**
 * www is the canonical host: the apex 308-redirects to it, and every canonical
 * and OG url on the site names www. The sitemap line has to agree, or the one
 * pointer Google follows to find all 195 URLs sends it through a redirect to a
 * host it was told not to treat as canonical.
 *
 * Cloudflare injects its own managed block above this one in the served file,
 * including Disallow rules for several AI crawlers. That block is not editable
 * from this repo. It permits search indexing (Content-Signal: search=yes) and
 * does not restrict Googlebot or facebookexternalhit, so it does not affect
 * indexing or Meta ad review.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: "https://www.acvirtualboatshow.com/sitemap.xml",
  };
}
