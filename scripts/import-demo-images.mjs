// Imports the CPLP demo photo set (AI-generated stand-ins) into public/images/demo
// and rewrites src/data/demo/dimensions.json.
// Run: node scripts/import-demo-images.mjs <source-dir>
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = process.argv[2];
if (!srcDir) throw new Error("Usage: node scripts/import-demo-images.mjs <source-dir>");
const outDir = path.join(root, "public/images/demo");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const dimensions = {};
for (const f of (await readdir(srcDir)).filter((f) => /^ao-.*\.(jpe?g|png)$/i.test(f)).sort()) {
  const name = f.replace(/\.(jpe?g|png)$/i, "");
  const info = await sharp(path.join(srcDir, f))
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(outDir, `${name}.jpg`));
  dimensions[name] = { width: info.width, height: info.height, source: "generated" };
  console.log(name, `${info.width}x${info.height}`, info.size);
}
await writeFile(path.join(root, "src/data/demo/dimensions.json"), `${JSON.stringify(dimensions, null, 2)}\n`);
