/**
 * Show-boat importer: turns Giselle's "2026 Feature Boats" workbook into
 * data/show-boats.json + photos in public/boats/.
 *
 * Pipeline position: parse-feature-boats.ps1 -AsJson -> data/feature-boats-raw.json
 * -> this script -> data/show-boats.json (consumed by lib/showboats.ts).
 *
 * Selection rules (from the workbook's own conventions):
 *  - "Models To Do" sheet, one section per dealer (header row = dealer name).
 *  - Row columns: c1/c2 status codes, c3 year, c4 brand, c5 priority
 *    (1 = hero, 2 = supporting, X = cut), c6 model, c7 dealer notes,
 *    c8 dealer listing link, c9 brand link.
 *  - Excluded: status X / "Not Selected" / "No Model Supplied" / "Waiting".
 *  - "SHARED BRAND" in c8 -> use the brand link; same brand+model under two
 *    dealers merges into one boat credited to both.
 *  - Sheltered Cove rows carry "Name https://url" text in c8 -> extract URL.
 *
 * Photos: up to 4 per boat from the source page (og:image + inventory imgs),
 * saved as public/boats/<slug>-<n>.<ext>. Boats that already have photos on
 * disk are not refetched, so daily syncs only hit new/changed listings.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "feature-boats-raw.json");
const OUT = join(ROOT, "data", "show-boats.json");
const PHOTO_DIR = join(ROOT, "public", "boats");
mkdirSync(PHOTO_DIR, { recursive: true });

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 ACVBS-showbot/1.0 (acvirtualboatshow.com; official show companion)";

/** Workbook section header -> site dealer identity (matches /vendors data). */
const DEALER_META = {
  "Clarks Landing Marina": { name: "Clarks Landing Yacht Sales & Marina", loc: "Point Pleasant, NJ", phone: "(732) 899-5559" },
  "Coastal Boat Sales": { name: "Coastal Boat Sales", loc: "Brick, NJ", phone: "(732) 458-3540" },
  "Comstock Yacht Sales & Marina": { name: "Comstock Yacht Sales & Marina", loc: "Brick, NJ", phone: "(732) 899-2500" },
  "Coty Marine": { name: "Coty Marine", loc: "Toms River, NJ", phone: "(732) 288-1000" },
  "D & R Boat World": { name: "D & R Boat World", loc: "Toms River, NJ", phone: "(732) 840-2020" },
  "Formula Boats": { name: "Formula Boats", loc: "Decatur, IN", phone: "(260) 724-9111" },
  "G. Winter's Sailing Center Inc.": { name: "G Winter's Sailing Center", loc: "Riverside, NJ", phone: "(856) 461-3555" },
  "Irwin": { name: "Irwin Marine", loc: "NJ", phone: "" },
  "MarineMax": { name: "MarineMax", loc: "Brick / Somers Point / Ocean View, NJ", phone: "" },
  "New Jersey Outboards": { name: "New Jersey Outboards", loc: "Bayville, NJ", phone: "(732) 505-3002" },
  "Riptide": { name: "Riptide Marine", loc: "NJ", phone: "" },
  "Riverside Marina & Yacht Sales": { name: "Riverside Marina & Yacht Sales", loc: "Riverside, NJ", phone: "(856) 461-1077" },
  "Sandy Hook": { name: "Sandy Hook Yacht Sales", loc: "Sea Bright, NJ", phone: "(732) 530-5500" },
  "Schrader Yacht Sales Inc.": { name: "Schrader Yacht Sales", loc: "Point Pleasant, NJ", phone: "(732) 899-8010" },
  "Seaport Inlet Marina": { name: "Seaport Inlet Marina", loc: "Belmar, NJ", phone: "(732) 681-3303" },
  "Sheltered Cove Marina": { name: "Sheltered Cove Marina", loc: "Tuckerton, NJ", phone: "(609) 296-9400" },
  "South Jersey Yacht Sales": { name: "South Jersey Yacht Sales", loc: "Cape May, NJ", phone: "(609) 884-1600" },
  "Stone Harbor Marina": { name: "Stone Harbor Marina", loc: "Stone Harbor, NJ", phone: "(609) 368-1141" },
  "Total Marine": { name: "Total Marine", loc: "Little Egg Harbor, NJ", phone: "(609) 294-0480" },
  "Valhalla Boat Sales": { name: "Valhalla Boat Sales", loc: "New Gretna, NJ", phone: "(609) 296-2388" },
};

