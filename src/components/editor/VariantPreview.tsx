import { useLayoutEffect, useRef, useState } from "react";
import { RENDERERS } from "@/lib/editor/sections";
import type { PropMap } from "@/lib/editor/types";

/** Thumbnails render the block at a small-laptop width so text stays legible once scaled. */
const PREVIEW_WIDTH = 1024;

/**
 * A section rendered at PREVIEW_WIDTH and scaled down into a thumbnail.
 * Without an explicit `scale` it fits the container's width.
 */
export function VariantPreview({
  variantId,
  defaults,
  scale,
  height = 120,
}: {
  variantId: string;
  defaults: PropMap;
  scale?: number;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.2);

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
  return (
    <div
      ref={ref}
      className="pointer-events-none relative w-full overflow-hidden bg-surface"
      // Blocks with a translucent fill (e.g. the sticky navbar) need their own colour behind them.
      style={{ height, background: typeof defaults.bg === "string" ? defaults.bg : undefined }}
      aria-hidden
    >
      <div
        style={{
          width: PREVIEW_WIDTH,
          transform: `scale(${scale ?? fit})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <R props={defaults} />
      </div>
    </div>
  );
}
