/**
 * Show-boat importer: turns the show's boat workbook into data/show-boats.json
 * + photos in public/boats/.
 *
 * Pipeline position: master-to-raw.mjs -> data/master-boats-raw.json -> this
 * script -> data/show-boats.json (consumed by lib/showboats.ts).
 *
 * SOURCE CHANGED 2026-08-30. This used to read Giselle's "2026 Feature Boats"
 * workbook via parse-feature-boats.ps1, which is a curated subset and published
 * 87 boats against a show of ~175. Giselle confirmed on 2026-08-26 that her
 * X/1/2 marks record eblast selection only and that every boat should be
 * listed, so the source is now the full master inventory. See
 * scripts/master-to-raw.mjs. The old parse-feature-boats.ps1 path and
 * data/feature-boats-raw.json are left in place but are no longer read.
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
import sharp from "sharp";

/** Max gallery photos stored per boat (page weight + repo size ceiling). */
const MAX_PHOTOS = 12;
/** --refresh: ignore the on-disk photo cache and re-harvest galleries. */
const REFRESH = process.argv.includes("--refresh");
/** --only=slug1,slug2: restrict --refresh to these boats (others stay cached). */
const ONLY = new Set((process.argv.find((a) => a.startsWith("--only="))?.slice(7) ?? "").split(",").filter(Boolean));
const refreshWanted = (slug) => REFRESH && (ONLY.size === 0 || ONLY.has(slug));

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "master-boats-raw.json");
const OUT = join(ROOT, "data", "show-boats.json");
const OVERRIDES_FILE = join(ROOT, "data", "boat-overrides.json");
const PHOTO_DIR = join(ROOT, "public", "boats");
mkdirSync(PHOTO_DIR, { recursive: true });

/** Previous run's text, carried forward for photo-cached boats. */
const PREV = new Map(
  existsSync(OUT)
    ? JSON.parse(readFileSync(OUT, "utf8")).boats.map((b) => [b.slug, { blurb: b.blurb, lengthFt: b.lengthFt, photoCredit: b.photoCredit }])
    : []
);
/** Per-boat source overrides (see data/boat-overrides.json). */
const OVERRIDES = existsSync(OVERRIDES_FILE)
  ? Object.fromEntries(Object.entries(JSON.parse(readFileSync(OVERRIDES_FILE, "utf8"))).filter(([k]) => !k.startsWith("_")))
  : {};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 ACVBS-showbot/1.0 (acvirtualboatshow.com; official show companion)";
/**
 * Some manufacturer sites (bostonwhaler.com among them) return 403 to anything
 * that names itself a bot, on the HTML and on the images. Used only for the
 * photoFallback path, where we are fetching a public product page whose own
 * dealer network is asking us to show these boats. The showbot UA above stays
 * the default everywhere else, because identifying ourselves is the better
 * default when a site will accept it.
 */
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

/**
 * Workbook section header -> site dealer identity (matches /vendors data).
 *
 * `phone` is what a shopper sees on the boat page, so where a dealer has named
 * a number for show enquiries that number wins over the switchboard. Those come
 * from the "TEXT NUMBER (Text the Dealer)" column of the inventory master,
 * which records who supplied each one and when. Dealers who have not named one
 * keep their main line.
 */
