/**
 * Cross-checks the two boat sources against each other.
 *
 * Why this exists: on 2026-08-25 the daily sync reported success while
 * shipping stale data. The workbook had changed, but a cached intermediate
 * file meant the importer never saw it, and nothing in the pipeline noticed.
 * One source cannot check itself.
 *
 * So: the .xlsm workbook remains the PUBLISHING source, and the "2026 Boats
 * for Jon" Google Sheet is the BACKSTOP. This script compares what actually
 * shipped (data/show-boats.json) against the Sheet and reports every
 * disagreement.
 *
 * It deliberately does NOT fail the pipeline. The Sheet lags the workbook
 * routinely, and letting a stale backstop block a real update would be worse
 * than the problem it guards against. It reports; a human decides.
 *
 * Usage:
 *   powershell -File scripts/parse-boats-sheet.ps1 > sheet.json
 *   node scripts/compare-sources.mjs sheet.json
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Sheet tab -> dealer name as it appears in show-boats.json. Explicit rather
 * than fuzzy: an unrecognised tab should be reported as unrecognised, not
 * quietly matched to the closest-looking dealer.
 */
const TAB_TO_DEALER = {
  "Clarks Landing": "Clarks Landing Yacht Sales & Marina",
  "Coastal": "Coastal Boat Sales",
  "Comstock": "Comstock Yacht Sales & Marina",
  "Coty": "Coty Marine",
  "D&R": "D & R Boat World",
  "Formula": "Formula Boats",
  "G Winter": "G Winter's Sailing Center",
  "Irwin": "Irwin Marine Center",
  "MarineMax": "MarineMax",
  "NJ Outboards": "New Jersey Outboards",
  "Riptide": "Riptide Marine Center",
  "Riverside": "Riverside Marina & Yacht Sales",
  "Sandy Hook": "Sandy Hook Yacht Sales",
  "Seaport": "Seaport Inlet Marina",
  "Schrader": "Schrader Yacht Sales",
  "Sheltered Cove": "Sheltered Cove Marina",
  "SJ Yachts": "South Jersey Yacht Sales",
  "Stone Harbor": "Stone Harbor Marina",
  "Total Marine": "Total Marine",
  "Valhalla": "Valhalla Boat Sales",
};

/** Sentinels the Sheet uses in the link column. */
const isCut = (link) => link.trim().toUpperCase() === "X";
const noModel = (model) => !model || /no models? supplied/i.test(model);

/**
 * Brand spellings drift between the sources ("Hurricane Deck" in one,
 * "Hurricane Deck Boats" in the other), so generic trailing words are stripped
 * before comparing.
 *
 * Trailing only, and repeatedly. An earlier version stripped anywhere in the
 * string, so "Hurricane Deck Boats" collapsed to "hurricane" while "Hurricane
 * Deck" stayed "hurricanedeck", and one boat was reported as both missing and
 * extra. Both sides get identical treatment here, so over-stripping is
 * harmless as long as it is consistent.
 */
const GENERIC_TAIL = /\s*\b(boats?|pontoons?|yachts?|inflatables?|marine|deck)\b\s*$/i;
const norm = (s) => {
  let t = String(s ?? "").trim();
  while (GENERIC_TAIL.test(t)) t = t.replace(GENERIC_TAIL, "");
  return t.toLowerCase().replace(/[^a-z0-9]/g, "");
};
const key = (brand, model) => `${norm(brand)}|${norm(model)}`;

const sheetPath = process.argv[2];
if (!sheetPath) {
  console.error("usage: node scripts/compare-sources.mjs <sheet.json>");
  process.exit(2);
}

const sheet = JSON.parse(readFileSync(sheetPath, "utf8").replace(/^﻿/, ""));
const site = JSON.parse(readFileSync(join(ROOT, "data", "show-boats.json"), "utf8"));

// Published boats, grouped by dealer. A shared-brand boat is credited to more
// than one dealer, so it legitimately appears under each.
const published = new Map();
for (const b of site.boats) {
  for (const d of b.dealers) {
    if (!published.has(d.name)) published.set(d.name, []);
    published.get(d.name).push(b);
  }
}

