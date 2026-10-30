import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { RENDERERS } from "@/lib/editor/sections";
import { sectionBackground } from "@/lib/editor/effects";
import { presetSectionProps, type PagePreset } from "@/lib/editor/presets";
import { DEFAULT_TYPOGRAPHY, fontStack, typographyVars } from "@/lib/editor/typography";

/** Snapshot size (desktop viewport); the gallery cards share this 1.6 : 1 aspect. */
export const SNAP_W = 1280;
export const SNAP_H = 800;

/** How many blocks to render: enough to fill the first screen of the site. */
const BLOCKS = 3;

function waitForImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  );
}

/**
 * Renders the first screen of a real preset — the same blocks and content a user gets
 * when they start from it — and rasterises it to a canvas. Nothing here is mocked.
 */
export async function snapshotPreset(preset: PagePreset): Promise<HTMLCanvasElement> {
  const { toCanvas } = await import("html-to-image");
  const typography = { ...DEFAULT_TYPOGRAPHY, ...preset.typography };

  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed",
    left: "-20000px",
    top: "0",
    width: `${SNAP_W}px`,
    height: `${SNAP_H}px`,
    overflow: "hidden",
    pointerEvents: "none",
  });
  document.body.appendChild(host);

  const root = createRoot(host);
  flushSync(() =>
    root.render(
      <div
        style={{
          ...typographyVars(typography),
          width: SNAP_W,
          height: SNAP_H,
          overflow: "hidden",
          fontFamily: "var(--site-body-font)",
          background: "#000",
        }}
      >
        {preset.sectionIds.slice(0, BLOCKS).map((id, i) => {
          const R = RENDERERS[id];
          if (!R) return null;
          const props = presetSectionProps(preset, i);
          return (
            <div key={i} style={{ background: sectionBackground(props) }}>
              <R props={{ ...props, bg: "transparent" }} />
            </div>
          );
        })}
      </div>,
    ),
  );

  try {
    await Promise.all([
      document.fonts.load(`${typography.headingWeight} 48px ${fontStack(typography.headingFont)}`),
      document.fonts.load(`400 16px ${fontStack(typography.bodyFont)}`),
      waitForImages(host),
    ]);
    // Sticky/animated blocks settle after a frame.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const target = host.firstElementChild as HTMLElement;
    return await toCanvas(target, {
      width: SNAP_W,
      height: SNAP_H,
      pixelRatio: 1.25,
      cacheBust: false,
    });
  } finally {
    root.unmount();
    host.remove();
  }
}
