/**
 * Facebook ad creative for AC In-Water Boat Show ticket sales.
 * Renders each concept at 1080x1350 (4:5, the strongest feed format on mobile).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const DIR = "design-specs/ads";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
mkdirSync(DIR, { recursive: true });
const b64 = (f, m = "image/jpeg") => `data:${m};base64,${readFileSync(join(DIR, f)).toString("base64")}`;

const LOGO = b64("logo-white-1400.png", "image/png");
const PHOTOS = {
  running: b64("photo-running.jpg"),
  marina: b64("photo-marina.jpg"),
  aboard: b64("photo-aboard.jpg"),
};

const CONCEPTS = [
  { id: "a-in-the-water", photo: "running", pos: "50% 50%", head: "See them<br>in the water.", sub: "250+ boats afloat, ready to board." },
  { id: "b-one-marina", photo: "marina", pos: "50% 58%", head: "250+ boats.<br>One marina.", sub: "Four days on the water in Atlantic City." },
  { id: "c-step-aboard", photo: "aboard", pos: "50% 46%", head: "Step aboard.", sub: "Walk the docks and climb on 250+ boats." },
];

const page = (c, w, h) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;font-family:'Poppins',system-ui,sans-serif;overflow:hidden}
  /* Photo keeps the whole boat, type sits on solid navy: a 4:5 crop of a
     landscape photo cannot carry legible type AND show the boat. */
  .ad{position:relative;width:${w}px;height:${h}px;background:#142E51;overflow:hidden;display:flex;flex-direction:column}
  .shot{position:relative;height:${Math.round(h * 0.49)}px;flex:none;background:url('${PHOTOS[c.photo]}') ${c.pos}/cover no-repeat}
  .wash{position:absolute;left:0;right:0;bottom:0;height:38%;background:linear-gradient(180deg,rgba(20,46,81,0) 0%,rgba(20,46,81,.55) 60%,#142E51 100%)}
  .top{position:absolute;top:${Math.round(h * 0.03)}px;left:0;right:0;display:flex;justify-content:center}
  /* Force the mark white: the supplied "white" file is navy artwork. */
  .top img{width:${Math.round(w * 0.5)}px;display:block;filter:brightness(0) invert(1);opacity:.97}
  .btm{flex:1;padding:0 ${Math.round(w * 0.085)}px ${Math.round(h * 0.05)}px;color:#fff;display:flex;flex-direction:column;justify-content:flex-end}
  .rule{width:${Math.round(w * 0.13)}px;height:6px;background:#FDB717;border-radius:3px;margin-bottom:${Math.round(h * 0.026)}px}
  h1{font-size:${Math.round(w * 0.088)}px;line-height:1.04;letter-spacing:-.02em;font-weight:800;text-transform:uppercase}
  .sub{font-size:${Math.round(w * 0.034)}px;line-height:1.38;font-weight:600;color:rgba(255,255,255,.9);margin-top:${Math.round(h * 0.015)}px;max-width:24ch}
  .when{font-size:${Math.round(w * 0.03)}px;font-weight:700;letter-spacing:.09em;color:#75BAE4;margin-top:${Math.round(h * 0.022)}px;text-transform:uppercase}
  .cta{align-self:flex-start;margin-top:${Math.round(h * 0.022)}px;background:#FDB717;color:#142E51;font-weight:800;font-size:${Math.round(w * 0.036)}px;letter-spacing:.04em;padding:${Math.round(w * 0.027)}px ${Math.round(w * 0.05)}px;border-radius:999px;text-transform:uppercase}
</style></head><body>
<div class="ad">
  <div class="shot">
    <div class="top"><img src="${LOGO}" alt=""></div>
    <div class="wash"></div>
  </div>
  <div class="btm">
    <div class="rule"></div>
    <h1>${c.head}</h1>
    <div class="sub">${c.sub}</div>
    <div class="when">September 10-13 &middot; Farley State Marina</div>
    <div class="cta">Get Tickets</div>
  </div>
</div></body></html>`;

const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox"] });
for (const c of CONCEPTS) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  await p.setContent(page(c, 1080, 1350), { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  await p.screenshot({ path: join(DIR, `ad-${c.id}-1080x1350.png`) });
  await p.close();
  console.log(`rendered ad-${c.id}-1080x1350.png`);
}
await browser.close();
