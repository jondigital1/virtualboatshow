/**
 * Promotes a better hero image for boats whose lead photo is poor.
 *
 * Writes primaryPhoto into data/boat-overrides.json, which import-show-boats.mjs
 * applies after the gallery is assembled. An override rather than renaming files
 * on disk, because --refresh renumbers a gallery from scratch and would silently
 * undo a rename.
 *
 * primaryPhoto is the file NUMBER, the N in "<slug>-N.jpg", not an array index.
 *
 * Usage: node scripts/add-primary-photos.mjs <accepted.json>
 *   accepted.json = [{ slug, recommend, reason? }, ...]   recommend 0 = leave alone
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OVERRIDES = join(ROOT, "data", "boat-overrides.json");
const BOATS = join(ROOT, "data", "show-boats.json");

const input = process.argv[2];
if (!input) { console.error("usage: node scripts/add-primary-photos.mjs <accepted.json>"); process.exit(1); }

const accepted = JSON.parse(readFileSync(input, "utf8"));
const overrides = JSON.parse(readFileSync(OVERRIDES, "utf8"));
const boats = JSON.parse(readFileSync(BOATS, "utf8")).boats;
const bySlug = new Map(boats.map((b) => [b.slug, b]));

const numOf = (p) => Number(p.match(/-(\d+)\.\w+$/)?.[1] ?? 0);

let written = 0, skipped = 0;
const problems = [];

for (const e of accepted) {
  const { slug, recommend } = e;
  if (!recommend || recommend <= 0) { skipped++; continue; }

  const boat = bySlug.get(slug);
  if (!boat) { problems.push(`${slug}: no such boat`); continue; }

  const nums = boat.photos.map(numOf);
  // The recommendation must name a file this boat actually has, or the importer
  // warns and silently leaves the bad lead in place.
  if (!nums.includes(recommend)) {
    problems.push(`${slug}: photo ${recommend} does not exist (has ${nums.join(",")})`);
    continue;
  }
  if (numOf(boat.photos[0]) === recommend) {
    problems.push(`${slug}: photo ${recommend} is already the lead, no-op`);
    continue;
  }

  overrides[slug] = { ...(overrides[slug] ?? {}), primaryPhoto: recommend };
  written++;
}

const { _comment, _readme, ...rest } = overrides;
const head = {};
if (_comment) head._comment = _comment;
if (_readme) head._readme = _readme;
writeFileSync(OVERRIDES, JSON.stringify({ ...head, ...Object.fromEntries(Object.entries(rest).sort(([a], [b]) => a.localeCompare(b))) }, null, 2) + "\n");

console.log(`primaryPhoto overrides written: ${written}`);
console.log(`left as-is (recommend 0): ${skipped}`);
if (problems.length) {
  console.log(`\n${problems.length} not applied:`);
  for (const p of problems) console.log("  - " + p);
}
