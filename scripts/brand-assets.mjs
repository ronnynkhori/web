// Builds web assets from the client's brand pack (brand-assets/, not deployed):
// logos -> public/images/brand, mascot poses -> public/images/mascot, emblem -> app icons.
// Run: node scripts/brand-assets.mjs
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "brand-assets");
const brandOut = path.join(root, "public/images/brand");
const mascotOut = path.join(root, "public/images/mascot");
const appDir = path.join(root, "src/app");
await mkdir(brandOut, { recursive: true });
await mkdir(mascotOut, { recursive: true });

const logo = (n) => path.join(src, "logomarca", `LOGO - XIII Jogos Desportivos da CPLP_${n}.png`);

// Horizontal (2000x683) and stacked (2000x1779) variants: colour, white, black, with/without date.
const logos = {
  "cplp-logo-h": 1,
  "cplp-logo-stacked": 2,
  "cplp-logo-h-white": 5,
  "cplp-logo-stacked-white": 6,
  "cplp-logo-h-black": 9,
  "cplp-logo-stacked-black": 10,
  "cplp-logo-h-date": "com data_3",
  "cplp-logo-stacked-date": "com data_4",
  "cplp-logo-h-date-white": "com data_7",
  "cplp-logo-stacked-date-white": "com data_8",
};

for (const [name, n] of Object.entries(logos)) {
  const out = path.join(brandOut, `${name}.png`);
  const info = await sharp(logo(n)).trim().resize({ width: 1200, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(out);
  console.log(name, `${info.width}x${info.height}`);
}

// Negative version for dark surfaces, as in the brand book (p.4 "Variação negativa"):
// white swooshes and wordmark, flags kept in colour. Built from the supplied white
// file (same canvas as the colour file): its pure-white pixels stay white, and
// everything else (the greyscale flags) takes the colour file's pixels.
async function negative(colourN, whiteN, name) {
  const colour = await sharp(logo(colourN)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const white = await sharp(logo(whiteN)).ensureAlpha().raw().toBuffer();
  const { data, info } = colour;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [white[i], white[i + 1], white[i + 2], white[i + 3]];
    if (a > 0 && r > 230 && g > 230 && b > 230) {
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = a;
    }
  }
  const out = await sharp(data, { raw: info }).trim().resize({ width: 1200 }).png({ compressionLevel: 9 }).toFile(path.join(brandOut, `${name}.png`));
  console.log(name, `${out.width}x${out.height}`);
}
await negative(1, 5, "cplp-logo-h-negative");
await negative("com data_3", "com data_7", "cplp-logo-h-date-negative");
await negative(2, 6, "cplp-logo-stacked-negative");
await negative("com data_4", "com data_8", "cplp-logo-stacked-date-negative");

// Ondaka (the agency behind the proposal): colour logo for light surfaces, and a
// negative for navy with the gold symbol kept and the near-black wordmark and
// tagline turned white (the supplied "on black" file keeps a dark wordmark).
const ondakaSrc = path.join(src, "ondaka", "LOGO_ONDAKA.png");
const ondaka = await sharp(ondakaSrc).trim().resize({ width: 900, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(brandOut, "ondaka-h.png"));
console.log("ondaka-h", `${ondaka.width}x${ondaka.height}`);
{
  const { data, info } = await sharp(ondakaSrc).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a > 0 && Math.max(r, g, b) < 120 && Math.max(r, g, b) - Math.min(r, g, b) < 40) data[i] = data[i + 1] = data[i + 2] = 255;
  }
  const out = await sharp(data, { raw: info }).trim().resize({ width: 900, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(brandOut, "ondaka-h-negative.png"));
  console.log("ondaka-h-negative", `${out.width}x${out.height}`);
}

// MINJUD (institutional partner), rendered from the client's "36 Anos" PDFs. The
// client asked to cut the "36 anos" mark: everything up to the divider line
// (horizontal) or the rule (vertical) is dropped, keeping the ministry lockup.
async function minjud(file, axis, name) {
  const { data, info } = await sharp(path.join(src, "minjud", file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const dark = (x, y) => {
    const i = (y * width + x) * 4;
    return data[i + 3] > 128 && data[i] < 90 && data[i + 1] < 90 && data[i + 2] < 90;
  };
  const along = axis === "x" ? width : height;
  const across = axis === "x" ? height : width;
  let line = -1;
  for (let p = Math.round(along * 0.15); p < along * 0.6 && line < 0; p++) {
    let n = 0;
    for (let q = 0; q < across; q++) if (axis === "x" ? dark(p, q) : dark(q, p)) n++;
    if (n > across * (axis === "x" ? 0.45 : 0.6)) line = p;
  }
  if (line < 0) throw new Error(`no divider found in ${file}`);
  let end = line;
  while (end < along) {
    let n = 0;
    for (let q = 0; q < across; q++) if (axis === "x" ? dark(end, q) : dark(q, end)) n++;
    if (n < across * 0.2) break;
    end++;
  }
  const start = end + 4;
  const region = axis === "x" ? { left: start, top: 0, width: width - start, height } : { left: 0, top: start, width, height: height - start };
  const cut = await sharp(path.join(src, "minjud", file)).extract(region).png().toBuffer();
  const out = await sharp(cut).trim().resize({ width: 900, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(brandOut, `${name}.png`));
  console.log(name, `${out.width}x${out.height}`);
}
await minjud("minjud-36-anos-horizontal.png", "x", "minjud-h");
await minjud("minjud-36-anos-vertical.png", "y", "minjud-v");

// Emblem only (flags + swooshes), cropped from the stacked colour logo for icons.
const emblemArea = await sharp(logo(2)).extract({ left: 400, top: 100, width: 1200, height: 1150 }).png().toBuffer();
const emblem = await sharp(emblemArea).trim().toBuffer();
const square = async (size, bg) =>
  sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: await sharp(emblem).resize(Math.round(size * 0.86), Math.round(size * 0.86), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(), gravity: "center" }])
    .png();
await (await square(512, { r: 255, g: 255, b: 255, alpha: 0 })).toFile(path.join(brandOut, "cplp-emblem.png"));
await (await square(512, { r: 255, g: 255, b: 255, alpha: 1 })).toFile(path.join(appDir, "icon.png"));
await (await square(180, { r: 255, g: 255, b: 255, alpha: 1 })).toFile(path.join(appDir, "apple-icon.png"));
console.log("emblem + icons");

// Mascot poses: 1024 square PNGs -> trimmed 800px PNG with slug names.
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/×/g, "x")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
for (const f of (await readdir(path.join(src, "Mascote"))).filter((f) => f.endsWith(".png"))) {
  const name = slug(f.replace("MASCOTE - XIII Jogos Desportivos da CPLP_", "").replace(".png", ""));
  const info = await sharp(path.join(src, "Mascote", f))
    .trim()
    .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(path.join(mascotOut, `${name}.png`));
  console.log("mascot", name, `${info.width}x${info.height}`, info.size);
}
