import type { ShowcaseTemplate } from "./templates";

/** Texture size; the card's aspect matches (1.6 : 1). */
export const ART_W = 1600;
export const ART_H = 1000;

const CHROME_H = 56;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Draws `img` to cover the box, like CSS object-fit: cover. */
function cover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s;
  const sh = h / s;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Word-wraps `text` inside `maxWidth`, returning the lines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function font(weight: number, size: number, family: string) {
  return `${weight} ${size}px "${family}", Georgia, serif`;
}

/** Thin browser frame so each card reads as a website. */
function drawChrome(ctx: CanvasRenderingContext2D, t: ShowcaseTemplate) {
  ctx.fillStyle = "#E9E7E2";
  ctx.fillRect(0, 0, ART_W, CHROME_H);
  ["#FF6058", "#FFBD2E", "#28C840"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(34 + i * 26, CHROME_H / 2, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, ART_W / 2 - 260, 13, 520, 30, 15);
  ctx.fill();
  ctx.fillStyle = "#6B6964";
  ctx.font = `500 17px "Inter", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(t.domain, ART_W / 2, CHROME_H / 2 + 1);
  ctx.textAlign = "left";
}

function drawNav(ctx: CanvasRenderingContext2D, t: ShowcaseTemplate, ink: string, y: number) {
  ctx.fillStyle = ink;
  ctx.textBaseline = "middle";
  ctx.font = font(t.fonts.displayWeight, 30, t.fonts.display);
  ctx.fillText(t.brand, 72, y);
  ctx.font = `500 19px "${t.fonts.body}", sans-serif`;
  let x = ART_W - 72;
  for (const item of [...t.nav].reverse()) {
    const w = ctx.measureText(item).width;
    x -= w;
    ctx.globalAlpha = 0.78;
    ctx.fillText(item, x, y);
    ctx.globalAlpha = 1;
    x -= 44;
  }
}

function drawButton(ctx: CanvasRenderingContext2D, t: ShowcaseTemplate, x: number, y: number) {
  ctx.font = `600 22px "${t.fonts.body}", sans-serif`;
  const w = ctx.measureText(t.cta).width + 64;
  ctx.fillStyle = t.colors.accent;
  roundRect(ctx, x, y, w, 60, 30);
  ctx.fill();
  ctx.fillStyle = t.colors.onAccent;
  ctx.textBaseline = "middle";
  ctx.fillText(t.cta, x + 32, y + 31);
  return w;
}

function drawHeadline(
  ctx: CanvasRenderingContext2D,
  t: ShowcaseTemplate,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";
  ctx.font = font(t.fonts.displayWeight, size, t.fonts.display);
  const lines = wrap(ctx, t.headline, maxWidth);
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * size * 1.06));
  return y + (lines.length - 1) * size * 1.06;
}

/** Paints one landing-page mockup and returns the canvas (photo loads first). */
export async function paintTemplate(t: ShowcaseTemplate): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = ART_W;
  canvas.height = ART_H;
  const ctx = canvas.getContext("2d")!;
  const img = await loadImage(t.photo);
  const { bg, ink, muted } = t.colors;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ART_W, ART_H);
  const top = CHROME_H;

  if (t.layout === "split") {
    const photoX = ART_W * 0.52;
    if (img) cover(ctx, img, photoX, top, ART_W - photoX, ART_H - top);
    drawNav(ctx, t, ink, top + 58);
    const end = drawHeadline(ctx, t, 72, top + 300, photoX - 150, 92, ink);
    ctx.fillStyle = muted;
    ctx.font = `400 24px "${t.fonts.body}", sans-serif`;
    ctx.fillText(t.sub, 72, end + 78);
    drawButton(ctx, t, 72, end + 130);
    // product strip
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.07;
      roundRect(ctx, 72 + i * 210, ART_H - 190, 190, 130, 14);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  } else if (t.layout === "full") {
    if (img) cover(ctx, img, 0, top, ART_W, ART_H - top);
    const shade = ctx.createLinearGradient(0, top, 0, ART_H);
    shade.addColorStop(0, "rgba(0,0,0,0.45)");
    shade.addColorStop(0.45, "rgba(0,0,0,0.15)");
    shade.addColorStop(1, "rgba(0,0,0,0.78)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, top, ART_W, ART_H - top);
    drawNav(ctx, t, ink, top + 58);
    const end = drawHeadline(ctx, t, 72, ART_H - 330, ART_W * 0.62, 104, ink);
    ctx.fillStyle = muted;
    ctx.font = `400 24px "${t.fonts.body}", sans-serif`;
    ctx.fillText(t.sub, 72, end + 70);
    drawButton(ctx, t, ART_W - 72 - 330, ART_H - 140);
  } else {
    drawNav(ctx, t, ink, top + 58);
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.12;
    ctx.fillRect(72, top + 110, ART_W - 144, 2);
    ctx.globalAlpha = 1;
    const end = drawHeadline(ctx, t, 72, top + 250, ART_W * 0.5, 84, ink);
    ctx.fillStyle = muted;
    ctx.font = `400 23px "${t.fonts.body}", sans-serif`;
    wrap(ctx, t.sub, 520).forEach((l, i) => ctx.fillText(l, ART_W - 72 - 520, top + 190 + i * 34));
    drawButton(ctx, t, ART_W - 72 - 520, top + 260);
    const photoY = Math.max(end + 70, top + 440);
    if (img) {
      ctx.save();
      roundRect(ctx, 72, photoY, ART_W - 144, ART_H - photoY - 56, 22);
      ctx.clip();
      cover(ctx, img, 72, photoY, ART_W - 144, ART_H - photoY - 56);
      ctx.restore();
    }
  }

  drawChrome(ctx, t);
  return canvas;
}

/** Loads the mockup fonts so canvas text doesn't fall back to Georgia. */
export async function loadShowcaseFonts(templates: ShowcaseTemplate[]) {
  if (typeof document === "undefined" || !document.fonts) return;
  const wanted = new Set<string>();
  for (const t of templates) {
    wanted.add(`${t.fonts.displayWeight} 40px "${t.fonts.display}"`);
    wanted.add(`400 20px "${t.fonts.body}"`);
    wanted.add(`600 20px "${t.fonts.body}"`);
  }
  wanted.add(`500 17px "Inter"`);
  await Promise.all([...wanted].map((f) => document.fonts.load(f).catch(() => undefined)));
}
