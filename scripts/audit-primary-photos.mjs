/**
 * Measures every boat's lead photo. Read-only.
 *
 * Dimensions alone cannot tell a hero shot from a zoomed detail, so this does
 * not try. It reports the shape of each lead image and flags the cases a
 * measurement CAN catch (portrait or square crops, small files, images much
 * smaller than their siblings) so a visual pass can start with the likely
 * offenders instead of all 174.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const boats = JSON.parse(readFileSync(join(ROOT, "data", "show-boats.json"), "utf8")).boats;
const PHOTO_DIR = join(ROOT, "public", "boats");

const rows = [];
for (const b of boats) {
  if (!b.photos.length) continue;
  const file = b.photos[0].replace("/boats/", "");
  try {
    const m = await sharp(join(PHOTO_DIR, file)).metadata();
    const ar = m.width / m.height;
    // Sibling comparison: a lead much smaller than the rest of its own gallery
    // is usually a thumbnail or a crop that slipped to the front.
    let sibMax = 0;
    for (const p of b.photos.slice(1, 5)) {
      try {
        const s = await sharp(join(PHOTO_DIR, p.replace("/boats/", ""))).metadata();
        sibMax = Math.max(sibMax, s.width * s.height);
      } catch { /* skip */ }
    }
    const px = m.width * m.height;
    const flags = [];
    if (ar < 1.0) flags.push("PORTRAIT");
    else if (ar < 1.25) flags.push("near-square");
    if (m.width < 900) flags.push("low-res");
    if (sibMax && px < sibMax * 0.45) flags.push("much-smaller-than-siblings");
    rows.push({ slug: b.slug, label: `${b.brand} ${b.model}`, file, w: m.width, h: m.height, ar: +ar.toFixed(2), n: b.photos.length, flags });
  } catch (e) {
    rows.push({ slug: b.slug, label: `${b.brand} ${b.model}`, file, w: 0, h: 0, ar: 0, n: b.photos.length, flags: ["UNREADABLE"] });
  }
}

const flagged = rows.filter((r) => r.flags.length);
console.log(`lead photos measured: ${rows.length}`);
console.log(`flagged by measurement: ${flagged.length}\n`);
for (const r of flagged.sort((a, b) => a.ar - b.ar)) {
  console.log(`  ${r.slug.padEnd(42)} ${String(r.w).padStart(5)}x${String(r.h).padEnd(5)} ar=${String(r.ar).padEnd(5)} of ${r.n}  ${r.flags.join(", ")}`);
}

const byAr = {};
for (const r of rows) {
  const k = r.ar < 1 ? "portrait" : r.ar < 1.25 ? "near-square" : r.ar < 1.45 ? "4:3-ish" : r.ar < 1.8 ? "3:2-ish" : "wide";
  byAr[k] = (byAr[k] ?? 0) + 1;
}
console.log("\nlead-photo shape distribution:", JSON.stringify(byAr));
