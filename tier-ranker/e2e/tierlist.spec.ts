import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const chip = (page: Page, id: string) => page.locator(`[data-item-id="${id}"]`).first();

async function drag(page: Page, from: string, toSelector: string) {
  // keep the target above the fixed bottom tray (like a user scrolling the page)
  await page.evaluate((sel) => {
    const r = document.querySelector(sel)!.getBoundingClientRect();
    window.scrollBy(0, Math.max(0, r.top + r.height / 2 - 520));
  }, toSelector);
  const src = await chip(page, from).boundingBox();
  const dst = await page.locator(toSelector).boundingBox();
  if (!src || !dst) throw new Error("missing box");
  await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2);
  await page.mouse.down();
  await page.mouse.move(src.x + src.width / 2 + 10, src.y + src.height / 2 - 10, { steps: 4 });
  await page.mouse.move(dst.x + 60, dst.y + dst.height / 2, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(600); // let sortable settle animations + dnd-kit post-drop click suppression
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tier-list");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("#unranked .item")).toHaveCount(20);
});

test("renders 5 tiers and 20 unranked chips", async ({ page }) => {
  await expect(page.locator(".tier-row")).toHaveCount(5);
  await expect(page.locator(".tier-label")).toHaveText(["S", "A", "B", "C", "D"]);
});

test("drag tray -> S, S -> C, C -> tray", async ({ page }) => {
  await drag(page, "graphql", "#zone-S");
  await expect(page.locator("#zone-S [data-item-id=graphql]")).toHaveCount(1);
  await expect(page.locator("#unranked .item")).toHaveCount(19);

  await drag(page, "graphql", "#zone-C");
  await expect(page.locator("#zone-C [data-item-id=graphql]")).toHaveCount(1);
  await expect(page.locator("#zone-S .item")).toHaveCount(0);

  await drag(page, "graphql", "#unranked");
  await expect(page.locator("#unranked [data-item-id=graphql]")).toHaveCount(1);
  await expect(page.locator("#unranked .item")).toHaveCount(20);
});

test("reorder within a tier", async ({ page }) => {
  await drag(page, "graphql", "#zone-A");
  await drag(page, "microservices", "#zone-A");
  const before = await page.locator("#zone-A .item").evaluateAll((n) => n.map((e) => (e as HTMLElement).dataset.itemId));
  expect(before.length).toBe(2);
  await page.waitForTimeout(600);
  const first = await chip(page, before[0]!).boundingBox();
  const last = await chip(page, before[1]!).boundingBox();
  await page.mouse.move(first!.x + 20, first!.y + first!.height / 2);
  await page.mouse.down();
  await page.mouse.move(first!.x + 30, first!.y + first!.height / 2, { steps: 3 });
  await page.mouse.move(last!.x + last!.width - 10, last!.y + last!.height / 2, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  const after = await page.locator("#zone-A .item").evaluateAll((n) => n.map((e) => (e as HTMLElement).dataset.itemId));
  expect(after).toEqual([before[1], before[0]]);
});

test("reset returns everything to unranked and persistence works", async ({ page }) => {
  await drag(page, "realtime", "#zone-B");
  await expect(page.locator("#zone-B .item")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("#zone-B .item")).toHaveCount(1);
  await page.click("#reset");
  await expect(page.locator("#unranked .item")).toHaveCount(20);
  await expect(page.locator(".drop-zone .item")).toHaveCount(0);
});

test("clicking a chip opens the info panel; Escape and × close it", async ({ page }) => {
  await chip(page, "graphql").click();
  await expect(page.locator("#panel")).toHaveClass(/open/);
  await expect(page.locator("#panel-name")).toHaveText("GraphQL");
  await expect(page.locator("#panel-what")).toContainText("query language");
  await expect(page.locator("#panel-tools")).toContainText("Apollo");
  await page.keyboard.press("Escape");
  await expect(page.locator("#panel")).not.toHaveClass(/open/);
  await chip(page, "microservices").click();
  await page.click("#panel-close");
  await expect(page.locator("#panel")).not.toHaveClass(/open/);
});

test("Download PNG produces a valid, non-empty PNG (no gate)", async ({ page }) => {
  await drag(page, "graphql", "#zone-S");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#download")]);
  expect(dl.suggestedFilename()).toBe("system-design-tier-list.png");
  const file = path.join(test.info().outputDir, "out.png");
  await dl.saveAs(file);
  const buf = fs.readFileSync(file);
  expect(buf.length).toBeGreaterThan(20_000);
  expect(buf.subarray(1, 4).toString()).toBe("PNG");
  expect(buf.readUInt32BE(16)).toBe(5200); // 2600 * dpr 2
});

test("all 20 icons are local, load, and no external images are requested", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (r.resourceType() === "image" && u.origin !== new URL(page.url()).origin) external.push(r.url());
  });
  await page.goto("/tier-list");
  await page.waitForLoadState("networkidle");
  const sizes = await page.locator(".item-logo").evaluateAll((imgs) =>
    imgs.map((i) => ({ src: (i as HTMLImageElement).src, w: (i as HTMLImageElement).naturalWidth })),
  );
  expect(sizes).toHaveLength(20);
  for (const s of sizes) {
    expect(s.src).toContain("/logos/");
    expect(s.w).toBeGreaterThan(0);
  }
  expect(external).toEqual([]);
});

test("token spot-checks", async ({ page }) => {
  const cs = (sel: string, prop: string) => page.locator(sel).first().evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);
  expect(await cs("h1", "font-weight")).toBe("900");
  expect(await cs("body", "background-color")).toBe("rgb(228, 230, 225)");
  const label = await page.locator(".tier-label").first().boundingBox();
  expect(Math.round(label!.width)).toBe(112);
  expect(await cs("#download", "border-radius")).toBe("6px");
  expect(await cs(".tier-label >> nth=0", "background-color")).toBe("rgb(229, 57, 44)");
});

test("summary strip tracks ranked count", async ({ page }) => {
  await expect(page.locator(".summary-count")).toContainText("0 of 20 ranked");
  await drag(page, "graphql", "#zone-S");
  await expect(page.locator(".summary-count")).toContainText("1 of 20 ranked");
});

test("mobile: no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tier-list");
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
});
