/**
 * Facebook ad creative for AC In-Water Boat Show ticket sales.
 *
 * The reversed logo sits on the navy block, never over the photo. Gina
 * supplied both a navy lockup and a reversed one; laying the navy mark over a
 * bright sky washed it out, and forcing it white in CSS threw away the gold
 * and light blue in the wave. On navy it reads as drawn.
 *
 * Advance pricing is the hook: 15 dollars through September 9, 22 after.
 *
 * Renders 4:5 for feed, 1:1 for square placements, 9:16 for stories.
 *   node scripts/build-ads.mjs [concept-id]
 */
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const DIR = "design-specs/ads";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
mkdirSync(DIR, { recursive: true });
const b64 = (f, m = "image/jpeg") => `data:${m};base64,${readFileSync(join(DIR, f)).toString("base64")}`;

const LOGO = b64("logo-reversed-1600.png", "image/png");
const PHOTOS = {
  running: b64("photo-running.jpg"),
  marina: b64("photo-marina.jpg"),
  aboard: b64("photo-aboard.jpg"),
};

const CONCEPTS = [
  { id: "a-in-the-water", photo: "running", pos: "50% 50%", head: "See them<br>in the water.", sub: "250+ boats afloat, ready to board." },
  { id: "b-one-marina", photo: "marina", pos: "50% 56%", head: "250+ boats.<br>One marina.", sub: "Four days on the water in Atlantic City." },
  { id: "c-step-aboard", photo: "aboard", pos: "50% 46%", head: "Step aboard.", sub: "Walk the docks and climb on 250+ boats." },
];

/** photo share is tuned per ratio: the navy block has to hold the logo, the
 *  headline, the offer and the button without clipping. */
const SIZES = [
  { tag: "1080x1350", w: 1080, h: 1350, photo: 0.39 },
  { tag: "1080x1080", w: 1080, h: 1080, photo: 0.24 },
  { tag: "1080x1920", w: 1080, h: 1920, photo: 0.55 },
];

const page = (c, s) => {
  const { w, h } = s;
  const u = (n) => Math.round(w * n); // scale type from width so it matches across ratios
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;font-family:'Poppins',system-ui,sans-serif;overflow:hidden}
  .ad{width:${w}px;height:${h}px;background:#142E51;display:flex;flex-direction:column;overflow:hidden}
  .shot{position:relative;height:${Math.round(h * s.photo)}px;flex:none;background:url('${PHOTOS[c.photo]}') ${c.pos}/cover no-repeat}
  .shot::after{content:"";position:absolute;left:0;right:0;bottom:0;height:26%;background:linear-gradient(180deg,rgba(20,46,81,0),#142E51)}
  .btm{flex:1;padding:${u(0.025)}px ${u(0.075)}px ${u(0.055)}px;color:#fff;display:flex;flex-direction:column;justify-content:center}
  .logo{width:${u(0.47)}px;display:block;margin-bottom:${u(0.034)}px}
  h1{font-size:${u(0.078)}px;line-height:1.04;letter-spacing:-.02em;font-weight:800;text-transform:uppercase}
  .sub{font-size:${u(0.031)}px;line-height:1.36;font-weight:600;color:rgba(255,255,255,.88);margin-top:${u(0.016)}px;max-width:26ch}
  .when{font-size:${u(0.026)}px;font-weight:700;letter-spacing:.08em;color:#75BAE4;margin-top:${u(0.024)}px;text-transform:uppercase}
  /* Advance price is the offer, so it gets the gold and a line of its own. */
  .price{font-size:${u(0.036)}px;font-weight:800;color:#FDB717;margin-top:${u(0.012)}px}
  .price span{color:rgba(255,255,255,.7);font-weight:600;font-size:${u(0.029)}px}
  .cta{align-self:flex-start;margin-top:${u(0.03)}px;background:#FDB717;color:#142E51;font-weight:800;font-size:${u(0.034)}px;letter-spacing:.04em;padding:${u(0.025)}px ${u(0.048)}px;border-radius:999px;text-transform:uppercase}
</style></head><body>
<div class="ad">
  <div class="shot"></div>
  <div class="btm">
    <img class="logo" src="${LOGO}" alt="">
    <h1>${c.head}</h1>
    <div class="sub">${c.sub}</div>
    <div class="when">September 10-13 &middot; Farley State Marina</div>
    <div class="price">$15 through September 9 <span>then $22</span></div>
    <div class="cta">Get Tickets</div>
  </div>
</div></body></html>`;
};

const only = process.argv[2];
const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox"] });
for (const c of CONCEPTS) {
  if (only && c.id !== only) continue;
  for (const s of SIZES) {
    const p = await browser.newPage();
    await p.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
    await p.setContent(page(c, s), { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 900));
    await p.screenshot({ path: join(DIR, `ad-${c.id}-${s.tag}.png`) });
    await p.close();
    console.log(`rendered ad-${c.id}-${s.tag}.png`);
  }
}
await browser.close();