const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const cleanBrand = (b) => String(b).replace(/\s*-\s*\d+\s*$/, "").trim();
const cleanNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const warnings = [];
const warn = (msg) => {
  warnings.push(msg);
  console.log("WARNING: " + msg);
};

function parseRows() {
  // PowerShell 5.1's Out-File writes a UTF-8 BOM; strip it before parsing.
  const raw = JSON.parse(readFileSync(RAW, "utf8").replace(/^﻿/, ""));
  const sheet = raw["Models To Do"] ?? [];
  const boats = [];
  const waiting = {};
  const seenRows = new Set();
  let dealerKey = null;

  for (const row of sheet) {
    const c = (k) => (row["c" + k] ?? "").toString().trim();
    // Section header: a name in c1, no brand in c4, and not a status code.
    if (c(1) && !c(4) && !/^[PCX]$/i.test(c(1)) && row.r > 1) {
      dealerKey = c(1);
      continue;
    }
    if (!dealerKey || row.r === 1) continue;

    const brandRaw = c(4);
    let model = c(6);
    if (!brandRaw) continue;

    // "Waiting" rows: dealer committed the brand, models TBD.
    if (/^waiting$/i.test(model) || (!model && c(5) === "0")) {
      (waiting[dealerKey] ??= []).push(cleanBrand(brandRaw).replace(/\s+Boats?$/i, ""));
      continue;
    }
    if (!model || /no models? supplied/i.test(model)) continue;

    const status1 = c(1).toUpperCase();
    const status2 = c(2).toUpperCase();
    const notes = c(7);
    const linkCell = c(8);
    const brandLink = c(9).replace(/\?utm.*$/, "");
    if (status1 === "X" || status2 === "X" || c(5).toUpperCase() === "X" || /not selected/i.test(notes)) continue;

    // Sheltered Cove style: "Regal 36XO https://..." in the link cell.
    const urlMatch = linkCell.match(/https?:\/\/\S+/);
    const shared = /shared brand/i.test(linkCell) || /shared brand/i.test(notes);
    let sourceUrl = null;
    if (shared) sourceUrl = brandLink || null;
    else if (urlMatch) sourceUrl = urlMatch[0];
    else if (/not listed|not supplied/i.test(linkCell)) sourceUrl = brandLink || null;

    // A row with no selection signal at all is noise.
    if (!status1 && !status2 && !urlMatch) continue;

    // Excel floats: "288.0" -> "288", "35.0" -> "35".
    if (/^\d+(\.0+)?$/.test(model)) model = String(parseInt(model, 10));

    // Anti-duplication guard #1: an identical dealer+brand+model row appearing
    // twice in the workbook (copy/paste slip) imports once, with a warning.
    const rowKey = (dealerKey + "|" + cleanBrand(brandRaw) + "|" + model).toLowerCase().replace(/\s+/g, " ");
    if (seenRows.has(rowKey)) {
      warn(`duplicate row skipped: ${cleanBrand(brandRaw)} ${model} appears twice under ${dealerKey}`);
      continue;
    }
    seenRows.add(rowKey);

    boats.push({
      dealerKey,
      brand: cleanBrand(brandRaw).replace(/\s+Boats?$/i, "").replace(/\s+Pontoons?$/i, " Pontoons").trim(),
      model,
      year: Math.round(cleanNum(c(3))) || null,
      priority: Math.round(cleanNum(c(5))) || 2,
      notes: /use .* logo/i.test(notes) ? "" : notes, // internal production notes stay off the site
      shared,
      sourceUrl,
      brandUrl: brandLink || null,
    });
  }
  return { boats, waiting };
}

