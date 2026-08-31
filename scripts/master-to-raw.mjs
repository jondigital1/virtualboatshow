/**
 * Master-inventory adapter: turns the 2026 VBS Boat Inventory Master workbook
 * into the row shape import-show-boats.mjs already parses.
 *
 * Pipeline position: data/2026_VBS_Boat_Inventory_Master.xlsx -> this script
 * -> data/master-boats-raw.json -> import-show-boats.mjs -> data/show-boats.json
 *
 * WHY THIS EXISTS. The site used to be built from Giselle's "2026 Feature
 * Boats" workbook, which is a curated subset: the boats each dealer picked to
 * feature. That published 87 boats while the show actually has ~175. Giselle
 * confirmed in writing on 2026-08-26 that the X / 1 / 2 marks in her workbook
 * only record which boat was chosen for an eblast, and that "all boats
 * regardless of X/1/2 should be listed" for the virtual show. The master
 * inventory workbook is the full lineup, so it is now the source.
 *
 * The master carries dealer identity in a DEALER column (one sheet per dealer)
 * and a per-row BOAT ID, which the feature workbook never had. That is what
 * lets two dealers each bring their own hull of the same model without the two
 * collapsing into one record on import.
 *
 * SELECTION. A row publishes only if it is a real, attributable, at-show boat:
 *  - MODEL must be present. 22 rows are brand-only placeholders ("Ranger Tugs"
 *    with no model) and are holding places for data that has not arrived.
 *  - MODEL must not read "No Models Supplied by Dealer" (3 rows).
 *  - STATUS must not say NOT AT SHOW (3 rows). These are boats a dealer's own
 *    lineup omits; publishing one lets a visitor plan around a boat that will
 *    not be in the water.
 *  - DEALER must be set. The 7 "TBD - ..." sheets hold 17 rows that no
 *    exhibitor has claimed yet, so there is nobody to send an enquiry to.
 *
 * SHARED BRANDS. Every row is emitted as its own boat, never pre-merged. Where
 * Comstock and MarineMax both bring the same model they are bringing DIFFERENT
 * hulls, with different stock numbers and sometimes different model years (the
 * Boston Whaler 330 Outrage is a 2026 at Comstock, stock 14117979i, and a 2027
 * at MarineMax, Boat Trader 10120325). import-show-boats.mjs already handles
 * this: unmerged rows sharing brand+model both get a dealer-suffixed slug, so
 * each hull keeps its own page and its own dealer.
 */
import ExcelJS from "exceljs";
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.argv.find((a) => a.startsWith("--src="))?.slice(6)
  ?? join(ROOT, "data", "2026_VBS_Boat_Inventory_Master.xlsx");
const OUT = join(ROOT, "data", "master-boats-raw.json");

/** Non-boat sheets. */
const SKIP = new Set(["Dealer Contacts", "Notes"]);

/**
 * Master DEALER value -> the section key import-show-boats.mjs looks up in its
 * DEALER_META table, which is what carries each dealer's location and phone
 * onto the site. Names that already match are omitted.
 */
const DEALER_KEY = {
  "Clarks Landing Yacht Sales & Marina": "Clarks Landing Marina",
  "D&R Boat World": "D & R Boat World",
  "Riptide Marine Center": "Riptide",
  "Sandy Hook Yacht Sales": "Sandy Hook",
  "Schrader Yacht Sales": "Schrader Yacht Sales Inc.",
};

const cell = (c) => {
  const v = c.value;
  if (v == null) return "";
  if (typeof v === "object") {
    if (v.text) return String(v.text);
    if (v.hyperlink) return String(v.hyperlink);
    if (v.result !== undefined) return String(v.result);
    return "";
  }
  return String(v);
};

/**
 * Excel exports escape underscores and ampersands inside URLs ("Robalo\_Boats",
 * "id=123\&p=1"). Left in, every one of those links 404s. 13 rows carry them.
 */
const unescapeUrl = (s) => s.replace(/\\(.)/g, "$1").trim();

