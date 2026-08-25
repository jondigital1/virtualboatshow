import sharp from "sharp";

const ROOT = "C:/Users/jon/dev/vbs-website";
const OFFICIAL = "C:/Users/jon/AppData/Local/Temp/claude/C--Users-jon-buoyboating/922148f7-bcf4-436c-86e9-e12372cf53ae/scratchpad/official";

// ---- og-show.jpg (1200x630): marina aerial + navy scrim + reversed logo ----
const base = await sharp(`${OFFICIAL}/f-1024x576.img`)
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .toBuffer();

const scrim = Buffer.from(
  `<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.62" stop-color="#142E51" stop-opacity="0"/><stop offset="1" stop-color="#142E51" stop-opacity="0.92"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`
);

const logo = await sharp(`${ROOT}/public/ac-logo-reversed.png`).resize({ width: 460 }).toBuffer();
const logoMeta = await sharp(logo).metadata();

await sharp(base)
  .composite([
    { input: scrim, top: 0, left: 0 },
    { input: logo, top: 630 - (logoMeta.height ?? 127) - 34, left: 44 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(`${ROOT}/public/og-show.jpg`);
console.log("og-show.jpg written", logoMeta.width + "x" + logoMeta.height, "logo");

// ---- favicon + apple icon: white boat mark centered on navy tile ----
const mark = await sharp(`${ROOT}/public/ac-mark-white.png`).trim().toBuffer();

async function iconTile(size, markWidth, out) {
  const m = await sharp(mark).resize({ width: markWidth }).toBuffer();
  const mm = await sharp(m).metadata();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 20, g: 46, b: 81, alpha: 1 } } })
    .composite([{ input: m, top: Math.round((size - (mm.height ?? markWidth)) / 2), left: Math.round((size - (mm.width ?? markWidth)) / 2) }])
    .png()
    .toFile(out);
  console.log(out.split("/").pop(), "written");
}

await iconTile(512, 430, `${ROOT}/app/icon.png`);
await iconTile(180, 150, `${ROOT}/app/apple-icon.png`);