function mergeShared(boats) {
  const out = [];
  const byKey = new Map();
  for (const b of boats) {
    const meta = DEALER_META[b.dealerKey] ?? { name: b.dealerKey, loc: "", phone: "" };
    const key = b.shared ? slugify(b.brand + "-" + b.model) : null;
    if (key && byKey.has(key)) {
      const prior = byKey.get(key);
      prior.dealers.push(meta);
      prior.notes = prior.notes || b.notes;
      prior.year = prior.year || b.year;
      prior.priority = Math.min(prior.priority, b.priority);
      continue;
    }
    const rec = {
      slug: "",
      brand: b.brand,
      model: b.model,
      year: b.year,
      priority: b.priority,
      notes: b.notes,
      shared: b.shared,
      sourceUrl: b.sourceUrl,
      brandUrl: b.brandUrl,
      dealers: [meta],
      photos: [],
      blurb: "",
      lengthFt: null,
    };
    if (key) byKey.set(key, rec);
    out.push(rec);
  }
  // Slugs: brand-model. When two UNMERGED boats share brand+model (two dealers
  // each bringing the same model as separate hulls), BOTH get a dealer suffix —
  // deterministic regardless of workbook row order, so URLs stay stable when
  // Giselle reorders sections. Also anti-duplication guard #2: flag those
  // pairs, since an unmarked shared-brand row would look exactly like this.
  const byBase = new Map();
  for (const r of out) {
    const base = slugify(r.brand + "-" + r.model);
    (byBase.get(base) ?? byBase.set(base, []).get(base)).push(r);
  }
  for (const [base, group] of byBase) {
    if (group.length === 1) {
      group[0].slug = base;
    } else {
      warn(
        `possible duplicate: ${group[0].brand} ${group[0].model} listed separately by ` +
          group.map((g) => g.dealers.map((d) => d.name).join("+")).join(" and ") +
          ` — if it's one shared display boat, mark the rows SHARED BRAND in the workbook to merge them`
      );
      for (const g of group) g.slug = slugify(base + "-" + g.dealers[0].name.split(" ")[0]);
    }
  }
  return out;
}

const absolutize = (src, base) => {
  try { return new URL(src, base).href; } catch { return null; }
};

