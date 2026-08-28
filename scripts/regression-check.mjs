// Automated regression sweep of every route.
//   node scripts/regression-check.mjs [base-url]
// Defaults to production. Loads each page in headless Edge and fails on:
// page JS errors, console errors, failed same-origin requests, broken images,
// missing key content, or an em dash anywhere in visible text (house style).
// Also checks robots, sitemap, and that the admin/removed API surfaces answer
// the way they should. Exit code 0 = clean, 1 = regressions listed.
//
// Run it before and after every risky change; it is the show-week safety net.
import puppeteer from "puppeteer-core";

const BASE = (process.argv[2] ?? "https://www.acvirtualboatshow.com").replace(/\/$/, "");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const GATE_HASH = "ef48cbbb34d2e019141accae5972292b7de037898c7c282ede77614badee82f3";

/** Each route asserts the content that proves the page actually works. */
const ROUTES = [
  { path: "/", must: ["Powered by Buoy", "Atlantic City"], label: "home" },
  { path: "/inventory", must: ["Opens September 10 at 10 AM", "Feature boats"], sel: ".gate-teasers", label: "gate (locked)" },
  { path: "/inventory", must: ["results"], sel: 'select[aria-label="Filter by brand"]', unlock: true, minBoatLinks: 50, label: "inventory (unlocked)" },
  { path: "/boats/cobia-320-cc", must: ["Cobia 320", "dockside walkthrough", "Where to find it"], label: "boat page" },
  { path: "/boats/not-a-real-boat", must: ["find that boat"], label: "boat 404" },
  { path: "/vendors", must: ["Marine Marketplace"], label: "marketplace" },
  { path: "/map", must: ["Farley"], label: "map" },
  { path: "/plan", must: ["Hours & Tickets"], label: "plan" },
  { path: "/sponsors", must: ["Golden Nugget"], label: "sponsors" },
  { path: "/privacy", must: ["What you give us", "ticket window"], label: "privacy" },
  { path: "/tickets", must: ["Grab your show tickets"], sel: "#tf-first", label: "tickets landing" },
  { path: "/walkthrough/confirmed?boat=cobia-320-cc&day=2026-09-11&part=Morning", must: ["Cobia"], label: "walkthrough confirmed" },
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
    if (r.unlock) {
      await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.evaluate((h) => localStorage.setItem("ac-show-access-2026", h), GATE_HASH);
    }
    await page.goto(BASE + r.path, { waitUntil: "networkidle2", timeout: 90000 });
    await new Promise((res2) => setTimeout(res2, 1200));

    const state = await page.evaluate(() => ({
      text: document.body.innerText,
      brokenImgs: [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0 && i.src.startsWith(location.origin)).map((i) => i.src.slice(location.origin.length)).slice(0, 5),
      boatLinks: document.querySelectorAll('a[href^="/boats/"]').length,
    }));

    // Case-insensitive: CSS text-transform changes innerText casing.
    for (const m of r.must) if (!state.text.toLowerCase().includes(m.toLowerCase())) note(r.label, `missing content "${m}"`);
    if (r.sel && !(await page.$(r.sel))) note(r.label, `missing element ${r.sel}`);
    if (r.minBoatLinks && state.boatLinks < r.minBoatLinks) note(r.label, `only ${state.boatLinks} boat links`);
    if (state.text.includes("\u2014")) note(r.label, "em dash found in visible text (house style)");
    for (const img of state.brokenImgs) note(r.label, `broken image ${img}`);
    for (const e of pageErrors) note(r.label, `page error: ${e}`);
    for (const e of consoleErrors) note(r.label, `console error: ${e}`);
    for (const b of badRequests) note(r.label, `failed request: ${b}`);
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
await expect("/api/opening-day-send", [401], "opening-day send stays locked");
await expect("/api/gate", [404, 405], "removed email-key API stays gone");

console.log("");
if (failures.length) {
  console.log(`REGRESSIONS (${failures.length}):`);
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
console.log("ALL CLEAN");
