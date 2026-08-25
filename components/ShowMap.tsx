import { SHOW_MAP_WIDE, SHOW_MAP_MOBILE } from "@/lib/showmap";

/**
 * The official 2026 show map (Jon's Claude Design vectors), responsive:
 * landscape layout on desktop/tablet, tall layout on phones (breakpoint in
 * globals.css: .show-map-wide / .show-map-mobile). Inline SVG keeps slip
 * labels crisp at any zoom; the map's display fonts load via the Google
 * Fonts link below (Barlow Condensed / Jost / Bodoni Moda), with Poppins
 * fallbacks baked into the SVGs.
 */
export function ShowMap() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Jost:wght@500;600;700&family=Bodoni+Moda:wght@600&display=swap"
      />
      <div className="show-map-wide" dangerouslySetInnerHTML={{ __html: SHOW_MAP_WIDE }} />
      <div className="show-map-mobile" dangerouslySetInnerHTML={{ __html: SHOW_MAP_MOBILE }} />
    </>
  );
}