/**
 * Every published boat by brand+model, ignoring dealer. A SHARED BRAND boat
 * appears on two dealers' tabs in the Sheet but publishes once, credited to
 * whichever dealer the importer merged it under. Without this index it looks
 * absent from the other dealer every single day, and a report that cries wolf
 * daily is a report nobody reads.
 */
const publishedAnywhere = new Set(site.boats.map((b) => key(b.brand, b.model)));
let sharedElsewhere = 0;

const unknownTabs = [];
const rows = [];
let sheetSelected = 0;

for (const [tab, entries] of Object.entries(sheet)) {
  const dealer = TAB_TO_DEALER[tab];
  if (!dealer) {
    unknownTabs.push(tab);
    continue;
  }

  const selected = (entries ?? []).filter((e) => e.brand && !noModel(e.model) && !isCut(e.link));
  sheetSelected += selected.length;

  const live = published.get(dealer) ?? [];
  const liveKeys = new Map(live.map((b) => [key(b.brand, b.model), b]));
  const sheetKeys = new Map(selected.map((e) => [key(e.brand, e.model), e]));

  const onlySheet = selected.filter((e) => {
    const k = key(e.brand, e.model);
    if (liveKeys.has(k)) return false;
    if (publishedAnywhere.has(k)) { sharedElsewhere++; return false; }
    return true;
  });
  const onlySite = live.filter((b) => !sheetKeys.has(key(b.brand, b.model)));

  if (onlySheet.length || onlySite.length) {
    rows.push({ tab, dealer, live: live.length, sheet: selected.length, onlySheet, onlySite });
  }
}

const seenTabs = new Set(Object.keys(sheet));
const missingTabs = Object.keys(TAB_TO_DEALER).filter((t) => !seenTabs.has(t));

const out = [];
out.push("SOURCE CROSS-CHECK: Google Sheet vs what is published");
out.push("");
out.push(`Published boats: ${site.boats.length}   Sheet selects: ${sheetSelected}`);
if (sharedElsewhere) {
  out.push(`${sharedElsewhere} shared-brand row${sharedElsewhere === 1 ? "" : "s"} publish under another dealer. Expected, not a disagreement.`);
}
out.push("");

if (unknownTabs.length) {
  out.push(`UNRECOGNISED TABS (${unknownTabs.length}) - add to TAB_TO_DEALER or ask why they exist:`);
  for (const t of unknownTabs) out.push(`  - ${t}`);
  out.push("");
}
if (missingTabs.length) {
  out.push(`EXPECTED TABS NOT FOUND (${missingTabs.length}) - renamed or deleted in the Sheet:`);
  for (const t of missingTabs) out.push(`  - ${t}`);
  out.push("");
}

if (!rows.length && !unknownTabs.length && !missingTabs.length) {
  out.push("Both sources agree on every dealer. Nothing to review.");
} else if (!rows.length) {
  out.push("No per-boat disagreements.");
} else {
  out.push(`DISAGREEMENTS (${rows.length} dealer${rows.length === 1 ? "" : "s"}):`);
  out.push("");
  for (const r of rows) {
    out.push(`${r.dealer}  (tab "${r.tab}")   published ${r.live}, sheet ${r.sheet}`);
    for (const e of r.onlySheet) {
      out.push(`  + in Sheet, NOT published:  ${[e.year, e.brand, e.model].filter(Boolean).join(" ")}`);
    }
    for (const b of r.onlySite) {
      out.push(`  - published, NOT in Sheet:  ${[b.year, b.brand, b.model].filter(Boolean).join(" ")}`);
    }
    out.push("");
  }
  out.push("The workbook is the publishing source, so these are for review, not");
  out.push("automatic correction. A boat in the Sheet but not published usually");
  out.push("means the workbook has not caught up; the reverse usually means the");
  out.push("Sheet has not.");
}

console.log(out.join("\n"));
