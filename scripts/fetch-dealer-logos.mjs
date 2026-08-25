/**
 * Crawl presenting-dealer websites and harvest their logos into
 * public/dealers/<slug>.png (max 400px wide, alpha preserved).
 * Candidates per site, in order: header/img "logo" matches, SVG logo links,
 * apple-touch-icon, og:image. First candidate that decodes at >=64px wide wins.
 * Bot-gated sites report fetch-failed; rescue those via the browser session.
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "dealers");
mkdirSync(OUT, { recursive: true });

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 ACVBS-showbot/1.0 (acvirtualboatshow.com)";

const DEALERS = [
  { slug: "causeway-marine", url: "https://www.causewaymarine.com/" },
  { slug: "clarks-landing", url: "https://www.clarkslanding.com/" },
  { slug: "coastal-boat-sales", url: "https://www.coastalboatsalesnj.com/" },
  { slug: "comstock", url: "https://www.comstockyachtsales.com/" },
  { slug: "coty-marine", url: "https://www.cotymarine.com/" },
  { slug: "dr-boat-world", url: "https://www.dnrboatworld.com/" },
  { slug: "ez-dock", url: "https://ez-docks.com/" },
  { slug: "formula-boats", url: "https://www.formulaboats.com/" },
  { slug: "g-winters", url: "https://www.winterssailing.com/" },
  { slug: "henriques", url: "https://www.henriquesyachts.com/" },
  { slug: "marinemax", url: "https://www.marinemax.com/" },
  { slug: "nj-outboards", url: "https://www.njoutboards.com/" },
  { slug: "riverside-marina", url: "https://www.riversideys.com/" },
  { slug: "riverside-marina", url: "https://www.riversidemarinanj.com/" },
  { slug: "sandy-hook", url: "https://sandyhookyachts.com/" },
  { slug: "schrader", url: "https://www.schraderyachts.net/" },
  { slug: "seaport-inlet", url: "https://www.seaportinletmarina.com/" },
  { slug: "sheltered-cove", url: "https://shelteredcovemarina.com/" },
  { slug: "stone-harbor", url: "https://www.stoneharbormarina.com/" },
  { slug: "south-jersey", url: "https://southjerseyyachtsales.com/" },
  { slug: "valhalla", url: "https://www.valhallayachtsales.com/" },
];

async function get(url, asBuffer = false, ms = 25000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: asBuffer ? "image/*,*/*" : "text/html,*/*" }, signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) return null;
    return asBuffer ? Buffer.from(await res.arrayBuffer()) : await res.text();
  } catch { return null; } finally { clearTimeout(t); }
}

const abs = (u, base) => { try { return new URL(u.replace(/&amp;/g, "&"), base).href; } catch { return null; } };

function candidates(html, base) {
  const out = [];
  // imgs whose src/class/alt/id mention logo (header logos overwhelmingly do)
  for (const m of html.matchAll(/<img[^>]+>/gi)) {
    const tag = m[0];
    if (!/logo/i.test(tag)) continue;
    const src = tag.match(/(?:data-src|src)=["']([^"']+)["']/i)?.[1];
    if (src && !/favicon|sprite/i.test(src)) out.push(abs(src, base));
  }
  // inline <a class=logo><svg>? skip; svg file links:
  for (const m of html.matchAll(/(?:href|src|content)=["']([^"']*logo[^"']*\.(?:svg|png|webp|jpe?g)(?:\?[^"']*)?)["']/gi)) {
    out.push(abs(m[1], base));
  }
  const apple = html.match(/<link[^>]+apple-touch-icon[^>]+href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+apple-touch-icon/i)?.[1];
  if (apple) out.push(abs(apple, base));
  const og = html.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
  if (og) out.push(abs(og, base));
  return [...new Set(out.filter(Boolean))];
}

const done = new Set();
const report = [];
for (const d of DEALERS) {
  if (done.has(d.slug)) continue;
  const html = await get(d.url);
  if (!html) { report.push(`${d.slug}: PAGE-FAIL ${d.url}`); continue; }
  const cands = candidates(html, d.url);
  let saved = false;
  for (const c of cands.slice(0, 8)) {
    const buf = await get(c, true);
    if (!buf || buf.length < 400) continue;
    try {
      let img = sharp(buf, { density: 150 }); // density helps svg rasterize crisply
      const meta = await img.metadata();
      if ((meta.width ?? 0) < 64) continue;
      await img.resize({ width: Math.min(400, meta.width), withoutEnlargement: true }).png().toFile(join(OUT, d.slug + ".png"));
      report.push(`${d.slug}: OK <- ${c}`);
      saved = true;
      done.add(d.slug);
      break;
    } catch { continue; }
  }
  if (!saved) report.push(`${d.slug}: NO-LOGO (candidates: ${cands.length}) ${d.url}`);
  await new Promise((r) => setTimeout(r, 250));
}
console.log(report.join("\n"));
