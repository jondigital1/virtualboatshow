/**
 * Diagnostic for photoFallback entries that produced no photos.
 *
 * Replays exactly what topUpFromManufacturer does (same UA, same unescaping,
 * same URL regex, same case-insensitive filename token match) and reports the
 * first step that fails, so a dead entry can be told apart from a blocked site
 * and from a token that simply matches nothing.
 *
 * Read-only: fetches pages, writes nothing.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OVERRIDES = JSON.parse(readFileSync(join(ROOT, "data", "boat-overrides.json"), "utf8"));
const BOATS = JSON.parse(readFileSync(join(ROOT, "data", "show-boats.json"), "utf8")).boats;

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const junk = /favicon|logo|icon|sprite|placeholder|badge|pixel|site-identity/i;

const empty = new Set(BOATS.filter((b) => !b.photos.length).map((b) => b.slug));
const targets = Object.entries(OVERRIDES)
  .filter(([slug, v]) => v?.photoFallback && empty.has(slug));

console.log(`${targets.length} photoFallback entries on boats that still have no photos\n`);

for (const [slug, ov] of targets) {
  const { url, token } = ov.photoFallback;
  process.stdout.write(`${slug}\n  token "${token}"\n  ${url}\n`);

  let res;
  try {
    res = await fetch(url, { headers: { "User-Agent": BROWSER_UA, Accept: "text/html,*/*" }, redirect: "follow" });
  } catch (e) {
    console.log(`  FETCH THREW: ${e.message}\n`);
    continue;
  }
  if (!res.ok) { console.log(`  HTTP ${res.status} ${res.statusText} -> page blocked or moved\n`); continue; }

  const raw = await res.text();
  const html = raw.replace(/\\\//g, "/").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, "&");

  const all = [...html.matchAll(/https?:\/\/[^"'\s)<>\\]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s)<>\\]*)?/gi)].map((m) => m[0]);
  const clean = all.filter((u) => !junk.test(u));
  const files = clean.map((u) => (u.split("?")[0].split("/").pop() ?? ""));
  const hits = files.filter((f) => f.toLowerCase().includes(token.toLowerCase()));

  console.log(`  HTTP ${res.status}, ${raw.length} bytes -> ${all.length} image urls, ${clean.length} after junk filter, ${hits.length} match the token`);
  if (hits.length) {
    console.log(`  MATCHES: ${[...new Set(hits)].slice(0, 4).join(", ")}`);
  } else {
    // Show what IS there, so a wrong token is obvious at a glance.
    const sample = [...new Set(files)].filter(Boolean).slice(0, 8);
    console.log(`  no match. filenames present: ${sample.join(", ") || "(none - page has no plain image urls)"}`);
    const loose = token.replace(/[^a-z0-9]/gi, "").toLowerCase();
    const near = [...new Set(files)].filter((f) => f.replace(/[^a-z0-9]/gi, "").toLowerCase().includes(loose)).slice(0, 4);
    if (near.length) console.log(`  NEAR MISS (token matches ignoring separators): ${near.join(", ")}`);
  }
  console.log("");
}
