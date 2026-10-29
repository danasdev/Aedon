import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Device, PropMap, SectionInstance, Typography } from "@/lib/editor/types";
import { typographyVars } from "@/lib/editor/typography";
import { sectionAnchorId } from "@/lib/editor/links";
import { entryAnimation, scrollEffect, sectionBackground } from "@/lib/editor/effects";
import {
  elementLayout,
  elementLayoutCss,
  parseElementLayout,
  type EditableElement,
  type ElementLayout,
} from "@/lib/editor/layout";
import { getVariant } from "@/lib/editor/sections";
import { LinkProvider, type LinkResolver } from "./blocks/_link";
import { CustomElements } from "./blocks/CustomElements";
import { DeviceFrame } from "./DeviceFrame";
import { ElementSelection } from "./ElementSelection";
import { Minus, Plus } from "@/components/icons";

interface Props {
  device: Device;
  sections: SectionInstance[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  selectedElement: EditableElement | null;
  onElementSelect: (sectionId: string, element: EditableElement | null) => void;
  onElementLayoutChange: (
    sectionId: string,
    selector: string,
    patch: Partial<ElementLayout>,
  ) => void;
  onInteractionStart: () => void;
  onInteractionEnd: (changed: boolean) => void;
  onInlineTextChange: (sectionId: string, previous: string, next: string) => void;
  /** Opens the add panel targeting this position in the page. */
  onInsertAt: (index: number) => void;
  /** Index the next added section will go to (highlighted), if any. */
  insertIndex: number | null;
  /** Bumped by the toolbar's "Editar texto" to start inline editing on the selected element. */
  editRequest: number;
  /** Section to highlight briefly after it was added, moved, duplicated or restored. */
  flash: { id: string; nonce: number } | null;
  /** Section playing its exit animation just before it is removed. */
  leavingId: string | null;
  renderers: Record<string, ComponentType<{ props: PropMap }>>;
  typography: Typography;
  previewMode: boolean;
  resolveLink: LinkResolver;
  /** Index where a dragged component would be inserted, or null when not dragging over the canvas. */
  dropIndex: number | null;
  /** True while a library component is being dragged (disables iframe interaction). */
  dragging: boolean;
  /** Contextual toolbar, pinned to the top of the canvas (outside the page). */
  toolbar?: ReactNode;
  /** Rendered in place of the page frame when the page has no visible sections. */
  emptyState?: ReactNode;
}

/** Everything the layout engine may nudge/resize (kept broad so saved layouts keep applying). */
const EDITABLE_SELECTOR = "div, h1, h2, h3, p, a, button, img, blockquote, figcaption, li, details";
/** What a click may select: real content only. Wrappers fall through to the section. */
const TEXT_SELECTOR = "h1, h2, h3, h4, p, a, button, blockquote, figcaption, li, summary";
const INLINE_TEXT_SELECTOR = "h1, h2, h3, h4, p, a, button, blockquote, figcaption, li, summary";

function elementSelector(element: HTMLElement, root: HTMLElement) {
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  while (current && current !== root) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) return null;
    const tag = current.tagName.toLowerCase();
    const sameTag = Array.from(parent.children).filter(
      (child: Element) => child.tagName.toLowerCase() === tag,
    );
    parts.unshift(`${tag}:nth-of-type(${sameTag.indexOf(current) + 1})`);
    current = parent;
  }
  return current === root ? parts.join(" > ") : null;
}

function hasOwnText(element: HTMLElement) {
  return Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim(),
  );
}

function elementKind(element: HTMLElement): EditableElement["kind"] {
  if (
    element.tagName === "IMG" ||
    Array.from(element.children).some((child) => child.tagName === "IMG")
  )
    return "image";
  const tag = element.tagName.toLowerCase();
  if (tag === "a" || tag === "button") return "button";
  if (/^h[1-4]$/.test(tag)) return "title";
  return "text";
}

const KIND_LABEL: Record<EditableElement["kind"], string> = {
  title: "Título",
  text: "Texto",
  button: "Botão",
  image: "Imagem",
};

function editableTarget(clicked: HTMLElement, root: HTMLElement) {
  const image = clicked.closest("img");
  if (image && root.contains(image) && image.parentElement && image.parentElement !== root) {
    return image.parentElement;
  }
  const text = clicked.closest<HTMLElement>(TEXT_SELECTOR);
  if (text && root.contains(text)) return text;
  // A plain <div> counts only when it directly holds text (e.g. a stat number).
  const box = clicked.closest<HTMLElement>("div");
  return box && box !== root && root.contains(box) && hasOwnText(box) ? box : null;
}

