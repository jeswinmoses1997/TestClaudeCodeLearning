// Usage: node tests/visual/diff.mjs <reference.png> [current.png]
// Crops the app region out of the reference frame, masks overlays, writes shots/ref-crop.png + shots/diff.png.
import fs from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const [refPath, curPath = "shots/current.png"] = process.argv.slice(2);
const REF_TOP = 187; // letterbox bar above the app in the reference frame
const ref = PNG.sync.read(fs.readFileSync(refPath));
const cur = PNG.sync.read(fs.readFileSync(curPath));
const W = cur.width, H = cur.height;
const crop = new PNG({ width: W, height: H });
PNG.bitblt(ref, crop, 0, REF_TOP, W, H, 0, 0);
fs.writeFileSync("shots/ref-crop.png", PNG.sync.write(crop));

// mask: cursor/arrow overlays, scrollbar strip, hint text rows are kept
const masks = [
  [250, 560, 360, 760], // blue hand-drawn arrow + mouse cursor (left of S/A rows)
  [1150, 840, 1220, 900], // second cursor in the C row
  [W - 20, 0, W, H], // overlay scrollbar
  [900, H - 40, 1100, H], // handle bar at the bottom
];
const mask = (img) => {
  for (const [x0, y0, x1, y1] of masks)
    for (let y = y0; y < y1 && y < H; y++) for (let x = x0; x < x1 && x < W; x++) {
      const i = (y * W + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 128; img.data[i + 3] = 255;
    }
};
mask(crop); mask(cur);
const diff = new PNG({ width: W, height: H });
const bad = pixelmatch(crop.data, cur.data, diff.data, W, H, { threshold: 0.1 });
fs.writeFileSync("shots/diff.png", PNG.sync.write(diff));
console.log(`mismatch: ${bad} px = ${((bad / (W * H)) * 100).toFixed(2)}%`);
