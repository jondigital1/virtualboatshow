// Automated regression sweep of every route.
//   node scripts/regression-check.mjs [base-url]
// Defaults to production. Loads each page in headless Edge and fails on:
// page JS errors, console errors, failed same-origin requests, broken images,
// missing key content, a page without its questions and answers (and exactly
// one FAQPage block), or an em dash anywhere in visible text (house style).
// Also checks robots, sitemap, and that the admin/removed API surfaces answer
// the way they should. Exit code 0 = clean, 1 = regressions listed.
//
// Run it before and after every risky change; it is the show-week safety net.
import puppeteer from "puppeteer-core";

const BASE = (process.argv[2] ?? "https://www.acvirtualboatshow.com").replace(/\/$/, "");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
// The inventory gate came off on 2026-09-15: the lineup is open and server-rendered.

/** Each route asserts the content that proves the page actually works. Every
 *  page carries questions and answers unless faq is false (the noindexed ad
 *  landing, the post-submit confirmation and the 404). */
const ROUTES = [
  { path: "/", must: ["Powered by Buoy", "Atlantic City"], label: "home" },
  { path: "/inventory", must: ["results", "Get updates about the 2027 show", "Check Availability"], sel: 'select[aria-label="Filter by brand"]', minBoatLinks: 50, label: "inventory (open)" },
  { path: "/boats/cobia-320-cc", must: ["Cobia 320", "Check Availability", "Where it was", "Contact the dealer for pricing"], label: "boat page" },
  // Unknown slugs return a real 404 on purpose, so the 404 status is the pass
  // condition here, not a failure.
  { path: "/boats/not-a-real-boat", must: ["find that boat"], label: "boat 404", expect404: true, faq: false },
  { path: "/vendors", must: ["Marine Marketplace"], label: "marketplace" },
  { path: "/map", must: ["Farley"], label: "map" },
  { path: "/plan", must: ["Hours & Tickets"], label: "plan" },
  { path: "/sponsors", must: ["Golden Nugget"], label: "sponsors" },
  // Privacy carries no questions and answers yet.
  { path: "/privacy", must: ["What you give us", "Check Availability"], label: "privacy", faq: false },
  { path: "/tickets", must: ["Grab your show tickets"], sel: "#tf-first", label: "tickets landing", faq: false },
  { path: "/walkthrough/confirmed?boat=cobia-320-cc&day=2026-09-11&part=Morning", must: ["Cobia"], label: "walkthrough confirmed", faq: false },
];

const failures = [];
const note = (label, msg) => failures.push(`${label}: ${msg}`);

const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });

for (const r of ROUTES) {
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const badRequests = [];
  page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160)); });
  page.on("response", (res) => {
    if (res.status() >= 400 && res.url().startsWith(BASE)) badRequests.push(`${res.status()} ${res.url().slice(BASE.length, BASE.length + 80)}`);
  });
  try {
    await page.goto(BASE + r.path, { waitUntil: "networkidle2", timeout: 90000 });
    await new Promise((res2) => setTimeout(res2, 1200));

    const state = await page.evaluate(() => ({
      text: document.body.innerText,
      brokenImgs: [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0 && i.src.startsWith(location.origin)).map((i) => i.src.slice(location.origin.length)).slice(0, 5),
      boatLinks: document.querySelectorAll('a[href^="/boats/"]').length,
      faqItems: document.querySelectorAll("details.faq-item").length,
      faqLd: [...document.querySelectorAll('script[type="application/ld+json"]')].filter((s) => s.textContent.includes('"FAQPage"')).length,
    }));

    // Case-insensitive: CSS text-transform changes innerText casing.
    for (const m of r.must) if (!state.text.toLowerCase().includes(m.toLowerCase())) note(r.label, `missing content "${m}"`);
    if (r.sel && !(await page.$(r.sel))) note(r.label, `missing element ${r.sel}`);
    if (r.minBoatLinks && state.boatLinks < r.minBoatLinks) note(r.label, `only ${state.boatLinks} boat links`);
    if (r.faq !== false) {
      if (state.faqItems < 2) note(r.label, `only ${state.faqItems} questions and answers`);
      if (state.faqLd !== 1) note(r.label, `${state.faqLd} FAQPage blocks, wanted exactly 1`);
    }
    if (state.text.includes("\u2014")) note(r.label, "em dash found in visible text (house style)");
    for (const img of state.brokenImgs) note(r.label, `broken image ${img}`);
    for (const e of pageErrors) note(r.label, `page error: ${e}`);
    if (!r.expect404) {
      for (const e of consoleErrors) note(r.label, `console error: ${e}`);
      for (const b of badRequests) note(r.label, `failed request: ${b}`);
    }
    console.log(`ok  ${r.label}`);
  } catch (e) {
    note(r.label, `load failed: ${String(e).slice(0, 160)}`);
    console.log(`ERR ${r.label}`);
  }
  await page.close();
}
await browser.close();

// Plumbing that must answer exactly so.
const expect = async (path, want, desc) => {
  try {
    const res = await fetch(BASE + path, { redirect: "manual" });
    if (!want.includes(res.status)) note(desc, `status ${res.status}, wanted ${want.join("/")}`);
    else console.log(`ok  ${desc}`);
  } catch (e) {
    note(desc, String(e).slice(0, 120));
  }
};
await expect("/robots.txt", [200], "robots.txt");
await expect("/sitemap.xml", [200], "sitemap.xml");

// The lineup has to be crawlable with no JavaScript and no stored sign-up:
// every boat in the sitemap must have its link in the raw server HTML of
// /inventory. Matched on the path, because the sitemap names the www host and
// BASE may be a preview or localhost.
try {
  const sitemap = await (await fetch(BASE + "/sitemap.xml")).text();
  const slugs = [...sitemap.matchAll(/\/boats\/([^<\s]+)<\/loc>/g)].map((m) => m[1]);
  const html = await (await fetch(BASE + "/inventory")).text();
  const links = new Set([...html.matchAll(/href="\/boats\/([^"#?]+)"/g)].map((m) => m[1]));
  const missing = slugs.filter((s) => !links.has(s));
  if (!slugs.length) note("inventory raw HTML", "sitemap lists no boats");
  else if (missing.length) note("inventory raw HTML", `${missing.length} of ${slugs.length} boats missing without JavaScript, e.g. ${missing.slice(0, 5).join(", ")}`);
  else console.log(`ok  inventory raw HTML (all ${slugs.length} boats linked)`);
} catch (e) {
  note("inventory raw HTML", String(e).slice(0, 120));
}

// The homepage's featured boats render on the server too.
try {
  const html = await (await fetch(BASE + "/")).text();
  const links = new Set([...html.matchAll(/href="(\/boats\/[^"#?]+)"/g)].map((m) => m[1])).size;
  if (links < 6) note("home raw HTML", `only ${links} boat links without JavaScript`);
  else console.log(`ok  home raw HTML (${links} boat links)`);
} catch (e) {
  note("home raw HTML", String(e).slice(0, 120));
}
await expect("/api/opening-day-send", [401], "opening-day send stays locked");
await expect("/api/gate", [404, 405], "removed email-key API stays gone");

console.log("");
if (failures.length) {
  console.log(`REGRESSIONS (${failures.length}):`);
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
console.log("ALL CLEAN");
