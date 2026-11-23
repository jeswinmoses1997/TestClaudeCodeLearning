import { CONCEPTS, TIERS, iconUrl, type Concept, type TierId } from "./concepts";

export type BoardState = Record<TierId, string[]> & { unranked: string[] };

// next/font hashes family names, so resolve the real stacks from the CSS variables at draw time.
let SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
let DISPLAY = '"Arial Narrow", "Helvetica Neue", sans-serif';
const INK = "#14181f";
const LINE = "rgba(20, 24, 31, 0.2)";
const LINE_STRONG = "rgba(20, 24, 31, 0.85)";

async function resolveFonts() {
  const cs = getComputedStyle(document.documentElement);
  const sans = cs.getPropertyValue("--font-sans").trim();
  const display = cs.getPropertyValue("--font-display").trim();
  if (sans) SANS = `${sans}, ${SANS}`;
  if (display) DISPLAY = `${display}, ${DISPLAY}`;
  await Promise.all([
    document.fonts.load(`600 48px ${SANS}`),
    document.fonts.load(`900 128px ${DISPLAY}`),
    document.fonts.load(`500 28px ${SANS}`),
  ]).catch(() => {});
}
const byId = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]));

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const logoCache = new Map<string, HTMLImageElement>();

async function loadLogo(slug: string): Promise<HTMLImageElement | null> {
  if (logoCache.has(slug)) return logoCache.get(slug)!;
  try {
    const res = await fetch(iconUrl(slug));
    if (!res.ok) throw new Error("bad status");
    const obj = URL.createObjectURL(await res.blob());
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = obj;
    });
    logoCache.set(slug, img);
    return img;
  } catch {
    return null;
  }
}

export async function ensureLogos() {
  await Promise.all([...new Set(CONCEPTS.map((c) => c.icon))].map(loadLogo));
}

function measureItemWidth(ctx: CanvasRenderingContext2D, item: Concept) {
  ctx.font = `600 48px ${SANS}`;
  return 36 * 2 + 120 + 28 + ctx.measureText(item.name).width;
}

function drawItemChip(ctx: CanvasRenderingContext2D, item: Concept, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 14);
  ctx.stroke();

  const logoSize = 120;
  const lx = x + 32;
  const ly = y + (h - logoSize) / 2;
  ctx.fillStyle = "#f3f4f0";
  roundRect(ctx, lx, ly, logoSize, logoSize, 10);
  ctx.fill();

  const img = logoCache.get(item.icon);
  if (img) {
    const inset = 18;
    const box = logoSize - inset * 2;
    const nw = img.naturalWidth || 1;
    const nh = img.naturalHeight || 1;
    const ratio = Math.min(box / nw, box / nh);
    const iw = nw * ratio;
    const ih = nh * ratio;
    ctx.drawImage(img, lx + (logoSize - iw) / 2, ly + (logoSize - ih) / 2, iw, ih);
  } else {
    ctx.fillStyle = INK;
    ctx.font = `800 72px ${SANS}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.name[0], lx + logoSize / 2, ly + logoSize / 2 + 1);
    ctx.textAlign = "start";
  }

  ctx.font = `600 48px ${SANS}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.fillText(item.name, lx + logoSize + 28, y + h / 2 + 2);
  ctx.textBaseline = "alphabetic";
}

export async function buildTierListCanvas(state: BoardState, dpr = 2): Promise<HTMLCanvasElement> {
  if (document.fonts?.ready) await document.fonts.ready;
  await resolveFonts();
  await ensureLogos();

  const W = 2600, padX = 72, headerH = 290, minRowH = 320, rowGap = 24, labelW = 260;
  const chipH = 180, chipGap = 20, rowPad = 32, footerH = 120;
  const mctx = document.createElement("canvas").getContext("2d")!;
  const contentW = W - padX * 2;
  const zoneW = contentW - labelW - rowPad * 2;

  const layouts = TIERS.map((tier) => {
    const items = state[tier.id].map((id) => byId[id]).filter(Boolean);
    const rows: { item: Concept; w: number }[][] = [[]];
    let cur = 0;
    for (const item of items) {
      const w = measureItemWidth(mctx, item);
      const need = (cur > 0 ? chipGap : 0) + w;
      if (cur > 0 && cur + need > zoneW) {
        rows.push([]);
        cur = 0;
      }
      const row = rows[rows.length - 1];
      cur += (cur > 0 && row.length > 0 ? chipGap : 0) + w;
      row.push({ item, w });
    }
    const n = Math.max(1, rows.length);
    return { tier, rows, height: Math.max(minRowH, rowPad * 2 + n * chipH + (n - 1) * chipGap) };
  });

  const H = headerH + layouts.reduce((a, l) => a + l.height, 0) + (TIERS.length - 1) * rowGap + footerH;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  ctx.fillStyle = "#e4e6e1";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = INK;
  ctx.font = `900 190px ${DISPLAY}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("SYSTEM DESIGN TIER LIST", padX, 190);

  let y = headerH;
  for (const { tier, rows, height } of layouts) {
    ctx.fillStyle = "#f3f4f0";
    roundRect(ctx, padX, y, contentW, height, 12);
    ctx.fill();

    ctx.save();
    roundRect(ctx, padX, y, contentW, height, 12);
    ctx.clip();
    ctx.fillStyle = tier.color;
    ctx.fillRect(padX, y, labelW, height);
    ctx.restore();

    ctx.strokeStyle = LINE_STRONG;
    ctx.lineWidth = 3;
    roundRect(ctx, padX, y, contentW, height, 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padX + labelW, y);
    ctx.lineTo(padX + labelW, y + height);
    ctx.stroke();

    ctx.fillStyle = tier.fg;
    ctx.font = `900 230px ${DISPLAY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tier.id, padX + labelW / 2, y + height / 2 + 14);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";

    const zoneX = padX + labelW + rowPad;
    rows.forEach((row, r) => {
      let cx = zoneX;
      const cy = y + rowPad + r * (chipH + chipGap);
      row.forEach(({ item, w }) => {
        drawItemChip(ctx, item, cx, cy, w, chipH);
        cx += w + chipGap;
      });
    });
    y += height + rowGap;
  }

  ctx.fillStyle = "#5f6772";
  ctx.font = `500 30px ${SANS}`;
  ctx.fillText(typeof location !== "undefined" ? location.host : "", padX, H - 50);
  ctx.fillStyle = INK;
  ctx.font = `600 30px ${SANS}`;
  ctx.textAlign = "right";
  ctx.fillText("My system design ranking", W - padX, H - 50);
  ctx.textAlign = "start";
  return canvas;
}

export async function saveImage(canvas: HTMLCanvasElement, filename: string): Promise<boolean> {
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return false;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My System Design Tier List" });
        return true;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return false;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}
