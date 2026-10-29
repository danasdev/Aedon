import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useProject } from "@/lib/editor/store";
import { getVariant, RENDERERS } from "@/lib/editor/sections";
import { downloadHTML } from "@/lib/editor/export";
import {
  decodeLink,
  resolveHref,
  findPageOfSection,
  sectionAnchorId,
  type LinkOptions,
} from "@/lib/editor/links";
import {
  encodeElementLayout,
  elementLayout,
  parseElementLayout,
  type EditableElement,
  type ElementLayout,
} from "@/lib/editor/layout";
import { encodeImage, parseImage } from "@/lib/editor/images";
import { PAGE_PRESETS, type PagePreset } from "@/lib/editor/presets";
import { uuid } from "@/lib/editor/id";
import { findElementInPreview, imageSourceOf } from "@/lib/editor/preview";
import type { Device } from "@/lib/editor/types";
import { useCanvasDrag } from "@/hooks/use-canvas-drag";
import { useCloudSync } from "@/lib/supabase/sync";
import { uploadProjectImage } from "@/lib/supabase/image-upload";
import { signOut } from "@/lib/supabase/auth";
import { FileText, GripVertical, Layers, Palette, Plus, type LucideIcon } from "lucide-react";
import type { LinkResolver } from "./blocks/_link";
import { Canvas } from "./Canvas";
import { ContentDrawer } from "./ContentDrawer";
import { ContextToolbar } from "./ContextToolbar";
import { EditorTopBar } from "./EditorTopBar";
import { EmptyPageStart } from "./EmptyPageStart";
import { FontLoader } from "./FontLoader";
import { AddPanel, type NewElement } from "./panels/AddPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { PagesPanel } from "./panels/PagesPanel";
import { StylePanel } from "./panels/StylePanel";

type Panel = "add" | "pages" | "layers" | "style";

const RAIL: { id: Panel; label: string; Icon: LucideIcon }[] = [
  { id: "add", label: "adicionar", Icon: Plus },
  { id: "pages", label: "páginas", Icon: FileText },
  { id: "layers", label: "camadas", Icon: Layers },
  { id: "style", label: "estilo", Icon: Palette },
];

