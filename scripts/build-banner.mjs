// Build the 33x81 inch vertical banner as a print-ready PDF plus a PNG proof.
//   node scripts/build-banner.mjs
// Composition: the 12MP Farley State Marina photo up top (122 DPI at full
// width), show block in navy, three feature-boat tiles from the site's own
// library (about 120 DPI at tile size), then a QR code to /tickets carrying
// UTM tags so every scan at the show becomes an attributable lead.
// Output: design-specs/banner/banner-33x81.pdf and banner-proof.png.
// Rerun with a swapped marina-highres.jpg whenever better photography lands.
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import QRCode from "qrcode";
import puppeteer from "puppeteer-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "design-specs", "banner");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const b64 = (p, mime = "image/jpeg") => `data:${mime};base64,${readFileSync(p).toString("base64")}`;
const marina = b64(join(out, "marina-highres.jpg"));
// Water shots only: a banner sells the show, not a parking lot.
const boats = ["boston-whaler-330-outrage-21.jpg", "formula-360-cbr-1.jpg", "tiara-yachts-39ls-1.jpg"]
  .map((n) => b64(join(root, "public", "boats", n)));
const logo = b64(join(root, "public", "ac-logo-horizontal.png"), "image/png");

const qr = await QRCode.toDataURL(
  "https://www.acvirtualboatshow.com/tickets?utm_source=show-banner&utm_medium=qr&utm_campaign=onsite-2026",
  { width: 1500, margin: 1, color: { dark: "#142E51", light: "#FFFFFF" } }
);

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: 33in 81in; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 33in; height: 81in; font-family: 'Poppins', sans-serif; background: #142E51; }
  body { display: flex; flex-direction: column; }
  .foot { flex: 1; }
  .photo { width: 33in; height: 23in; object-fit: cover; object-position: 50% 68%; display: block; }
  .gold { height: .45in; background: #FDB717; }
  .navy { background: #142E51; color: #fff; padding: 2.2in 2in 2in; text-align: center; }
  .navy .dates { color: #75BAE4; font-weight: 700; font-size: 1.05in; letter-spacing: .12em; }
  .navy h1 { font-weight: 800; font-size: 2.35in; line-height: 1.04; margin-top: .55in; letter-spacing: .01em; text-transform: uppercase; }
  .navy .sub { color: #FDB717; font-weight: 800; font-size: 1.32in; margin-top: .85in; letter-spacing: .04em; }
  .navy .marina { color: rgba(255,255,255,.85); font-weight: 600; font-size: .78in; margin-top: .55in; letter-spacing: .1em; text-transform: uppercase; }
  .tiles { display: flex; }
  .tiles img { width: 11in; height: 8.5in; object-fit: cover; display: block; }
  .cta { background: #F4F7F9; text-align: center; padding: 1.7in 2in 1.6in; }
  .cta .qr { width: 8.6in; height: 8.6in; border: .12in solid #142E51; border-radius: .5in; }
  .cta .scan { color: #142E51; font-weight: 800; font-size: 1.5in; margin-top: .8in; text-transform: uppercase; letter-spacing: .03em; }
  .cta .plan { color: #3d5260; font-weight: 600; font-size: .82in; margin-top: .4in; }
  .foot { background: #142E51; text-align: center; padding: 1.15in 1in 0; }
  .foot img { height: 2in; filter: brightness(0) invert(1); }
  .foot .url { color: #75BAE4; font-weight: 700; font-size: .85in; letter-spacing: .06em; margin-top: .35in; }
</style></head><body>
  <img class="photo" src="${marina}">
  <div class="gold"></div>
  <div class="navy">
    <div class="dates">SEPTEMBER 10 - 13, 2026</div>
    <h1>Atlantic City<br>In-Water Boat Show</h1>
    <div class="sub">250+ BOATS IN THE WATER</div>
    <div class="marina">Farley State Marina &middot; Let's Boat!</div>
  </div>
  <div class="tiles">
    <img src="${boats[0]}"><img src="${boats[1]}"><img src="${boats[2]}">
  </div>
  <div class="cta">
    <img class="qr" src="${qr}">
    <div class="scan">Scan for tickets</div>
    <div class="plan">and browse every feature boat before you walk the docks</div>
  </div>
  <div class="foot">
    <img src="${logo}">
    <div class="url">acvirtualboatshow.com</div>
  </div>
</body></html>`;

writeFileSync(join(out, "banner.html"), html);

const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.goto("file:///" + join(out, "banner.html").replace(/\\/g, "/"), { waitUntil: "networkidle0", timeout: 120000 });
await new Promise((r) => setTimeout(r, 1500)); // let webfonts settle
await page.pdf({ path: join(out, "banner-33x81.pdf"), width: "33in", height: "81in", printBackground: true, pageRanges: "1" });

// Proof PNG at 1/8 scale for eyeballing and sending around.
await page.setViewport({ width: Math.round(33 * 96), height: Math.round(81 * 96), deviceScaleFactor: 0.125 });
await page.screenshot({ path: join(out, "banner-proof.png"), fullPage: true });
await browser.close();
console.log("built banner-33x81.pdf and banner-proof.png");
