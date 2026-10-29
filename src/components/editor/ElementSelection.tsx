import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { EditableElement, ElementLayout } from "@/lib/editor/layout";

type LayoutPatch = Partial<ElementLayout>;
type Handle =
  "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface Props {
  root: HTMLDivElement | null;
  element: EditableElement;
  layout: ElementLayout;
  onLayoutChange: (patch: LayoutPatch) => void;
  onInteractionStart: () => void;
  onInteractionEnd: (changed: boolean) => void;
}

/** Outline, resize handles and a name tag for the selected element. Actions live in the top toolbar. */
export function ElementSelection({
  root,
  element,
  layout,
  onLayoutChange,
  onInteractionStart,
  onInteractionEnd,
}: Props) {
  const [bounds, setBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    handle: Handle;
    x: number;
    y: number;
    width: number;
    height: number;
    widthPercent: number;
    layoutX: number;
    layoutY: number;
    changed: boolean;
  } | null>(null);

  const target = root?.querySelector<HTMLElement>(element.selector) ?? null;
  const canResizeHeight = element.kind === "image" || target?.tagName === "DIV";

  useLayoutEffect(() => {
    if (!root || !target) return;
    const measure = () => {
      const box = target.getBoundingClientRect();
      const parent = root.getBoundingClientRect();
      setBounds({
        left: box.left - parent.left,
        top: box.top - parent.top,
        width: box.width,
        height: box.height,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(target);
    const frameWindow = root.ownerDocument.defaultView;
    frameWindow?.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      frameWindow?.removeEventListener("resize", measure);
    };
  }, [root, target, layout]);

  if (!root || !target || !bounds) return null;

  const beginResize = (event: ReactPointerEvent<HTMLButtonElement>, handle: Handle) => {
    event.preventDefault();
    event.stopPropagation();
    onInteractionStart();
    resizeRef.current = {
      pointerId: event.pointerId,
      handle,
      x: event.clientX,
      y: event.clientY,
      width: target.getBoundingClientRect().width,
      height: target.getBoundingClientRect().height,
      widthPercent: layout.width,
      layoutX: layout.x,
      layoutY: layout.y,
      changed: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const resize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = resizeRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 2) return;
    const canvasScale = root.getBoundingClientRect().width / root.offsetWidth || 1;
    start.changed = true;
    const left = start.handle.includes("left");
    const right = start.handle.includes("right");
    const top = start.handle.includes("top");
    const bottom = start.handle.includes("bottom");
    const patch: LayoutPatch = {};
    if (left || right) {
      const nextWidth = Math.max(24, start.width + (left ? -dx : dx));
      // Percentage width is relative to the element's grid/flex area, which may
      // be much narrower than its parent (for example a two-column hero).
      patch.width = Math.max(
        5,
        Math.min(100, Math.round((start.widthPercent * nextWidth) / start.width)),
      );
      if (left)
        patch.x = Math.max(-360, Math.min(360, Math.round(start.layoutX + dx / canvasScale)));
    }
    if (canResizeHeight && (top || bottom)) {
      patch.height = Math.max(
        40,
        Math.min(1600, Math.round((start.height + (top ? -dy : dy)) / canvasScale)),
      );
      if (top)
        patch.y = Math.max(-360, Math.min(360, Math.round(start.layoutY + dy / canvasScale)));
    }
    if (Object.keys(patch).length) onLayoutChange(patch);
  };

  const handles: { name: Handle; style: string }[] = canResizeHeight
    ? [
        { name: "top-left", style: "-left-[6px] -top-[6px] cursor-nwse-resize" },
        { name: "top-right", style: "-right-[6px] -top-[6px] cursor-nesw-resize" },
        { name: "bottom-left", style: "-bottom-[6px] -left-[6px] cursor-nesw-resize" },
        { name: "bottom-right", style: "-bottom-[6px] -right-[6px] cursor-nwse-resize" },
      ]
    : [
        { name: "left", style: "-left-[6px] top-1/2 -translate-y-1/2 cursor-ew-resize" },
        { name: "right", style: "-right-[6px] top-1/2 -translate-y-1/2 cursor-ew-resize" },
      ];

  const tagBelow = bounds.top < 28;

  return (
    <div
      data-editor-control
      className="pointer-events-none absolute z-40 rounded-[3px] border-2 border-[#3ccfe0] shadow-[0_0_0_1px_rgba(10,10,10,0.55)]"
      style={{ left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height }}
      onClick={(event) => event.stopPropagation()}
    >
      <span
        className={`absolute left-[-2px] rounded-[5px] bg-[#3ccfe0] px-2 py-[3px] text-[11px] font-bold leading-none text-[#0a0a0a] ${
          tagBelow ? "top-[calc(100%+6px)]" : "bottom-[calc(100%+6px)]"
        }`}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {element.label.toLowerCase()}
      </span>
      {handles.map(({ name, style }) => (
        <button
          key={name}
          type="button"
          aria-label="Arraste para redimensionar"
          className={`pointer-events-auto absolute h-3 w-3 touch-none rounded-[3px] border-2 border-[#3ccfe0] bg-[#f5f4f1] ${style}`}
          onPointerDown={(event) => beginResize(event, name)}
          onPointerMove={resize}
          onPointerUp={(event) => {
            if (resizeRef.current?.pointerId === event.pointerId) {
              onInteractionEnd(resizeRef.current.changed);
              resizeRef.current = null;
            }
          }}
          onPointerCancel={() => {
            onInteractionEnd(resizeRef.current?.changed ?? false);
            resizeRef.current = null;
          }}
        />
      ))}
    </div>
  );
}
