# Resume checkpoint — 2026-08-25 (Jon in transit)

## Where we are
Curated inventory build (SRP/VDP from Giselle's workbook) is ~80% done. Live site
(acvirtualboatshow.com) still runs the previous deploy — nothing broken, nothing half-shipped.

Done:
- data/show-boats.json: 86 boats / 12 dealers imported (scripts/import-show-boats.mjs)
- public/boats/: 237 photos from the first import + 35 rescued (Sheltered Cove ×11 boats,
  Key West 249 FS, BW 220 Dauntless ×2, BW 325 Conquest ×1)
- New pages built, not yet deployed: /inventory rewritten on curated data (no prices,
  gold note badges, dealer filter), /boats/[slug] VDP (gallery, dealer block, show panel),
  lib/showboats.ts (incl. pickFeatured — per-dealer fair random rotation)
- Daily 8:08 AM scheduled task "vbs-feature-boats-daily-check": Drive workbook → diff →
  reimport → build → deploy, with guardrails. NEEDS one manual "Run now" to pre-approve tools.

## Next steps, in order
1. Finish photo rescue (browser canvas-extraction route, see scripts/rescue-photos.ps1
   header): Navan T-30 + S30 (navan-boats.com model pages), Tiara 39LS (tiarayachts.com,
   lazy-loads — scroll first), Regulator 35/31/24XO (regulatormarine.com model pages;
   Comstock's own site is behind an interactive Cloudflare wall — do not bypass).
2. node scripts/import-show-boats.mjs   (folds rescued photos into show-boats.json)
3. Batch-resize public/boats/ (85 MB → target <20 MB: cap ~1280px wide, jpeg q82)
4. app/page.tsx: replace Buoy-feed thumbnail rail with curated photos + add
   "Featured at the Show" section using pickFeatured() (client-side, reshuffles per load)
5. QA in preview: /, /inventory, /boats/[first-slug], mobile width
6. npm run build → commit + push → vercel --prod
7. Report boat/photo counts to Jon; remind about "Run now" on the scheduled task

## Standing decisions (do not relitigate)
- No prices anywhere on boat cards/VDPs; "X" workbook rows = Not Selected = excluded
- Featured real estate rotates fairly BY DEALER, not by boat count
- Fallback: if Fable usage runs out, Jon says switch to Opus + ultracode