const DEALER_META = {
  // Supplied by Taylor Morelli, Marketing Manager, Aug 26 (was the main line, (732) 899-5559).
  "Clarks Landing Marina": { name: "Clarks Landing Yacht Sales & Marina", loc: "Point Pleasant, NJ", phone: "(732) 966-4902" },
  // Michael Bambara, Aug 25 (was the main line, (732) 458-3540).
  "Coastal Boat Sales": { name: "Coastal Boat Sales", loc: "Brick, NJ", phone: "(609) 713-5651" },
  // John Eskow, Aug 28 (was the switchboard, (732) 899-2500, which reaches him only on ext 202).
  "Comstock Yacht Sales & Marina": { name: "Comstock Yacht Sales & Marina", loc: "Brick, NJ", phone: "(732) 597-2676" },
  "Coty Marine": { name: "Coty Marine", loc: "Toms River, NJ", phone: "(732) 288-1000" },
  "D & R Boat World": { name: "D & R Boat World", loc: "Toms River, NJ", phone: "(732) 840-2020" },
  "Formula Boats": { name: "Formula Boats", loc: "Decatur, IN", phone: "(260) 724-9111" },
  "G. Winter's Sailing Center Inc.": { name: "G Winter's Sailing Center", loc: "Riverside, NJ", phone: "(856) 461-3555" },
  "Irwin": { name: "Irwin Marine Center", loc: "Red Bank, NJ", phone: "(732) 741-0003" },
  "MarineMax": { name: "MarineMax", loc: "Brick / Somers Point / Ocean View, NJ", phone: "(732) 451-3995" },
  "New Jersey Outboards": { name: "New Jersey Outboards", loc: "Bayville, NJ", phone: "(732) 505-3002" },
  "Riptide": { name: "Riptide Marine Center", loc: "Bayville, NJ", phone: "(732) 228-7202" },
  "Riverside Marina & Yacht Sales": { name: "Riverside Marina & Yacht Sales", loc: "Riverside, NJ", phone: "(856) 461-1077" },
  "Sandy Hook": { name: "Sandy Hook Yacht Sales", loc: "Sea Bright, NJ", phone: "(732) 530-5500" },
  "Schrader Yacht Sales Inc.": { name: "Schrader Yacht Sales", loc: "Point Pleasant, NJ", phone: "(732) 899-8010" },
  "Seaport Inlet Marina": { name: "Seaport Inlet Marina", loc: "Belmar, NJ", phone: "(732) 681-3303" },
  // Mark Hattman, President, Aug 22, his own text line (was the main line, (609) 296-9400).
  "Sheltered Cove Marina": { name: "Sheltered Cove Marina", loc: "Tuckerton, NJ", phone: "(609) 204-1742" },
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

/**
 * Length from the model designation, which is how this industry names boats:
 * a two-digit number is feet ("36XO" = 36), a three-digit number is feet plus
 * tenths ("320 CC" = 32.0, "Ultra 275 SE" = 27.5, "SVX 191 OB" = 19.1).
 *
 * This beats scraping the listing page, which produced lengths that argued
 * with the boat's own name: an Albemarle 45 read 58 ft and a Regal 36XO read
 * 29, because the old regex took the first two-digit number followed by ft or
 * an apostrophe ANYWHERE in the HTML, nav and inline scripts included.
 *
 * Deliberately conservative. Single digits are skipped because they are metric
 * ("Antares 9" is 9 metres, not 9 feet) and four-digit designations are skipped
 * because the convention splits feet and inches inconsistently. A null is the
 * right answer when we cannot tell; a wrong number beside the model name is not.
 */
function lengthFromModel(model) {
  for (const tok of String(model ?? "").match(/\d+/g) ?? []) {
    if (/^(19|20)\d\d$/.test(tok)) continue; // model year, not a length
    let ft = null;
    if (tok.length === 2) ft = Number(tok);
    else if (tok.length === 3) ft = Number(tok.slice(0, 2)) + Number(tok[2]) / 10;
    if (ft !== null && ft >= 15 && ft <= 120) return ft;
  }
  return null;
}

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
      lengthFt: lengthFromModel(b.model),
      /** Set when manufacturer photos were used to fill a thin gallery. */
      photoCredit: null,
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
  const junk = /logo|icon|sprite|placeholder|pixel|avatar|favicon|captcha|badge-|banner-ad/i;
  // 1) social meta images (usually the hero shot)
  const metas = [...html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|og:image:url|twitter:image)["'][^>]+content=["']([^"']+)["']/gi)]
    .concat([...html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|og:image:url|twitter:image)["']/gi)]);
  for (const m of metas) found.push(m[1]);
  // 2) every visible AND lazy-loaded gallery image attribute
  for (const m of html.matchAll(/(?:src|data-src|data-lazy|data-original|data-image|data-large_image|data-full|href)=["']([^"']+\.(?:jpe?g|png|webp)(?:\?[^"']*)?)["']/gi)) {
    if (!junk.test(m[1])) found.push(m[1]);
  }
  // 3) srcset variants: keep the largest candidate of each set
  for (const m of html.matchAll(/(?:srcset|data-srcset)=["']([^"']+)["']/gi)) {
    const parts = m[1].split(",").map((p) => p.trim().split(/\s+/)[0]).filter((u) => /\.(jpe?g|png|webp)/i.test(u));
    const last = parts[parts.length - 1];
    if (last && !junk.test(last)) found.push(last);
  }
  // 4) image URLs embedded in inline JSON (gallery configs, JSON-LD)
  for (const m of html.matchAll(/https?:\\?\/\\?\/[^"'\s\\]+\.(?:jpe?g|png|webp)(?:\?[^"'\s\\]*)?/gi)) {
    const u = m[0].replace(/\\\//g, "/");
    if (!junk.test(u)) found.push(u);
  }
  const photos = [];
  const seen = new Set();
  for (const f of found) {
    const abs = absolutize(f.replace(/&amp;/g, "&"), baseUrl);
    if (!abs) continue;
    // Dedupe size-variants of the same asset by path (except query-driven
    // thumbnailers like Thumb.aspx, where the query IS the identity).
    const key = /\.aspx/i.test(abs) ? abs : abs.split("?")[0].replace(/-\d{2,4}x\d{2,4}(?=\.\w+$)/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    photos.push(abs);
    if (photos.length >= 40) break;
  }
  // Description: take the LONGEST of og:description / meta description /
  // JSON-LD description (dealer platforms put the full writeup in JSON-LD).
  const descCands = [];
  for (const m of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:description|description|twitter:description)["'][^>]+content=["']([^"']+)["']/gi)) descCands.push(m[1]);
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const d of m[1].matchAll(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
      try { descCands.push(JSON.parse('"' + d[1] + '"')); } catch { /* malformed escape */ }
    }
  }
  const clean = (s) =>
    s.replace(/&amp;/g, "&").replace(/&#0?39;|&rsquo;|&#8217;/g, "'").replace(/&quot;|&#8220;|&#8221;/g, '"')
      .replace(/&lt;[^&]*&gt;|<[^>]+>/g, " ").replace(/\\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  const blurb = descCands.map(clean).filter((s) => s.length > 40 && !/^(home|inventory|boats for sale)\b/i.test(s)).sort((a, b) => b.length - a.length)[0]?.slice(0, 900) ?? "";
  // Fallback only, and only where the page labels the number. An unlabelled
  // match anywhere in the document is what produced the bad lengths before.
  const lenM = (html.match(/(?:length\s*(?:overall|over\s*all)?|\bLOA\b)\D{0,24}?(\d{2}(?:\.\d)?)\s*(?:ft\b|feet\b|')/i) || [])[1];
  const len = lenM ? Number(lenM) : null;
  return { photos, blurb, lengthFt: len !== null && len >= 15 && len <= 120 ? len : null };
}

async function fetchWithTimeout(url, ms = 20000, asBuffer = false, ua = UA) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { "User-Agent": ua, Accept: asBuffer ? "image/*" : "text/html,*/*" }, signal: ctrl.signal, redirect: "follow" });
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

/** Numeric sort so slug-10 follows slug-9, not slug-1. */
const byPhotoNum = (a, b) => (Number(a.match(/-(\d+)\.\w+$/)?.[1]) || 0) - (Number(b.match(/-(\d+)\.\w+$/)?.[1]) || 0);

async function enrich(boat) {
  // Strict cache-key match (slug-N.ext): keeps sibling slugs like
  // "sea-pro-245" from claiming "sea-pro-245-flxr-1.jpg".
  const mine = new RegExp("^" + boat.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-\\d+\\.(jpe?g|png|webp)$", "i");
  const existing = readdirSync(PHOTO_DIR).filter((f) => mine.test(f)).sort(byPhotoNum);
  if (existing.length > 0 && !refreshWanted(boat.slug)) {
    boat.photos = existing.map((f) => "/boats/" + f);
    // Photos are cached on disk, but text lives only in show-boats.json,
    // which this run rebuilds: carry the previous run's text forward, and
    // only hit the network when we have none yet.
    const prev = PREV.get(boat.slug);
    // The credit belongs to the photos, not the text, so it has to survive a
    // cached run too. Without this a re-import silently relabels manufacturer
    // photography as the dealer's, which is a claim we should not be making.
    if (prev?.photoCredit) boat.photoCredit = prev.photoCredit;
    if (prev?.blurb) {
      boat.blurb = prev.blurb;
      // prev can hold a value from the old bad scrape, so it is not trusted:
      // only the model designation or a labelled scrape sets a length now.
      boat.lengthFt = boat.lengthFt ?? null;
      return "cached";
    }
    if (boat.sourceUrl) {
      const html = await fetchWithTimeout(boat.sourceUrl);
      if (html) {
        const ex = extractFromHtml(html, boat.sourceUrl);
        boat.blurb = ex.blurb;
        boat.lengthFt = boat.lengthFt ?? ex.lengthFt;
        return "cached+text";
      }
    }
    return "cached";
  }
  const keepCached = () => {
    boat.photos = existing.map((f) => "/boats/" + f);
    return existing.length > 0 ? "kept-cached" : "no-photos";
  };
  if (!boat.sourceUrl) return existing.length ? keepCached() : "no-source";
  // Overridden boats may carry several candidate URLs; first that loads wins.
  const urls = boat.sourceUrls ?? [boat.sourceUrl];
  let html = null;
  let base = boat.sourceUrl;
  for (const u of urls) {
    html = await fetchWithTimeout(u);
    if (html) { base = u; break; }
  }
  if (!html) return keepCached(); // bot-gated page: keep what we have
  boat.sourceUrl = base;
  const { photos, blurb, lengthFt } = extractFromHtml(html, base);
  boat.blurb = blurb;
  boat.lengthFt = boat.lengthFt ?? lengthFt;

  // Cache-busting: new harvests continue numbering after the old set so
  // replaced galleries get URLs no browser or CDN has ever cached.
  const prevMax = existing.reduce((m, f) => Math.max(m, Number(f.match(/-(\d+)\.\w+$/)?.[1]) || 0), 0);
  const written = [];
  for (const p of photos) {
    if (written.length >= MAX_PHOTOS) break;
    const buf = await fetchWithTimeout(p, 25000, true);
    if (!buf || buf.length < 8000 || buf.length > 15_000_000) continue;
    try {
      // Normalize everything through sharp: cap 1280px wide, JPEG q80.
      // Also drops junk (banners, swatches) by minimum real dimensions.
      const img = sharp(buf);
      const meta = await img.metadata();
      if (!meta.width || meta.width < 500 || (meta.height ?? 0) < 300) continue;
      const out = await img.resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      const name = `${boat.slug}-${prevMax + written.length + 1}.jpg`;
      writeFileSync(join(PHOTO_DIR, name), out);
      written.push(name);
    } catch {
      continue; // undecodable buffer: skip
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (written.length === 0) return keepCached(); // harvest failed: keep old set
  // Remove superseded files for this slug (old extensions / higher numbers).
  for (const f of existing) {
    if (!written.includes(f)) {
      try { unlinkSync(join(PHOTO_DIR, f)); } catch { /* already gone */ }
    }
  }
  boat.photos = written.map((f) => "/boats/" + f);
  return "ok";
}

/**
 * Fill a thin gallery from the manufacturer's model page.
 *
 * Several dealer sites lazy-load their galleries, so a harvest returns one or
 * two images however well the page is written. Where the manufacturer publishes
 * a real model page, its photos are better than nothing.
 *
 * Two rules make this safe rather than harmful:
 *
 *  - A model TOKEN is required and the filename must contain it. Manufacturer
 *    pages carry hero images for their whole range, so an unfiltered harvest of
 *    worldcat.com/models/235te/ hands you 400 CC X and 325 CC photos and puts
 *    another boat on this boat's page. That is worse than a thin gallery.
 *  - Manufacturer shots go AFTER any real dealer photos, never in front, and
 *    the boat is flagged so the page can credit them honestly. They show the
 *    model, not the hull arriving at the show.
 */
/**
 * Keep the URLs whose FILENAME contains the token, deduped by size variant.
 * Matching on the filename and never the path matters: Grady-White keeps a 306
 * photo inside its /Freedom-235/ folder, so a path match imports the wrong boat.
 */
function filterByToken(urls, token) {
  const junk = /favicon|logo|icon|sprite|placeholder|badge|pixel|site-identity/i;
  const seen = new Set();
  const out = [];
  for (const raw of urls) {
    if (junk.test(raw)) continue;
    const key = raw.split("?")[0].replace(/-\d{2,4}x\d{2,4}(?=\.\w+$)/, "");
    const file = key.split("/").pop() ?? "";
    // Case-insensitive: these CDNs serve lowercased copies of filenames whose
    // originals are mixed case, so a literal match silently finds nothing.
    if (!file.toLowerCase().includes(token.toLowerCase())) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(raw);
  }
  return out;
}

/** Image URLs on a page whose FILENAME contains the token. */
function candidatesFrom(rawHtml, token) {
  if (!rawHtml) return [];
  // Bennington publishes its MY26 renders only inside an HTML-escaped JSON blob
  // in a data-* attribute, so the URLs arrive with escaped slashes and entity
  // encoded delimiters. Normalising first is what makes them matchable at all;
  // it is harmless on pages that put their images in plain img tags.
  const html = rawHtml
    .replace(/\\\//g, "/")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");

  const junk = /favicon|logo|icon|sprite|placeholder|badge|pixel|site-identity/i;
  const seen = new Set();
  const out = [];
  // The query string is part of the URL, not decoration: Grady-White serves its
  // CDN images through a signed ?s= parameter and drops the request without it.
  for (const m of html.matchAll(/https?:\/\/[^"'\s)<>\\]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s)<>\\]*)?/gi)) {
    const raw = m[0];
    if (junk.test(raw)) continue;
    // Same size-variant dedupe the main harvest uses.
    const key = raw.split("?")[0].replace(/-\d{2,4}x\d{2,4}(?=\.\w+$)/, "");
    const file = key.split("/").pop() ?? "";
    // Case-insensitive: these CDNs serve lowercased copies of filenames whose
    // originals are mixed case, so a literal match silently finds nothing.
    if (!file.toLowerCase().includes(token.toLowerCase())) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(raw);
  }
  return out;
}

/**
 * One shared headless browser for the pages a plain fetch cannot see.
 * Launched lazily, so an import that needs no rendering never pays for it.
 */
let _browser = null, _ctx = null;
async function browserContext() {
  if (_ctx) return _ctx;
  const { chromium } = await import("playwright");
  _browser = await chromium.launch();
  _ctx = await _browser.newContext({ userAgent: BROWSER_UA, viewport: { width: 1440, height: 900 } });
  return _ctx;
}
async function closeBrowser() {
  if (_browser) { await _browser.close().catch(() => {}); _browser = null; _ctx = null; }
}

/**
 * Absolute image URLs from a rendered page. Scrolls once so lazy galleries
 * populate.
 *
 * Reads the live DOM rather than the serialized HTML, for two reasons the
 * blocked manufacturers demonstrate between them. Boston Whaler writes its
 * gallery as root-relative /adobe/dynamicmedia/... paths, which a regex looking
 * for http(s) never sees, so URLs are resolved against the page. Chris-Craft
 * serves through Scene7, whose URLs carry no file extension at all
 * (.../calypso-32-header-carousel-1?ts=...), so requiring one finds nothing.
 * Taking whatever the img elements actually point at sidesteps both.
 */
async function renderAndDownload(url, token, limit) {
  try {
    const page = await (await browserContext()).newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2500);

      // Downloading happens INSIDE the page. Boston Whaler's CDN answers 403 to
      // Playwright's request context even with a Referer, but 200 to the page's
      // own fetch, which is the session that already painted these images.
      const got = await page.evaluate(async ({ token, limit }) => {
        const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
        const urls = new Set();
        for (const img of document.querySelectorAll("img")) {
          for (const v of [img.currentSrc, img.getAttribute("src"), img.getAttribute("data-src")]) {
            const a = v && abs(v); if (a) urls.add(a);
          }
          const ss = img.getAttribute("srcset");
          if (ss) for (const part of ss.split(",")) {
            const a = abs(part.trim().split(/\s+/)[0] ?? ""); if (a) urls.add(a);
          }
        }
        for (const el of document.querySelectorAll("*")) {
          const bg = getComputedStyle(el).backgroundImage;
          if (bg && bg !== "none") for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
            const a = abs(m[1]); if (a) urls.add(a);
          }
        }

        const junk = /favicon|logo|icon|sprite|placeholder|badge|pixel|site-identity/i;
        const seen = new Set();
        const picked = [];
        for (const u of urls) {
          if (junk.test(u)) continue;
          const key = u.split("?")[0].replace(/-\d{2,4}x\d{2,4}(?=\.\w+$)/, "");
          const file = key.split("/").pop() ?? "";
          if (!file.toLowerCase().includes(token.toLowerCase())) continue;
          if (seen.has(key)) continue;
          seen.add(key);
          picked.push(u);
          if (picked.length >= limit) break;
        }

        const out = [];
        for (const u of picked) {
          try {
            const r = await fetch(u);
            if (!r.ok) continue;
            const buf = new Uint8Array(await r.arrayBuffer());
            if (buf.byteLength < 8000 || buf.byteLength > 15_000_000) continue;
            let s = "";
            for (let i = 0; i < buf.length; i += 8192) s += String.fromCharCode(...buf.subarray(i, i + 8192));
            out.push({ url: u, b64: btoa(s) });
          } catch { /* skip this image */ }
        }
        return out;
      }, { token, limit });

      return got.map((g) => ({ url: g.url, buf: Buffer.from(g.b64, "base64") }));
    } finally {
      await page.close().catch(() => {});
    }
  } catch {
    return null;
  }
}

async function topUpFromManufacturer(boat) {
  const o = OVERRIDES[boat.slug];
  const fb = o?.photoFallback;
  if (!fb?.url || !fb?.token) return null;
  // PINNED (Jon, 2026-08-30): a boat that already has photos is never touched
  // again, however few it has. This used to top up any gallery under four,
  // which meant a routine re-import to add new boats could silently change
  // boats already live and already shown to their dealers. Five Bennington
  // pontoons sit at one or two photos and are exactly the case this protects.
  // Only a boat with nothing at all gets filled.
  if (boat.photos.length > 0) return null;

  // Fast path first: Grady-White and Sea Hunt answer a plain fetch, and this
  // skips a browser launch for them.
  let candidates = candidatesFrom(await fetchWithTimeout(fb.url, 20000, false, BROWSER_UA), fb.token);
  /** url -> bytes, when the images had to be pulled from inside a rendered page. */
  let prefetched = null;

  // Bennington, Hurricane and Boston Whaler return 403 to any server-side fetch
  // whatever User-Agent it sends, and Chris-Craft builds its gallery in
  // JavaScript, so the served HTML carries a single promo tile. A real browser
  // is the only way to see those pages. None of the four disallow these paths
  // in robots.txt; this renders a public product page the way a visitor would.
  if (!candidates.length) {
    const got = await renderAndDownload(fb.url, fb.token, MAX_PHOTOS);
    if (got?.length) {
      prefetched = new Map(got.map((g) => [g.url, g.buf]));
      candidates = got.map((g) => g.url);
    }
  }
  if (!candidates.length) return null;

  const mine = new RegExp("^" + boat.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-\\d+\\.(jpe?g|png|webp)$", "i");
  const existing = readdirSync(PHOTO_DIR).filter((f) => mine.test(f));
  let next = existing.reduce((m, f) => Math.max(m, Number(f.match(/-(\d+)\.\w+$/)?.[1]) || 0), 0);

  const added = [];
  for (const p of candidates) {
    if (boat.photos.length + added.length >= MAX_PHOTOS) break;
    const buf = prefetched ? prefetched.get(p) : await fetchWithTimeout(p, 25000, true, BROWSER_UA);
    if (!buf || buf.length < 8000 || buf.length > 15_000_000) continue;
    try {
      const img = sharp(buf);
      const meta = await img.metadata();
      if (!meta.width || meta.width < 500 || (meta.height ?? 0) < 300) continue;
      const out = await img.resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      const name = `${boat.slug}-${++next}.jpg`;
      writeFileSync(join(PHOTO_DIR, name), out);
      added.push("/boats/" + name);
    } catch {
      continue;
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!added.length) return null;
  boat.photos = [...boat.photos, ...added];
  boat.photoCredit = fb.credit ?? boat.brand;
  return added.length;
}

async function main() {
  const { boats: rows, waiting } = parseRows();
  const parsed = mergeShared(rows);

  // Boats the dealer has confirmed are NOT coming. Dropping them here keeps
  // them out of the JSON, the sitemap and every listing in one move, and the
  // exclusion survives the daily sync because it lives in boat-overrides.json
  // rather than in the generated file. Note the orphan sweep below still runs
  // against `parsed`, so an excluded boat keeps its photos on disk and deleting
  // its override entry is enough to bring it back.
  const boats = parsed.filter((b) => !OVERRIDES[b.slug]?.exclude);
  for (const b of parsed) {
    const o = OVERRIDES[b.slug];
    if (o?.exclude) warn(`excluded, not at show: ${b.slug} (${o.excludeReason ?? "no reason recorded"})`);
  }

  for (const b of boats) {
    const o = OVERRIDES[b.slug];
    if (o) {
      if (o.official !== undefined) b.official = !!o.official;
      if (o.sourceUrls?.length) {
        b.sourceUrls = o.sourceUrls;
        b.sourceUrl = o.sourceUrls[0];
      }
    }
  }
  console.log(`parsed ${boats.length} selected boats across ${new Set(boats.flatMap((b) => b.dealers.map((d) => d.name))).size} dealers (${Object.keys(OVERRIDES).length} source overrides)`);

  // Orphan sweep: photos whose slug no longer exists in the workbook (boat
  // renamed/removed) are deleted so renames can't leave stale imagery behind.
  const live = parsed.map((b) => new RegExp("^" + b.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-\\d+\\.(jpe?g|png|webp)$", "i"));
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

  // Top up thin galleries from the manufacturer, one at a time: these are
  // courtesy fetches against sites that did not ask for our traffic.
  for (const b of boats) {
    const n = await topUpFromManufacturer(b);
    if (n) console.log(`topped up    ${b.brand} ${b.model} +${n} from ${b.photoCredit}`);
  }
  await closeBrowser();

  // Backstop for the credit. A boat configured with a photoFallback has no
  // dealer imagery to find (that is the whole reason it has one), so a gallery
  // on such a boat is manufacturer photography and must say so. This repairs
  // any run where the credit was set on an earlier pass and the photos then
  // came back from the disk cache, which would otherwise present the
  // manufacturer's shots as the dealer's own.
  for (const b of boats) {
    const fb = OVERRIDES[b.slug]?.photoFallback;
    if (fb?.credit && b.photos.length && !b.photoCredit) b.photoCredit = fb.credit;
  }

  // Manual description overrides win over whatever the page served.
  for (const b of boats) {
    const o = OVERRIDES[b.slug];
    if (o?.blurb) b.blurb = o.blurb;

    // Dealer and manufacturer pages do not lead with their best shot: some
    // open on a deck schematic, a trailer close-up, or a dark studio render,
    // and that image becomes the card and the hero. primaryPhoto promotes a
    // different one to the front by its file number.
    //
    // An override rather than renaming files on disk, because --refresh
    // renumbers a gallery from scratch and would silently undo a rename.
    if (o?.primaryPhoto) {
      const want = `-${o.primaryPhoto}.`;
      const i = b.photos.findIndex((p) => p.includes(want));
      if (i > 0) b.photos.unshift(b.photos.splice(i, 1)[0]);
      else if (i === -1) warn(`primaryPhoto ${o.primaryPhoto} not found for ${b.slug}; leaving order alone`);
    }
  }

  // House style for all outward-facing text (Jon 2026-08-25): no em dashes.
  // Single choke point covering EVERY string that can reach the site from
  // this pipeline, present and future boats alike: harvested/carried/override
  // descriptions, workbook dealer notes (card badges), names, and the
  // waiting-dealer strips. Also finishes entity cleanup harvests leave behind.
  const noEmDash = (s) =>
    String(s)
      .replace(/&hellip;|…/g, "...")
      .replace(/\s+—\s+/g, ", ")
      .replace(/—/g, "-")
      .trim();
  for (const b of boats) {
    if (b.blurb) b.blurb = noEmDash(b.blurb);
    if (b.notes) b.notes = noEmDash(b.notes);
    b.brand = noEmDash(b.brand);
    b.model = noEmDash(b.model);
  }
  for (const [k, brands] of Object.entries(waiting)) waiting[k] = brands.map(noEmDash);

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
