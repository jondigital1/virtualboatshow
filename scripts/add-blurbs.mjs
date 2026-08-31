/**
 * Writes reviewed per-boat descriptions into data/boat-overrides.json.
 *
 * Why an override rather than editing show-boats.json: the importer carries a
 * boat's blurb forward from the previous run whenever its photos are cached, so
 * text written straight into the generated file is only ever as durable as the
 * next sync. An override is applied after that carry-forward, so it wins every
 * time and survives re-imports.
 *
 * Usage: node scripts/add-blurbs.mjs <accepted.json>
 *   accepted.json = [{ slug, blurb, sourceUrl? }, ...]
 *
 * Re-runnable: an existing entry for a slug has its blurb replaced, and any
 * other keys on that slug (photoFallback, official, exclude) are preserved.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OVERRIDES = join(ROOT, "data", "boat-overrides.json");
const BOATS = join(ROOT, "data", "show-boats.json");

const input = process.argv[2];
if (!input) { console.error("usage: node scripts/add-blurbs.mjs <accepted.json>"); process.exit(1); }

const accepted = JSON.parse(readFileSync(input, "utf8"));
const overrides = JSON.parse(readFileSync(OVERRIDES, "utf8"));
const boats = JSON.parse(readFileSync(BOATS, "utf8")).boats;
const bySlug = new Map(boats.map((b) => [b.slug, b]));

let written = 0;
const rejected = [];

for (const e of accepted) {
  const { slug, blurb } = e;
  const boat = bySlug.get(slug);

  // Every check here is a bug this project actually shipped once.
  if (!boat) { rejected.push(`${slug}: no such boat`); continue; }
  if (!blurb || typeof blurb !== "string") { rejected.push(`${slug}: empty blurb`); continue; }
  const text = blurb.replace(/\s+/g, " ").trim();
  if (text.length < 180 || text.length > 420) { rejected.push(`${slug}: ${text.length} chars, outside 180-420`); continue; }
  if (/—/.test(text)) { rejected.push(`${slug}: contains an em dash (house style)`); continue; }
  if (/^introducing\b/i.test(text)) { rejected.push(`${slug}: starts with "Introducing"`); continue; }

  // The whole point: the copy must name this boat and not a sibling.
  const mine = (String(boat.model).match(/\d{3,4}/g) ?? []);
  if (mine.length && !mine.some((d) => text.includes(d))) {
    rejected.push(`${slug}: blurb never names "${boat.model}"`); continue;
  }

  overrides[slug] = { ...(overrides[slug] ?? {}), blurb: text };
  written++;
}

const { _comment, _readme, ...rest } = overrides;
const head = {};
if (_comment) head._comment = _comment;
if (_readme) head._readme = _readme;
const sorted = { ...head, ...Object.fromEntries(Object.entries(rest).sort(([a], [b]) => a.localeCompare(b))) };
writeFileSync(OVERRIDES, JSON.stringify(sorted, null, 2) + "\n");

console.log(`blurb overrides written: ${written}`);
console.log(`boat-overrides.json entries: ${Object.keys(rest).length}`);
if (rejected.length) {
  console.log(`\nrejected ${rejected.length}:`);
  for (const r of rejected) console.log("  - " + r);
}
