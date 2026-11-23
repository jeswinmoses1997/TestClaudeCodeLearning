// Usage: node tests/visual/capture.mjs <out.png>
import { chromium } from "@playwright/test";
const out = process.argv[2] || "shots/current.png";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1525, height: 864 }, deviceScaleFactor: 1985 / 1525 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/tier-list");
await p.evaluate(() => document.fonts.ready);
await p.addStyleTag({ content: "*{animation:none!important;transition:none!important}" });
await p.waitForTimeout(500);
await p.screenshot({ path: out });
await b.close();
