/**
 * Build the show map web assets from show staff's approved SVGs.
 *
 *   node design-specs/show-map/build-map-assets.mjs <folder containing VBS_Desktop_Map.svg and VBS_Mobile_Map.svg>
 *
 * Writes public/show/show-map-desktop-2026.webp and show-map-mobile-2026.webp.
 *
 * Why this exists: Giselle's SVGs (received 2026-09-07 by email, also in her
 * Drive folder "01 Jon Neale / 2026 Show Map") are raster containers. Every
 * pixel of content is an embedded PNG tile and there are no <text> nodes, so
 * the files weigh 15 MB and 8 MB and nothing in them is selectable or
 * searchable. Rendering them once at display resolution and encoding as WebP
 * leaves appearance and content identical (her condition for optimising) at
 * about 0.2 and 0.4 MB.
 *
 * Desktop renders at its native 2475px viewBox width. Mobile renders at 1620px,
 * twice its 810px viewBox and under the 2160px source tile, so nothing is
 * upscaled beyond the pixels she supplied. If she issues revised SVGs, point
 * this at the folder and commit the two WebPs it writes. The SVGs themselves
 * are deliberately not kept in the repo.
 *
 * Uses Playwright's Chromium (a repo dev dependency) because headless Edge
 * would not launch on Jon's machine on 2026-09-07.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const SRC = process.argv[2];
if (!SRC) { console.error("usage: node design-specs/show-map/build-map-assets.mjs <folder with the two SVGs>"); process.exit(1); }
const OUT = resolve("public/show");

const JOBS = [
  ["VBS_Desktop_Map.svg", 2475, "show-map-desktop-2026"],
  ["VBS_Mobile_Map.svg", 1620, "show-map-mobile-2026"],
];

const mb = (p) => (statSync(p).size / 1048576).toFixed(2) + " MB";
const browser = await chromium.launch({ headless: true });
for (const [file, w, name] of JOBS) {
  const svg = readFileSync(resolve(SRC, file), "utf8");
  const vb = svg.match(/viewBox="([\d.\s]+)"/)[1].trim().split(/\s+/).map(Number);
  const h = Math.round((w * vb[3]) / vb[2]);
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#fff"><img id="m" style="display:block;width:${w}px;height:${h}px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"></body></html>`);
  await page.waitForFunction(() => { const m = document.getElementById("m"); return m.complete && m.naturalWidth > 0; }, null, { timeout: 120000 });
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
  const out = resolve(OUT, name + ".webp");
  await sharp(png).webp({ quality: 84, effort: 6 }).toFile(out);
  console.log(`${name}.webp  ${w}x${h}  ${mb(out)}`);
}
await browser.close();
