import { useLayoutEffect, useRef, useState } from "react";
import { RENDERERS } from "@/lib/editor/sections";
import type { PropMap } from "@/lib/editor/types";

/**
 * A section rendered at desktop width (1280px) and scaled down into a thumbnail.
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
    const measure = () => el.clientWidth && setFit(el.clientWidth / 1280);
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
      className="pointer-events-none relative w-full overflow-hidden bg-black"
      style={{ height }}
      aria-hidden
    >
      <div
        style={{
          width: 1280,
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
