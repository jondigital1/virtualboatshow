/**
 * Wires accepted manufacturer photo sources into data/boat-overrides.json.
 *
 * Boats whose dealer listing exposes no usable imagery fall back to the
 * manufacturer's own model page. import-show-boats.mjs then tops the gallery
 * up via photoFallback and credits the manufacturer on the page, so the
 * provenance is stated rather than implied.
 *
 * The token is the safety rail, not a detail: a manufacturer page carries hero
 * shots for the whole range, so an untokened harvest puts a different boat on
 * this boat's page. Every entry must name a token that appears in the target
 * model's filenames and in no other model's.
 *
 * Usage: node scripts/add-photo-fallbacks.mjs <accepted.json>
 *   accepted.json = [{ slug, url, token, credit }, ...]
 * Re-runnable: an existing entry for a slug is updated, never duplicated, and
 * any other override keys already on that slug are preserved.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OVERRIDES = join(ROOT, "data", "boat-overrides.json");
const BOATS = join(ROOT, "data", "show-boats.json");

const input = process.argv[2];
if (!input) {
  console.error("usage: node scripts/add-photo-fallbacks.mjs <accepted.json>");
  process.exit(1);
}

const accepted = JSON.parse(readFileSync(input, "utf8"));
const overrides = JSON.parse(readFileSync(OVERRIDES, "utf8"));
const boats = JSON.parse(readFileSync(BOATS, "utf8")).boats;
const bySlug = new Map(boats.map((b) => [b.slug, b]));

let added = 0, updated = 0;
const problems = [];

for (const e of accepted) {
  const { slug, url, token, credit } = e;
  if (!slug || !url || !token || !credit) { problems.push(`incomplete entry: ${JSON.stringify(e)}`); continue; }

  const boat = bySlug.get(slug);
  if (!boat) { problems.push(`no such boat: ${slug}`); continue; }
  if (boat.photos.length) { problems.push(`${slug} already has ${boat.photos.length} photos; skipped`); continue; }

  // A token that does not appear in the model designation is the classic way a
  // different boat's photos land here, so make the mismatch visible.
  const designation = `${boat.brand} ${boat.model}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  const t = token.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (t && !designation.includes(t)) problems.push(`REVIEW ${slug}: token "${token}" is not part of "${boat.brand} ${boat.model}"`);

  const prior = overrides[slug];
  overrides[slug] = { ...(prior ?? {}), photoFallback: { url, token, credit } };
  prior ? updated++ : added++;
}

// Keep _comment first so the file still explains itself when opened.
const { _comment, ...rest } = overrides;
const sorted = { _comment, ...Object.fromEntries(Object.entries(rest).sort(([a], [b]) => a.localeCompare(b))) };
writeFileSync(OVERRIDES, JSON.stringify(sorted, null, 2) + "\n");

console.log(`photoFallback entries: ${added} added, ${updated} updated`);
console.log(`boat-overrides.json now has ${Object.keys(rest).length} boat entries`);
if (problems.length) {
  console.log(`\n${problems.length} thing(s) to look at:`);
  for (const p of problems) console.log("  - " + p);
}
