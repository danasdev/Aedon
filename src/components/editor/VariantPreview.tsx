import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { RENDERERS } from "@/lib/editor/sections";
import { sectionBackground } from "@/lib/editor/effects";
import {
  DEFAULT_TYPOGRAPHY,
  activeFonts,
  googleFontsHref,
  typographyVars,
} from "@/lib/editor/typography";
import type { PropMap, Typography } from "@/lib/editor/types";

/** Thumbnails render the block at a small-laptop width so text stays legible once scaled. */
const PREVIEW_WIDTH = 1024;

/** Loads a preset's fonts once per stylesheet, so thumbnails show the real typography. */
function usePreviewFonts(typography: Partial<Typography> | undefined) {
  const href = typography
    ? googleFontsHref(activeFonts({ ...DEFAULT_TYPOGRAPHY, ...typography }))
    : null;
  useEffect(() => {
    if (!href || document.querySelector(`link[data-preview-fonts="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.previewFonts = href;
    document.head.appendChild(link);
  }, [href]);
}

/**
 * A section rendered at PREVIEW_WIDTH and scaled down into a thumbnail, with the same
 * background (colour, gradient or photo) and fonts it has on the canvas.
 * Without an explicit `scale` it fits the container's width.
 */
export function VariantPreview({
  variantId,
  defaults,
  typography,
  scale,
  height = 120,
}: {
  variantId: string;
  defaults: PropMap;
  typography?: Partial<Typography>;
  scale?: number;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.2);
  usePreviewFonts(typography);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || scale !== undefined) return;
    const measure = () => el.clientWidth && setFit(el.clientWidth / PREVIEW_WIDTH);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scale]);

  const R = RENDERERS[variantId];
  if (!R) return null;
  const type = typographyVars({ ...DEFAULT_TYPOGRAPHY, ...typography }) as CSSProperties;
  return (
    <div
      ref={ref}
      className="pointer-events-none relative w-full overflow-hidden bg-surface"
      style={{ height, background: sectionBackground(defaults) }}
      aria-hidden
    >
      <div
        style={{
          ...type,
          fontFamily: "var(--site-body-font)",
          width: PREVIEW_WIDTH,
          transform: `scale(${scale ?? fit})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* The wrapper owns the fill, as on the canvas. */}
        <R props={{ ...defaults, bg: "transparent" }} />
      </div>
    </div>
  );
}
