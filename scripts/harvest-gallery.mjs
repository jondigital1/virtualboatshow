/**
 * Headless gallery harvest for boats whose source page hides its photos.
 *
 * Why this exists: several dealer sites build their gallery in JavaScript, so
 * the plain-fetch importer sees one or two images however well the page is
 * written. D&R Boat World was the worst case, 14 boats stuck at two photos
 * each. A real browser renders the page and the gallery appears.
 *
 * DELIBERATELY NOT part of the daily sync. It needs a Chromium binary, it is
 * slow, and photos rarely change; putting all that inside an unattended cron
 * job risks the thing that keeps inventory correct every morning. Run it by
 * hand when boats are added or a gallery looks thin, then run the importer.
 *
 * It does NOT beat real bot management. Boston Whaler, Navan and Key West
 * return 403 to headless Chromium exactly as they do to fetch, so their boats
 * still need assets from the dealer.
 *
 * First run on a machine needs the browser binaries:
 *   npx.cmd playwright install chromium
 * (npx.cmd, not npx: PowerShell's execution policy blocks the .ps1 shim.)
 *
 * Usage:
 *   node scripts/harvest-gallery.mjs --thin          every boat under 4 photos
 *   node scripts/harvest-gallery.mjs --slugs=a,b,c   named boats
 *   node scripts/harvest-gallery.mjs --thin --dry    report only, write nothing
 *
 * Then: node scripts/import-show-boats.mjs   (picks the new files up as cached)
 */
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data", "show-boats.json");
const PHOTO_DIR = join(ROOT, "public", "boats");

const MIN_GALLERY = 4;
const MAX_PHOTOS = 12;
const DRY = process.argv.includes("--dry");
const THIN = process.argv.includes("--thin");
const SLUGS = new Set((process.argv.find((a) => a.startsWith("--slugs="))?.slice(8) ?? "").split(",").filter(Boolean));

const boats = JSON.parse(readFileSync(OUT, "utf8")).boats;
const targets = boats.filter((b) =>
  SLUGS.size ? SLUGS.has(b.slug) : THIN ? b.photos.length < MIN_GALLERY : false
);

if (!targets.length) {
  console.log("Nothing to do. Pass --thin or --slugs=a,b,c");
  process.exit(0);
}

/** Site furniture, badges and spacer gifs that are never boat photography. */
const JUNK = /favicon|logo|icon|sprite|placeholder|badge|pixel|avatar|banner|watermark|site-identity|blank\.|spacer/i;
/** Strip WordPress-style size suffixes so variants of one photo collapse. */
const dedupeKey = (u) => u.split("?")[0].replace(/-\d{2,4}x\d{2,4}(?=\.\w+$)/, "");