function extractFromHtml(html, baseUrl) {
  const found = [];
  const metas = [...html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|og:image:url|twitter:image)["'][^>]+content=["']([^"']+)["']/gi)]
    .concat([...html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|og:image:url|twitter:image)["']/gi)]);
  for (const m of metas) found.push(m[1]);
  // common inventory/product gallery imgs
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+\.(?:jpe?g|png|webp)(?:\?[^"']*)?)["']/gi)) {
    const src = m[1];
    if (/logo|icon|sprite|placeholder|badge|flag|banner-ad|pixel/i.test(src)) continue;
    found.push(src);
  }
  const photos = [];
  const seen = new Set();
  for (const f of found) {
    const abs = absolutize(f.replace(/&amp;/g, "&"), baseUrl);
    if (!abs || seen.has(abs)) continue;
    seen.add(abs);
    photos.push(abs);
    if (photos.length >= 8) break;
  }
  const descM = html.match(/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)["']/i);
  const blurb = descM ? descM[1].replace(/&amp;/g, "&").replace(/&#0?39;|&rsquo;/g, "'").replace(/&quot;/g, '"').slice(0, 300) : "";
  const lenM = (html.match(/(\d{2}(?:\.\d)?)\s*(?:ft\b|')/i) || [])[1];
  return { photos, blurb, lengthFt: lenM ? Number(lenM) : null };
}

async function fetchWithTimeout(url, ms = 20000, asBuffer = false) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: asBuffer ? "image/*" : "text/html,*/*" }, signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) return null;
    return asBuffer ? Buffer.from(await res.arrayBuffer()) : await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const extFor = (url, buf) => {
  if (buf && buf.length > 3) {
    if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
    if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
    if (buf.slice(8, 12).toString() === "WEBP") return "webp";
  }
  const m = url.match(/\.(jpe?g|png|webp)(?:\?|$)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
};

async function enrich(boat) {
  // Strict cache-key match (slug-N.ext): keeps sibling slugs like
  // "sea-pro-245" from claiming "sea-pro-245-flxr-1.jpg".
  const mine = new RegExp("^" + boat.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-\\d+\\.(jpe?g|png|webp)$", "i");
  const existing = readdirSync(PHOTO_DIR).filter((f) => mine.test(f));
  if (existing.length > 0) {
    boat.photos = existing.sort().map((f) => "/boats/" + f);
    return "cached";
  }
  if (!boat.sourceUrl) return "no-source";
  const html = await fetchWithTimeout(boat.sourceUrl);
  if (!html) return "fetch-failed";
  const { photos, blurb, lengthFt } = extractFromHtml(html, boat.sourceUrl);
  boat.blurb = blurb;
  boat.lengthFt = lengthFt;
  let n = 0;
  for (const p of photos) {
    if (n >= 4) break;
    const buf = await fetchWithTimeout(p, 25000, true);
    if (!buf || buf.length < 12000 || buf.length > 8_000_000) continue; // skip icons + monsters
    const ext = extFor(p, buf);
    const name = `${boat.slug}-${n + 1}.${ext}`;
    writeFileSync(join(PHOTO_DIR, name), buf);
    boat.photos.push("/boats/" + name);
    n++;
    await new Promise((r) => setTimeout(r, 250));
  }
  return boat.photos.length > 0 ? "ok" : "no-photos";
}

async function main() {
  const { boats: rows, waiting } = parseRows();
  const boats = mergeShared(rows);
  console.log(`parsed ${boats.length} selected boats across ${new Set(boats.flatMap((b) => b.dealers.map((d) => d.name))).size} dealers`);

  // Orphan sweep: photos whose slug no longer exists in the workbook (boat
  // renamed/removed) are deleted so renames can't leave stale imagery behind.
  const live = boats.map((b) => new RegExp("^" + b.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-\\d+\\.(jpe?g|png|webp)$", "i"));
  let orphans = 0;
  for (const f of readdirSync(PHOTO_DIR)) {
    if (!live.some((re) => re.test(f))) {
      unlinkSync(join(PHOTO_DIR, f));
      orphans++;
    }
  }
  if (orphans > 0) warn(`${orphans} orphaned photo file(s) removed (boats renamed or dropped from the workbook)`);

  let i = 0;
  const stats = {};
  const queue = [...boats];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const b = queue.shift();
      const r = await enrich(b);
      stats[r] = (stats[r] || 0) + 1;
      i++;
      console.log(`[${i}/${boats.length}] ${r.padEnd(12)} ${b.brand} ${b.model} (${b.dealers[0].name})`);
    }
  });
  await Promise.all(workers);

  const waitingOut = Object.entries(waiting).map(([k, brands]) => ({
    dealer: (DEALER_META[k] ?? { name: k }).name,
    brands: [...new Set(brands)],
  }));

  boats.sort((a, b) => a.priority - b.priority || a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), boatCount: boats.length, boats, waiting: waitingOut, warnings }, null, 2));
  console.log("stats:", JSON.stringify(stats));
  console.log(warnings.length ? `WARNINGS (${warnings.length}) — see above; also recorded in show-boats.json` : "no duplicate/orphan warnings");
  console.log(`wrote ${OUT} with ${boats.length} boats; waiting dealers: ${waitingOut.length}`);
  if (boats.length < 30) {
    console.error("SANITY FAIL: fewer than 30 boats parsed");
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