const NEW_ELEMENT_DEFAULTS: Record<NewElement, Record<string, string>> = {
  text: { text: "Escreva aqui" },
  button: { text: "Botão", link: "" },
  image: { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200", alt: "" },
  divider: {},
  box: { text: "Caixa de texto" },
};

/**
 * Scroll the canvas so the given section (inside the preview iframe) comes into view.
 * The iframe is full-height and doesn't scroll internally.
 */
function scrollCanvasToSection(sectionId: string, attempt = 0) {
  const iframe = document.querySelector("iframe");
  const main = iframe?.closest("main");
  const el = iframe?.contentDocument?.getElementById(sectionAnchorId(sectionId));
  if (!iframe || !main || !el) {
    if (attempt < 8) window.setTimeout(() => scrollCanvasToSection(sectionId, attempt + 1), 100);
    return;
  }
  const scale = iframe.offsetWidth ? iframe.getBoundingClientRect().width / iframe.offsetWidth : 1;
  // Instant, not smooth: smooth scrolling here is unreliable while the iframe re-measures.
  const targetScroll =
    main.scrollTop +
    (iframe.getBoundingClientRect().top - main.getBoundingClientRect().top) +
    el.getBoundingClientRect().top * scale -
    80;
  main.scrollTop = targetScroll;
  // The iframe grows after its nested root renders; retry until the section has room.
  if (attempt < 8 && Math.abs(main.scrollTop - targetScroll) > 24) {
    window.setTimeout(() => scrollCanvasToSection(sectionId, attempt + 1), 100);
  }
}

function rgbToHex(rgb: string) {
  const parts = rgb.match(/\d+(?:\.\d+)?/g)?.slice(0, 3);
  if (!parts || parts.length !== 3) return "#ffffff";
  return `#${parts.map((p) => Math.round(Number(p)).toString(16).padStart(2, "0")).join("")}`;
}

export function EditorShell({
  user,
  projectId,
  initialPreset,
  onPresetConsumed,
}: {
  user: User | null;
  projectId: string;
  /** Preset chosen in "Criar site"; applied once to the empty first page. */
  initialPreset?: string;
  onPresetConsumed?: () => void;
}) {
  const store = useProject(projectId);
  const syncStatus = useCloudSync({
    userId: user?.id ?? null,
    projectId,
    project: store.project,
    onLoad: store.replaceProject,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [previewMode, setPreviewMode] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [panel, setPanel] = useState<Panel | null>("add");
  const [contentOpen, setContentOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [editRequest, setEditRequest] = useState(0);
  const [elementInfo, setElementInfo] = useState({ color: "#ffffff", src: "" });

  const sections = store.activePage.sections;
  const selected = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? null,
    [sections, selectedId],
  );
  const selectedVariant = selected ? (getVariant(selected.variantId) ?? null) : null;

  // ---- responsive: side panels become overlays on narrow screens ----
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      setIsNarrow(mq.matches);
      if (mq.matches) {
        setPanel(null);
        setContentOpen(false);
      }
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ---- a preset picked in "Criar site" fills the empty first page once ----
  const presetApplied = useRef(false);
  useEffect(() => {
    // Wait until the saved project is in memory (local read, then the cloud row when signed in).
    if (!initialPreset || presetApplied.current || !store.hydrated) return;
    if (user && syncStatus !== "saved") return;
    presetApplied.current = true;
    const preset = PAGE_PRESETS.find((p) => p.id === initialPreset);
    if (preset && store.project.pages.length === 1 && store.activePage.sections.length === 0) {
      store.addComposition(preset.sectionIds);
    }
    onPresetConsumed?.();
  }, [initialPreset, syncStatus, store, user, onPresetConsumed]);

  // Selection is per page.
  useEffect(() => {
    setSelectedId(null);
    setSelectedElement(null);
    setContentOpen(false);
    setInsertIndex(null);
  }, [store.activePageId]);

  // A selection that no longer exists (deleted, undone, hidden) is dropped.
  useEffect(() => {
    if (selectedId && (!selected || selected.hidden)) {
      setSelectedId(null);
      setSelectedElement(null);
      setContentOpen(false);
    }
  }, [selectedId, selected]);

  // Read the selected element's rendered colour / image straight from the preview.
  useEffect(() => {
    if (!selectedId || !selectedElement) return;
    const node = findElementInPreview(selectedId, selectedElement.selector);
    if (!node) return;
    setElementInfo({
      color: rgbToHex(node.ownerDocument.defaultView?.getComputedStyle(node).color ?? ""),
      src: imageSourceOf(node),
    });
  }, [selectedId, selectedElement, sections]);

  const selectSection = useCallback((id: string | null) => {
    setSelectedId(id);
    setSelectedElement(null);
    if (!id) setContentOpen(false);
  }, []);

  // ---- keyboard: undo/redo, Esc walks the selection back up ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey && !typing) {
        e.preventDefault();
        store.undo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z")) &&
        !typing
      ) {
        e.preventDefault();
        store.redo();
      } else if (e.key === "Escape" && !typing) {
        if (selectedElement) setSelectedElement(null);
        else if (contentOpen) setContentOpen(false);
        else selectSection(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, selectedElement, contentOpen, selectSection]);

  // ---- adding things ----
  const afterAdd = useCallback(
    (id: string) => {
      setSelectedId(id);
      setSelectedElement(null);
      setInsertIndex(null);
      if (isNarrow) setPanel(null);
      window.setTimeout(() => scrollCanvasToSection(id), 120);
    },
    [isNarrow],
  );

  const addVariant = useCallback(
    (variantId: string) => afterAdd(store.addSection(variantId, insertIndex ?? undefined)),
    [store, insertIndex, afterAdd],
  );

  const canvasDrag = useCanvasDrag({
    getIframe: () => document.querySelector("iframe"),
    onDrop: (variantId, index) => afterAdd(store.addSection(variantId, index)),
    onTap: addVariant,
  });

  const insertPreset = (preset: PagePreset, destination: "current" | "new") => {
    const ids =
      destination === "new"
        ? store.addPresetPage(preset.name, preset.sectionIds)
        : store.addComposition(preset.sectionIds);
    if (ids[0]) afterAdd(ids[0]);
  };

  const elementTarget = selected?.id ?? sections[sections.length - 1]?.id ?? null;
  const addElement = (type: NewElement) => {
    const section = sections.find((s) => s.id === elementTarget);
    if (!section) return;
    const current = Array.isArray(section.props.customElements) ? section.props.customElements : [];
    store.updateProp(section.id, "customElements", [
      ...current,
      { _id: uuid(), type, ...NEW_ELEMENT_DEFAULTS[type] },
    ]);
    afterAdd(section.id);
  };

  const insertHint =
    insertIndex === null
      ? null
      : insertIndex >= sections.length
        ? "A próxima seção entra no fim da página."
        : `A próxima seção entra antes de “${getVariant(sections[insertIndex]?.variantId ?? "")?.name ?? "seção"}”.`;

  // ---- editing helpers ----
  const patchElement = (sectionId: string, selector: string, patch: Partial<ElementLayout>) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    const layout = parseElementLayout(section.props.elementLayout);
    store.updateProp(
      sectionId,
      "elementLayout",
      encodeElementLayout({
        ...layout,
        [selector]: { ...elementLayout(layout, selector), ...patch },
      }),
    );
  };

  const replaceImage = (sectionId: string, previous: string, next: string) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section || !previous) return;
    for (const [key, value] of Object.entries(section.props)) {
      if (typeof value === "string" && parseImage(value).src === previous) {
        store.updateProp(sectionId, key, encodeImage({ ...parseImage(value), src: next }));
        return;
      }
      if (Array.isArray(value)) {
        const item = value.find((entry) => parseImage(entry.src ?? "").src === previous);
        if (item) {
          store.updateListItem(
            sectionId,
            key,
            item._id,
            "src",
            encodeImage({ ...parseImage(item.src), src: next }),
          );
          return;
        }
      }
    }
  };

  const changeInlineText = (sectionId: string, previous: string, next: string) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    const candidates = new Set([previous, previous.replace(/^[“"']|[”"']$/g, "").trim()]);
    for (const [key, value] of Object.entries(section.props)) {
      if (typeof value === "string" && candidates.has(value)) {
        store.updateProp(sectionId, key, next);
        return;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          const field = Object.entries(item).find(
            ([name, itemValue]) => name !== "_id" && candidates.has(itemValue),
          );
          if (field) {
            store.updateListItem(sectionId, key, item._id, field[0], next);
            return;
          }
        }
      }
    }
  };

  const linkOptions = useMemo<LinkOptions>(
    () => ({
      pages: store.project.pages.map((p) => ({ id: p.id, name: p.name })),
      sections: store.project.pages.flatMap((p) =>
        p.sections.map((s) => ({
          id: s.id,
          label: `${p.name} · ${getVariant(s.variantId)?.name ?? s.variantId}`,
        })),
      ),
    }),
    [store.project.pages],
  );

  // In edit mode links are inert (null → clicks select); in preview they navigate.
  const resolveLink = useCallback<LinkResolver>(
    (encoded) => {
      if (!previewMode) return null;
      const target = decodeLink(encoded);
      if (target.kind === "none") return null;
      const href = resolveHref(store.project, store.activePageId, target);
      return {
        href,
        navigate: (e) => {
          e.preventDefault();
          if (target.kind === "url") {
            if (target.url) window.open(target.url, "_blank", "noopener,noreferrer");
            return;
          }
          if (target.kind === "page") {
            store.setActivePage(target.pageId);
            const main = document.querySelector("main");
            if (main) main.scrollTop = 0;
            return;
          }
          const page = findPageOfSection(store.project.pages, target.sectionId);
          if (!page) return;
          if (page.id !== store.activePageId) {
            store.setActivePage(page.id);
            setTimeout(() => scrollCanvasToSection(target.sectionId), 90);
          } else {
            scrollCanvasToSection(target.sectionId);
          }
        },
      };
    },
    [previewMode, store],
  );

  // ---- contextual toolbar ----
  const visibleSections = sections.filter((s) => !s.hidden);
  const visibleIndex = selected ? visibleSections.findIndex((s) => s.id === selected.id) : -1;
  const sectionLayout = selected ? parseElementLayout(selected.props.elementLayout) : {};

  const toolbar =
    selected && selectedVariant && selectedElement ? (
      <ContextToolbar
        key={`${selected.id}:${selectedElement.selector}`}
        mode="element"
        sectionName={selectedVariant.name}
        el={{
          element: selectedElement,
          layout: elementLayout(sectionLayout, selectedElement.selector),
          renderedColor: elementInfo.color,
          imageSrc: elementInfo.src,
          onPatch: (patch) => patchElement(selected.id, selectedElement.selector, patch),
          onEditText: () => setEditRequest((n) => n + 1),
          onReplaceImage: (src) => replaceImage(selected.id, elementInfo.src, src),
          onUploadImage: (file) => uploadProjectImage(file, user?.id ?? null),
          onReset: () => {
            const next = { ...sectionLayout };
            delete next[selectedElement.selector];
            store.updateProp(selected.id, "elementLayout", encodeElementLayout(next));
          },
          modified: !!sectionLayout[selectedElement.selector],
          onBackToSection: () => setSelectedElement(null),
        }}
      />
    ) : selected && selectedVariant ? (
      <ContextToolbar
        key={selected.id}
        mode="section"
        section={{
          name: selectedVariant.name,
          background: typeof selected.props.bg === "string" ? selected.props.bg : "#000000",
          onBackground: (color) => store.updateProp(selected.id, "bg", color),
          onEditContent: () => setContentOpen((open) => !open),
          contentOpen,
          canMoveUp: visibleIndex > 0,
          canMoveDown: visibleIndex >= 0 && visibleIndex < visibleSections.length - 1,
          onMove: (dir) => store.moveSection(selected.id, dir),
          onDuplicate: () => {
            store.duplicateSection(selected.id);
          },
          onHide: () => store.toggleHidden(selected.id),
          onRemove: () => store.removeSection(selected.id),
        }}
      />
    ) : (
      <ContextToolbar mode="none" hasSections={sections.length > 0} />
    );

  const togglePanel = (id: Panel) => {
    setPanel((current) => (current === id ? null : id));
    if (isNarrow) setContentOpen(false);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <FontLoader typography={store.project.typography} />
      <EditorTopBar
        project={store.project}
        onRenameProject={store.renameProject}
        onToggleBillingAddon={store.toggleBillingAddon}
        canUndo={store.canUndo}
        canRedo={store.canRedo}
        onUndo={store.undo}
        onRedo={store.redo}
        device={device}
        onDevice={setDevice}
        previewMode={previewMode}
        onTogglePreview={() => {
          setPreviewMode((v) => !v);
          selectSection(null);
        }}
        onExport={() => downloadHTML(store.project, store.activePageId)}
        email={user ? (user.email ?? "") : null}
        syncStatus={syncStatus}
        onSignOut={user ? () => void signOut() : undefined}
      />

      <div className="relative flex min-h-0 flex-1">
        {!previewMode && (
          <nav
            aria-label="Ferramentas"
            className="z-40 flex w-[76px] shrink-0 flex-col items-center gap-1 border-r border-border bg-panel pt-2.5"
          >
            {RAIL.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => togglePanel(id)}
                aria-pressed={panel === id}
                className={`flex h-[60px] w-[68px] flex-col items-center justify-center gap-1.5 rounded-xl font-mono text-[9.5px] transition-colors ${
                  panel === id
                    ? "bg-ion/10 text-ion shadow-[inset_0_0_0_1px_rgb(60_207_224/0.35)]"
                    : "text-faint hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </nav>
        )}

        {!previewMode && panel === "add" && (
          <AddPanel
            onAdd={addVariant}
            drag={{ start: canvasDrag.start }}
            elementTarget={elementTarget}
            onAddElement={addElement}
            insertHint={insertHint}
            onClearInsert={() => setInsertIndex(null)}
            hasSections={sections.length > 0}
            onInsertPreset={insertPreset}
            onClose={() => setPanel(null)}
            overlay={isNarrow}
          />
        )}
        {!previewMode && panel === "pages" && (
          <PagesPanel
            pages={store.project.pages}
            activePageId={store.activePageId}
            onSelect={(id) => {
              store.setActivePage(id);
              if (isNarrow) setPanel(null);
            }}
            onAdd={store.addPage}
            onRename={store.renamePage}
            onDuplicate={store.duplicatePage}
            onDelete={store.removePage}
            onMove={store.movePage}
            onClose={() => setPanel(null)}
            overlay={isNarrow}
          />
        )}
        {!previewMode && panel === "layers" && (
          <LayersPanel
            sections={sections}
            selectedId={selectedId}
            onSelect={(id) => {
              selectSection(id);
              window.setTimeout(() => scrollCanvasToSection(id), 60);
            }}
            onReorder={store.reorderSections}
            onToggleHidden={store.toggleHidden}
            onDuplicate={store.duplicateSection}
            onRemove={store.removeSection}
            onClose={() => setPanel(null)}
            overlay={isNarrow}
          />
        )}
        {!previewMode && panel === "style" && (
          <StylePanel
            typography={store.project.typography}
            onTypographyChange={store.updateTypography}
            colorSource={sections.length > 1 && selectedVariant ? selectedVariant.name : null}
            onApplyColorsToAll={() => selected && store.applyColorsToAllSections(selected.id)}
            onClose={() => setPanel(null)}
            overlay={isNarrow}
          />
        )}

        <Canvas
          device={device}
          sections={sections}
          selectedId={selectedId}
          onSelect={selectSection}
          selectedElement={selectedElement}
          onElementSelect={(sectionId, element) => {
            setSelectedId(sectionId);
            setSelectedElement(element);
          }}
          onElementLayoutChange={patchElement}
          onInteractionStart={store.beginInteraction}
          onInteractionEnd={store.endInteraction}
          onInlineTextChange={changeInlineText}
          onInsertAt={(index) => {
            setInsertIndex(index);
            setPanel("add");
            if (isNarrow) setContentOpen(false);
          }}
          insertIndex={insertIndex}
          editRequest={editRequest}
          renderers={RENDERERS}
          typography={store.project.typography}
          previewMode={previewMode}
          resolveLink={resolveLink}
          dropIndex={canvasDrag.dropIndex}
          dragging={canvasDrag.variantId !== null}
          toolbar={toolbar}
          emptyState={
            <EmptyPageStart
              onPick={(preset) => insertPreset(preset, "current")}
              onAddSection={() => {
                setInsertIndex(null);
                setPanel("add");
              }}
            />
          }
        />

        {!previewMode && contentOpen && selected && selectedVariant && (
          <ContentDrawer
            instance={selected}
            variant={selectedVariant}
            linkOptions={linkOptions}
            onChange={(k, v) => store.updateProp(selected.id, k, v)}
            onApplyColorsToAll={() => store.applyColorsToAllSections(selected.id)}
            canApplyColorsToAll={sections.length > 1}
            onListAdd={(k) => store.addListItem(selected.id, k)}
            onListRemove={(k, itemId) => store.removeListItem(selected.id, k, itemId)}
            onListChange={(k, itemId, field, value) =>
              store.updateListItem(selected.id, k, itemId, field, value)
            }
            onListMove={(k, itemId, dir) => store.moveListItem(selected.id, k, itemId, dir)}
            onListReorder={(k, fromId, toId) => store.reorderListItem(selected.id, k, fromId, toId)}
            onUploadImage={(file) => uploadProjectImage(file, user?.id ?? null)}
            onClose={() => setContentOpen(false)}
            overlay={isNarrow}
          />
        )}
      </div>

      {canvasDrag.variantId && canvasDrag.point && (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-lg border border-ion/50 bg-surface px-3 py-2 text-xs font-semibold text-foreground shadow-2xl"
          style={{ left: canvasDrag.point.x + 14, top: canvasDrag.point.y + 14 }}
        >
          <GripVertical className="h-3.5 w-3.5 text-ion" />
          {getVariant(canvasDrag.variantId)?.name ?? "Seção"}
        </div>
      )}
    </div>
  );
}