async function harvest(ctx, page, boat) {
  const url = boat.sourceUrl;
  if (!url) return { slug: boat.slug, status: "no-source" };

  let res;
  try {
    res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  } catch {
    return { slug: boat.slug, status: "load-failed" };
  }
  if (res && res.status() >= 400) return { slug: boat.slug, status: "http-" + res.status() };

  // Lazy loaders need the viewport to move before they swap in real sources.
  await page.waitForTimeout(2000);
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(600);
  }
  // Some galleries only populate once a thumbnail is clicked; nudge the first.
  try {
    const thumb = page.locator("[class*=thumb] img, [class*=gallery] img").first();
    if (await thumb.count()) { await thumb.click({ timeout: 3000 }); await page.waitForTimeout(1200); }
  } catch { /* no gallery widget: fine */ }

  // Collect every variant WITH its declared width. A gallery usually offers
  // the same photo at several sizes, and taking whichever URL appears first
  // means downloading a 300px thumbnail that then fails the minimum-size
  // check: boats with the most candidates yielded the fewest photos.
  const found = await page.evaluate(() => {
    const out = [];
    const push = (u, w) => { if (u) out.push({ u, w: Number(w) || 0 }); };
    for (const el of document.querySelectorAll("img")) {
      push(el.currentSrc, el.naturalWidth);
      push(el.src, el.naturalWidth);
      for (const a of ["data-src", "data-lazy", "data-original", "data-large_image", "data-zoom-image"]) push(el.getAttribute(a), 0);
      for (const part of (el.getAttribute("srcset") || "").split(",")) {
        const bits = part.trim().split(/\s+/);
        const d = bits[1] || "";
        push(bits[0], d.endsWith("w") ? parseInt(d, 10) : 0);
      }
    }
    // Slider libraries often park the full-size image on a background style.
    for (const el of document.querySelectorAll("[style*=background-image]")) {
      const m = /url\(["']?(https?:[^"')]+)/.exec(el.getAttribute("style") || "");
      if (m) push(m[1], 0);
    }
    // Some galleries keep the full-size original on the wrapping anchor.
    for (const a of document.querySelectorAll('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".webp"]')) push(a.href, 0);
    return out;
  });

  /** Dimensions encoded in a filename, e.g. hero-1920x1080.jpg */
  const suffixWidth = (u) => Number(/-(\d{2,4})x\d{2,4}(?=\.\w+$)/.exec(u)?.[1] ?? 0);

  // One entry per photo, holding the biggest variant we saw of it. A URL with
  // no size suffix is usually the untouched original, so it wins ties.
  const best = new Map();
  for (const { u, w } of found) {
    if (!/^https?:/i.test(u) || !/\.(jpe?g|png|webp)/i.test(u)) continue;
    if (JUNK.test(u)) continue;
    const key = dedupeKey(u);
    const score = Math.max(w, suffixWidth(u), suffixWidth(u) === 0 ? 9999 : 0);
    const prev = best.get(key);
    if (!prev || score > prev.score) best.set(key, { url: u, score });
  }
  const candidates = [...best.values()].map((v) => v.url);

  if (DRY) return { slug: boat.slug, status: "dry", found: candidates.length };
  if (!candidates.length) return { slug: boat.slug, status: "no-images" };

  // Write to fresh numbers, then remove the old set only if enough landed:
  // a half-finished harvest must not leave a boat worse off than before.
  const mine = new RegExp("^" + boat.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-\\d+\\.(jpe?g|png|webp)$", "i");
  const existing = readdirSync(PHOTO_DIR).filter((f) => mine.test(f));
  const startAt = existing.reduce((m, f) => Math.max(m, Number(f.match(/-(\d+)\.\w+$/)?.[1]) || 0), 0);

  const written = [];
  for (const src of candidates) {
    if (written.length >= MAX_PHOTOS) break;
    try {
      // context.request, NOT an in-page fetch. Image CDNs generally send no
      // CORS headers, so fetch() inside the page throws on every download and
      // the harvest silently produces nothing however many images it found.
      const resp = await ctx.request.get(src, { timeout: 25000 });
      if (!resp.ok()) continue;
      const buf = await resp.body();
      if (!buf || buf.length < 8000 || buf.length > 15_000_000) continue;
      const img = sharp(buf);
      const meta = await img.metadata();
      // Real photography only: filters out swatches, icons and hero strips.
      if (!meta.width || meta.width < 500 || (meta.height ?? 0) < 300) continue;
      const out = await img.resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      const name = `${boat.slug}-${startAt + written.length + 1}.jpg`;
      writeFileSync(join(PHOTO_DIR, name), out);
      written.push(name);
    } catch { continue; }
  }

  if (written.length <= existing.length) {
    for (const f of written) { try { unlinkSync(join(PHOTO_DIR, f)); } catch {} }
    return { slug: boat.slug, status: "no-better", found: candidates.length, kept: existing.length };
  }
  for (const f of existing) { try { unlinkSync(join(PHOTO_DIR, f)); } catch {} }
  return { slug: boat.slug, status: "ok", before: existing.length, after: written.length };
}

// The default launch wants a separate chrome-headless-shell binary, which
// some shells fail to see even when it is present and complete. The full
// Chromium build is installed alongside it and works identically here, so
// fall back to that rather than making the caller debug their environment.
let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  console.log("headless shell unavailable, using full chromium");
  browser = await chromium.launch({ channel: "chromium" });
}
const ctx = await browser.newContext({
  viewport: { width: 1400, height: 1000 },
  locale: "en-US",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
});
const page = await ctx.newPage();

console.log(`harvesting ${targets.length} boat(s)${DRY ? " (dry run)" : ""}\n`);
const results = [];
for (const b of targets) {
  const r = await harvest(ctx, page, b);
  results.push(r);
  const label = `${b.brand} ${b.model}`.slice(0, 34).padEnd(35);
  console.log(`  ${label} ${r.status}${r.after ? ` ${r.before} -> ${r.after}` : ""}${r.found !== undefined ? ` (${r.found} candidates)` : ""}`);
}

await browser.close();

const ok = results.filter((r) => r.status === "ok");
console.log(`\n${ok.length} improved, ${results.length - ok.length} unchanged`);
const blocked = results.filter((r) => String(r.status).startsWith("http-"));
if (blocked.length) console.log(`blocked by bot protection: ${blocked.map((r) => r.slug).join(", ")}`);
if (ok.length) console.log("\nNow run: node scripts/import-show-boats.mjs");
