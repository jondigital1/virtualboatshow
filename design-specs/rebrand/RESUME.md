# Resume checkpoint — 2026-08-25 (evening pause)

Site is fully deployed and healthy at acvirtualboatshow.com. Everything committed & pushed
(HEAD: "Hero shows the full marina"). Daily 8:08 AM inventory sync is armed — still needs
one manual "Run now" from Jon in the Scheduled sidebar to pre-approve its tools.

## Jon's restart list (his words, in order)

1. **Favicon fix with boat show logo.**
   Note: a new favicon (white boat mark on navy tile, app/icon.png + app/apple-icon.png,
   built by scripts/generate-og-icons.mjs) shipped today — browsers cache favicons hard,
   so first verify whether Jon is seeing the old cached icon or actually wants a different
   treatment (e.g. different mark/colors). Adjust to his taste.

2. **Replace the map image with the newly created one from Claude Design.**
   Jon is producing a new show map in Claude Design. When he shares it: export/receive the
   asset, save under a NEW filename (cache rule: changed assets get new names — replaces
   public/show/show-map-2026.png), swap references on the homepage map section and /map
   page, and consider regenerating any map-derived crops.

3. **Another full pass over the website — mobile AND desktop.**
   Walk every page both widths, visual + interaction. Today's mobile pass fixed the
   Explore-card stacking; this pass is broader polish (spacing, type scale, image quality,
   dead ends, copy typos).

## Standing state (don't relitigate)
- Inventory: 86 curated boats / 12 dealers from Giselle's workbook; importer has
  dedupe guards; galleries up to 12 photos; VDP lightbox; SRP card carousels.
- No prices anywhere. Featured rail + exhibitor tiles rotate fairly per load.
- Leads decision PARKED (email capture vs text-the-dealer) — endpoint still logs only.
- Waiting on Giselle: photography pack, hi-res official map, booth #s, dock/slips,
  per-dealer SMS numbers, brand sheet fonts. Morning sync watches the Drive folder.
- Cache rule: any changed image gets a new filename.
- CSS rule: ASCII-only comments in globals.css (em-dash broke the compiler once).
