/**
 * The official 2026 show map, as approved by show staff (Giselle, 2026-09-06):
 * VBS_Desktop_Map for desktop and tablet, VBS_Mobile_Map for phones, switched
 * by the breakpoint in globals.css (.show-map-wide / .show-map-mobile).
 *
 * Her files are SVGs in name only. Every pixel of content is an embedded PNG
 * raster and there is not one <text> node, so they arrived at 15 MB and 8 MB.
 * They are served here as WebP renders at full resolution (desktop at its
 * native 2475px, mobile at 1620px, under the 2160px source tiles), which is
 * 0.22 MB and 0.37 MB with appearance and content unchanged. That was her
 * stated condition for optimising. Regenerate from the SVGs with the build
 * script in design-specs/show-map/ if she issues a revision.
 *
 * The maps carry slip numbers, land display letters and booth numbers but no
 * exhibitor names. That is why the Dock and Slip list stays on the page next
 * to them: it is the only place a visitor can look up which dock a dealer is
 * on. The earlier hand-built inline SVG map (lib/showmap.ts) was retired with
 * this change.
 */
const ALT = "2026 Atlantic City In-Water Boat Show map: land displays A to E, Marine Marketplace booths, and E and F dock slips at Farley State Marina";

export function ShowMap() {
  return (
    <>
      <div className="show-map-wide">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/show/show-map-desktop-2026.webp" width={2475} height={1912} alt={ALT} loading="eager" decoding="async" />
      </div>
      <div className="show-map-mobile">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/show/show-map-mobile-2026.webp" width={1620} height={5670} alt={ALT} loading="eager" decoding="async" />
      </div>
    </>
  );
}