function SectionLayout({
  props,
  background,
  canCanvasEdit,
  selected,
  editRequest,
  onSelect,
  onLayoutChange,
  onInteractionStart,
  onInteractionEnd,
  onInlineTextChange,
  children,
}: {
  props: PropMap;
  /** The section surface owns the background so it expands with every module. */
  background: string;
  canCanvasEdit: boolean;
  selected: EditableElement | null;
  editRequest: number;
  onSelect: (element: EditableElement | null) => void;
  onLayoutChange: (selector: string, patch: Partial<ElementLayout>) => void;
  onInteractionStart: () => void;
  onInteractionEnd: (changed: boolean) => void;
  onInlineTextChange: (previous: string, next: string) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    selector: string;
    startX: number;
    startY: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const layout = parseElementLayout(props.elementLayout);
    const originals = new Map<HTMLElement, string>();
    root.querySelectorAll<HTMLElement>(EDITABLE_SELECTOR).forEach((element) => {
      if (element.closest("[data-editor-control]")) return;
      const selector = elementSelector(element, root);
      if (!selector) return;
      originals.set(element, element.getAttribute("style") ?? "");
      const style = layout[selector];
      if (style) {
        for (const [key, value] of Object.entries(elementLayoutCss(style)))
          element.style.setProperty(key, value);
      }
      if (canCanvasEdit) {
        element.style.cursor = selected?.selector === selector ? "grab" : "pointer";
        if (!element.isContentEditable) element.style.userSelect = "none";
      }
    });
    return () =>
      originals.forEach((style, element) => {
        if (style) element.setAttribute("style", style);
        else element.removeAttribute("style");
      });
  }, [props.elementLayout, canCanvasEdit, selected?.selector]);

  const startInlineEdit = (target: HTMLElement) => {
    const previous = target.textContent?.trim() ?? "";
    if (!previous) return;
    target.contentEditable = "true";
    target.style.userSelect = "text";
    target.spellcheck = true;
    target.style.outline = "2px solid #3ccfe0";
    target.style.outlineOffset = "4px";
    target.focus();
    const range = target.ownerDocument.createRange();
    range.selectNodeContents(target);
    const selection = target.ownerDocument.defaultView?.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    target.onkeydown = (event) => {
      if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) {
        event.preventDefault();
        target.blur();
      }
    };
    target.onblur = () => {
      const next = target.textContent?.trim() ?? "";
      target.contentEditable = "false";
      target.style.userSelect = "none";
      target.style.outline = "";
      target.style.outlineOffset = "";
      target.onblur = null;
      target.onkeydown = null;
      if (next && next !== previous) onInlineTextChange(previous, next);
    };
  };

  // The toolbar's "Editar texto" asks for inline editing of the current selection.
  const lastRequest = useRef(editRequest);
  useEffect(() => {
    if (editRequest === lastRequest.current) return;
    lastRequest.current = editRequest;
    if (!selected) return;
    const target = ref.current?.querySelector<HTMLElement>(selected.selector);
    if (target) startInlineEdit(target);
    // startInlineEdit only reads refs and the latest callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRequest, selected]);

  return (
    <div
      ref={ref}
      data-section-root
      onPointerDownCapture={(event) => {
        if (!canCanvasEdit || event.button !== 0 || event.detail > 1) return;
        if ((event.target as HTMLElement).closest("[data-editor-control]")) return;
        if ((event.target as HTMLElement).isContentEditable) return;
        const root = ref.current;
        if (!root) return;
        const target = editableTarget(event.target as HTMLElement, root);
        if (!target) return;
        const selector = elementSelector(target, root);
        if (!selector || selected?.selector !== selector) return;
        const layout = elementLayout(parseElementLayout(props.elementLayout), selector);
        dragRef.current = {
          pointerId: event.pointerId,
          selector,
          startX: event.clientX,
          startY: event.clientY,
          x: layout.x,
          y: layout.y,
          moved: false,
        };
        onInteractionStart();
      }}
      onPointerMoveCapture={(event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.moved && Math.hypot(dx, dy) < 4) return;
        if (!drag.moved) event.currentTarget.setPointerCapture(event.pointerId);
        drag.moved = true;
        event.preventDefault();
        const canvasScale =
          event.currentTarget.getBoundingClientRect().width / event.currentTarget.offsetWidth || 1;
        onLayoutChange(drag.selector, {
          x: Math.max(-360, Math.min(360, drag.x + Math.round(dx / canvasScale))),
          y: Math.max(-360, Math.min(360, drag.y + Math.round(dy / canvasScale))),
        });
      }}
      onPointerUpCapture={(event) => {
        if (dragRef.current?.pointerId === event.pointerId) {
          suppressClickRef.current = dragRef.current.moved;
          if (dragRef.current.moved)
            window.setTimeout(() => {
              suppressClickRef.current = false;
            }, 0);
          onInteractionEnd(dragRef.current.moved);
          dragRef.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancelCapture={() => {
        if (dragRef.current) onInteractionEnd(dragRef.current.moved);
        dragRef.current = null;
      }}
      onClickCapture={(event) => {
        if (!canCanvasEdit) return;
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        const clicked = event.target as HTMLElement;
        if (clicked.closest("[data-editor-control]")) return;
        if (clicked.isContentEditable) return;
        const root = ref.current;
        const target = root ? editableTarget(clicked, root) : null;
        event.preventDefault();
        event.stopPropagation();
        // Anything that is not real content (wrappers, empty space) selects the section.
        const selector = target && root && target !== root ? elementSelector(target, root) : null;
        if (!target || !selector) {
          onSelect(null);
          return;
        }
        const kind = elementKind(target);
        onSelect({ selector, kind, label: KIND_LABEL[kind] });
      }}
      onDoubleClickCapture={(event) => {
        if (!canCanvasEdit) return;
        if ((event.target as HTMLElement).closest("[data-editor-control]")) return;
        const target = (event.target as HTMLElement).closest<HTMLElement>(INLINE_TEXT_SELECTOR);
        const root = ref.current;
        if (!target || !root?.contains(target)) return;
        dragRef.current = null;
        event.preventDefault();
        event.stopPropagation();
        startInlineEdit(target);
      }}
      className="relative"
      style={{ background }}
    >
      {children}
      {selected && (
        <ElementSelection
          key={selected.selector}
          root={ref.current}
          element={selected}
          layout={elementLayout(parseElementLayout(props.elementLayout), selected.selector)}
          onLayoutChange={(patch) => onLayoutChange(selected.selector, patch)}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
        />
      )}
    </div>
  );
}

const WIDTHS: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };
const FRAME_PADDING = 32; // px around the scaled frame
const TOOLBAR_SPACE = 72; // px above the frame reserved for the contextual toolbar

function DropIndicator() {
  return <div className="my-1.5 h-1 rounded-full bg-[#3ccfe0] animate-pulse" />;
}

/** Hover target between two sections: "+ Adicionar seção" inserts exactly there. */
function InsertGap({
  index,
  active,
  onInsert,
}: {
  index: number;
  active: boolean;
  onInsert: (index: number) => void;
}) {
  return (
    <div data-editor-control className="group/gap relative z-30 h-0">
      <div className="absolute inset-x-0 -top-3 h-6" />
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[#3ccfe0] transition-opacity ${
          active ? "opacity-100" : "opacity-0 group-hover/gap:opacity-100"
        }`}
      />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onInsert(index);
        }}
        className={`absolute left-1/2 top-0 flex h-8 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-[#3ccfe0] px-4 text-[13px] font-semibold text-[#0a0a0a] shadow-[0_3px_0_#1a8a99] transition-opacity ${
          active ? "opacity-100" : "opacity-0 group-hover/gap:opacity-100 focus-visible:opacity-100"
        }`}
        style={{ fontFamily: "Geist, Inter, sans-serif" }}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.6} /> Adicionar seção
      </button>
    </div>
  );
}

function SectionMotion({ props, children }: { props: PropMap; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const animation = entryAnimation(props);
  const effect = scrollEffect(props);
  const [visible, setVisible] = useState(animation === "none");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const win = el?.ownerDocument.defaultView;
    if (!el || !win) return;
    const parentWin = win.parent;
    const frame = win.frameElement as HTMLElement | null;
    const scrollRoot = frame && parentWin !== win ? parentWin.document.querySelector("main") : null;

    const update = () => {
      const sectionRect = el.getBoundingClientRect();
      const frameRect = frame?.getBoundingClientRect();
      const rootRect = scrollRoot?.getBoundingClientRect();
      const viewportTop = rootRect?.top ?? 0;
      const viewportHeight = scrollRoot?.clientHeight ?? win.innerHeight;
      const top = (frameRect?.top ?? 0) + sectionRect.top;
      const centerDelta =
        (viewportTop + viewportHeight / 2 - (top + sectionRect.height / 2)) / viewportHeight;
      const inView =
        top + sectionRect.height > viewportTop + 40 && top < viewportTop + viewportHeight - 40;
      setVisible((wasVisible) => wasVisible || inView);
      setOffset(Math.max(-1, Math.min(1, centerDelta)));
    };

    update();
    scrollRoot?.addEventListener("scroll", update, { passive: true });
    win.addEventListener("scroll", update, { passive: true });
    win.addEventListener("resize", update);
    return () => {
      scrollRoot?.removeEventListener("scroll", update);
      win.removeEventListener("scroll", update);
      win.removeEventListener("resize", update);
    };
  }, []);

  const entryTransform = !visible
    ? animation === "slide-up"
      ? "translateY(28px)"
      : animation === "slide-left"
        ? "translateX(-28px)"
        : animation === "zoom"
          ? "scale(0.96)"
          : "none"
    : "none";
  const parallaxTransform =
    effect === "parallax" ? `translateY(${Math.round(offset * 22)}px)` : "none";
  const opacity =
    !visible && animation !== "none" ? 0 : effect === "fade" ? 1 - Math.abs(offset) * 0.25 : 1;

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transform: `${entryTransform} ${parallaxTransform}`,
        transition:
          "opacity 650ms cubic-bezier(.2,.8,.2,1), transform 650ms cubic-bezier(.2,.8,.2,1)",
        willChange: animation !== "none" || effect !== "none" ? "transform, opacity" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function Canvas({
  device,
  sections,
  selectedId,
  onSelect,
  selectedElement,
  onElementSelect,
  onElementLayoutChange,
  onInteractionStart,
  onInteractionEnd,
  onInlineTextChange,
  onInsertAt,
  insertIndex,
  editRequest,
  flash,
  leavingId,
  renderers,
  typography,
  previewMode,
  resolveLink,
  dropIndex,
  dragging,
  toolbar,
  emptyState,
}: Props) {
  const width = WIDTHS[device];
  const visible = sections.filter((s) => !s.hidden && renderers[s.variantId]);

  const mainRef = useRef<HTMLElement>(null);
  const [availableWidth, setAvailableWidth] = useState(width);
  const [frameHeight, setFrameHeight] = useState(600);
  const [zoom, setZoom] = useState<"fit" | number>("fit");

  // Track the horizontal room the canvas actually has so the frame scales to fit
  // instead of overflowing (centering would push half the overflow off-screen).
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const measure = () => setAvailableWidth(Math.max(0, el.clientWidth - FRAME_PADDING * 2));
    // Side panels settle after mount, so re-measure a few times before trusting the width.
    measure();
    const t1 = window.requestAnimationFrame(measure);
    const t2 = window.setTimeout(measure, 150);
    const t3 = window.setTimeout(measure, 500);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      window.cancelAnimationFrame(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      ro.disconnect();
    };
  }, []);

  const fitScale = Math.min(1, availableWidth / width);
  const scale = zoom === "fit" ? fitScale : zoom;
  const changeZoom = (step: number) => {
    const current = zoom === "fit" ? fitScale : zoom;
    setZoom(Math.max(0.35, Math.min(1.5, Math.round((current + step) * 10) / 10)));
  };
  const siteStyle: CSSProperties = {
    ...typographyVars(typography),
    fontFamily: "var(--site-body-font)",
    fontWeight: "var(--site-body-weight, 400)",
    lineHeight: "var(--site-line-height, 1.5)",
    letterSpacing: "var(--site-letter-spacing, 0)",
    fontSize: "var(--site-base-size, 16px)",
    background: "#000",
    // The preview iframe is sized from its content. Using 100vh here feeds its
    // current height back into the next measurement and grows it indefinitely.
    minHeight: 600,
  };

  const editing = !previewMode;

  const content = (
    <LinkProvider value={resolveLink}>
      <div style={siteStyle} onClick={editing ? () => onSelect(null) : undefined}>
        {visible.map((s, i) => {
          const R = renderers[s.variantId]!;
          const active = editing && s.id === selectedId;
          const name = getVariant(s.variantId)?.name ?? "Seção";
          return (
            <div key={s.id}>
              {dragging && dropIndex === i && <DropIndicator />}
              {editing && !dragging && i > 0 && (
                <InsertGap
                  index={sections.indexOf(s)}
                  active={insertIndex === sections.indexOf(s)}
                  onInsert={onInsertAt}
                />
              )}
              <div
                id={sectionAnchorId(s.id)}
                onClick={
                  editing
                    ? (e) => {
                        e.stopPropagation();
                        onSelect(s.id);
                      }
                    : undefined
                }
                className={`group/section relative ${editing ? "editor-canvas-section cursor-pointer" : ""} ${leavingId === s.id ? "ae-leave" : ""}`}
              >
                <SectionMotion props={s.props}>
                  <SectionLayout
                    props={s.props}
                    background={sectionBackground(s.props)}
                    canCanvasEdit={editing}
                    selected={active ? selectedElement : null}
                    editRequest={editRequest}
                    onSelect={(element) => onElementSelect(s.id, element)}
                    onLayoutChange={(selector, patch) =>
                      onElementLayoutChange(s.id, selector, patch)
                    }
                    onInteractionStart={onInteractionStart}
                    onInteractionEnd={onInteractionEnd}
                    onInlineTextChange={(previous, next) =>
                      onInlineTextChange(s.id, previous, next)
                    }
                  >
                    {/* The surface above owns the fill; children stay transparent so an
                        added module extends the same background. */}
                    <R props={{ ...s.props, bg: "transparent" }} />
                    <CustomElements props={s.props} />
                  </SectionLayout>
                </SectionMotion>
                {editing && flash?.id === s.id && (
                  <div
                    key={flash.nonce}
                    data-editor-control
                    className="ae-flash pointer-events-none absolute inset-0 z-20"
                  />
                )}
                {editing && (
                  <div
                    data-editor-control
                    className={`pointer-events-none absolute inset-0 z-20 transition-shadow ${
                      active && !selectedElement
                        ? "shadow-[inset_0_0_0_2px_#3ccfe0]"
                        : active
                          ? "shadow-[inset_0_0_0_1px_rgba(60,207,224,0.45)]"
                          : "group-hover/section:shadow-[inset_0_0_0_1px_rgba(60,207,224,0.4)]"
                    }`}
                  >
                    {active && !selectedElement && (
                      <span
                        className="absolute left-2 top-2 rounded-[5px] bg-[#3ccfe0] px-2 py-[3px] text-xs font-semibold leading-none text-[#0a0a0a]"
                        style={{ fontFamily: "Geist, Inter, sans-serif" }}
                      >
                        {name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {dragging && dropIndex === visible.length && visible.length > 0 && <DropIndicator />}
        {editing && !dragging && visible.length > 0 && (
          <div className="relative h-14">
            <InsertGap
              index={sections.length}
              active={insertIndex === sections.length}
              onInsert={onInsertAt}
            />
          </div>
        )}
      </div>
    </LinkProvider>
  );

  const showEmpty = editing && !!emptyState && visible.length === 0 && !dragging;

  return (
    <div
      data-tour="canvas"
      className="relative min-w-0 flex-1 bg-[radial-gradient(120%_80%_at_50%_0%,var(--panel),var(--void))]"
    >
      <main
        ref={mainRef}
        className="absolute inset-0 overflow-auto scrollbar-thin"
        style={{
          padding: `${editing ? TOOLBAR_SPACE : FRAME_PADDING}px ${FRAME_PADDING}px ${FRAME_PADDING}px`,
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && editing) onSelect(null);
        }}
      >
        {showEmpty ? (
          emptyState
        ) : (
          <div
            className={`flex min-h-full items-start ${width * scale > availableWidth ? "justify-start" : "justify-center"}`}
          >
            {/* Reserves the scaled footprint so centering never overflows; the frame renders
                at full device width and is scaled visually, keeping breakpoints accurate. */}
            <div className="shrink-0" style={{ width: width * scale, height: frameHeight * scale }}>
              <div
                className="origin-top-left transition-transform duration-200 ease-out"
                style={{
                  width,
                  transform: `scale(${scale})`,
                  boxShadow: "0 0 0 1px var(--hairline), 0 30px 80px -24px rgba(0,0,0,0.9)",
                  borderRadius: device === "desktop" ? 12 : 24,
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                <DeviceFrame width={width} interactive={!dragging} onHeightChange={setFrameHeight}>
                  {content}
                </DeviceFrame>
              </div>
            </div>
          </div>
        )}
      </main>

      {editing && toolbar && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-4">
          <div data-tour="toolbar" className="pointer-events-auto max-w-full">
            {toolbar}
          </div>
        </div>
      )}

      {!showEmpty && (
        <div
          role="group"
          aria-label="Zoom do canvas"
          className="absolute bottom-4 right-4 z-30 flex h-9 items-center gap-0.5 rounded-full border border-border bg-surface px-1 text-xs text-muted-foreground"
        >
          <button
            type="button"
            onClick={() => changeZoom(-0.1)}
            aria-label="Diminuir zoom"
            className="ae-ib h-7 w-7 rounded-full"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom("fit")}
            title="Ajustar à tela"
            className={`h-7 min-w-12 rounded-full px-1 tabular-nums ${zoom === "fit" ? "text-foreground" : "hover:text-foreground"}`}
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={() => changeZoom(0.1)}
            aria-label="Aumentar zoom"
            className="ae-ib h-7 w-7 rounded-full"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