/**
 * Model year, most trustworthy source first. A dealer listing URL names the
 * year of the actual hull ("/2027-boston-whaler-250-outrage-..."), so it beats
 * the YEAR cell when the cell is blank. Failing both, 2026: Jon's rule
 * (2026-08-30) is that an undated boat is a 2026 unless a dealer said 2027,
 * and a dated title reads better than a boat with no year at all.
 */
function resolveYear(yearCell, link) {
  const explicit = Math.round(Number(yearCell));
  if (Number.isFinite(explicit) && explicit > 1990 && explicit < 2100) return explicit;
  const m = link.match(/\/(?:new-)?(20[23]\d)-/) ?? link.match(/[/-](20[23]\d)-[a-z]/i);
  if (m) return Number(m[1]);
  return 2026;
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(SRC);

  const rows = [];
  let r = 0;
  const push = (o) => rows.push({ r: ++r, ...o });
  push({ c1: "MASTER INVENTORY", c3: "YEAR", c4: "BRAND", c6: "MODEL" }); // r1 is skipped by the parser

  const stats = { published: 0, noModel: 0, noModelsSupplied: 0, notAtShow: 0, noDealer: 0 };
  const perDealer = {};

  for (const ws of wb.worksheets) {
    if (SKIP.has(ws.name)) continue;

    const hdr = [];
    ws.getRow(1).eachCell({ includeEmpty: true }, (c) => hdr.push(cell(c)));
    const iStatus = hdr.findIndex((h) => /^STATUS/i.test(h)) + 1;
    const iDealer = hdr.indexOf("DEALER") + 1;

    // One pass to find this sheet's dealer, so an all-suppressed sheet emits no
    // header row and cannot leave a dangling empty section.
    const keep = [];
    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i);
      const brand = cell(row.getCell(2)).trim();
      if (!brand) continue;
      const model = cell(row.getCell(3)).trim();
      const status = iStatus > 0 ? cell(row.getCell(iStatus)).trim() : "";
      const dealer = iDealer > 0 ? cell(row.getCell(iDealer)).trim() : "";

      if (!model) { stats.noModel++; continue; }
      if (/no models? supplied/i.test(model)) { stats.noModelsSupplied++; continue; }
      if (/NOT AT SHOW/i.test(status)) { stats.notAtShow++; continue; }
      if (!dealer) { stats.noDealer++; continue; }

      const link = unescapeUrl(cell(row.getCell(4)));
      keep.push({
        dealer,
        year: resolveYear(cell(row.getCell(1)).trim(), link),
        brand,
        model,
        link: /^https?:\/\//i.test(link) ? link : "",
        brandLink: unescapeUrl(cell(row.getCell(5))),
      });
    }
    if (!keep.length) continue;

    const dealerName = keep[0].dealer;
    push({ c1: DEALER_KEY[dealerName] ?? dealerName }); // section header: c1 set, c4 empty

    for (const b of keep) {
      push({
        c2: "P",            // a selection signal; rows with none are treated as noise
        c3: String(b.year),
        c4: b.brand,
        c5: "2",            // ranking is eblast-only per Giselle, so the site sorts alphabetically
        c6: b.model,
        c8: b.link,
        c9: b.brandLink,
      });
      stats.published++;
      perDealer[dealerName] = (perDealer[dealerName] ?? 0) + 1;
    }
  }

  writeFileSync(OUT, JSON.stringify({ "Models To Do": rows }, null, 1));

  console.log(`source: ${SRC}`);
  console.log(`published rows : ${stats.published}`);
  console.log(`suppressed     : ${stats.noModel} brand-only, ${stats.noModelsSupplied} no-models-supplied, ${stats.notAtShow} not-at-show, ${stats.noDealer} unclaimed (TBD sheets)`);
  console.log("per dealer:");
  for (const [d, n] of Object.entries(perDealer).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}  ${d}${DEALER_KEY[d] ? `  -> ${DEALER_KEY[d]}` : ""}`);
  }
  console.log(`wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
