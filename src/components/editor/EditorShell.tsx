import { useCallback, useMemo, useState, useEffect } from "react";
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
import { SectionLibrary } from "./SectionLibrary";
import { PropertiesPanel } from "./PropertiesPanel";
import { Canvas } from "./Canvas";
import { EditorTopBar } from "./EditorTopBar";
import { FontLoader } from "./FontLoader";
import { useLibraryPrefs } from "@/hooks/use-library-prefs";
import { useCanvasDrag } from "@/hooks/use-canvas-drag";
import { useCloudSync } from "@/lib/supabase/sync";
import { uploadProjectImage } from "@/lib/supabase/image-upload";
import { signOut } from "@/lib/supabase/auth";
import type { User } from "@supabase/supabase-js";
import type { LinkResolver } from "./blocks/_link";
import type { Device } from "@/lib/editor/types";
import { encodeElementLayout, elementLayout, parseElementLayout, type EditableElement } from "@/lib/editor/layout";
import { uuid } from "@/lib/editor/id";
import { encodeImage, parseImage } from "@/lib/editor/images";
import { GripVertical } from "lucide-react";
import type { PagePreset } from "@/lib/editor/presets";

/**
 * Scroll the outer canvas container so the given section (rendered inside the preview
 * iframe) comes into view. The iframe is full-height and doesn't scroll internally.
 */
function scrollCanvasToSection(sectionId: string, attempt = 0) {
  const iframe = document.querySelector("iframe");
  const main = iframe?.closest("main");
  const el = iframe?.contentDocument?.getElementById(sectionAnchorId(sectionId));
  if (!iframe || !main || !el) {
    if (attempt < 8) window.setTimeout(() => scrollCanvasToSection(sectionId, attempt + 1), 100);
    return;
  }
  const iframeTop = iframe.getBoundingClientRect().top;
  const mainTop = main.getBoundingClientRect().top;
  const elTop = el.getBoundingClientRect().top; // relative to the iframe viewport, before CSS scaling
  const scale = iframe.offsetWidth ? iframe.getBoundingClientRect().width / iframe.offsetWidth : 1;
  // Instant, not smooth: smooth scrolling on this container is unreliable while the
  // iframe is being re-measured, and silently no-ops in some engines.
  const targetScroll = main.scrollTop + (iframeTop - mainTop) + elTop * scale - 12;
  main.scrollTop = targetScroll;
  // The iframe grows after its nested React root renders. A first scroll can be
  // clamped against the old height; retry until the new section has room.
  if (attempt < 8 && Math.abs(main.scrollTop - targetScroll) > 24) {
    window.setTimeout(() => scrollCanvasToSection(sectionId, attempt + 1), 100);
  }
}

export function EditorShell({ user, projectId }: { user: User | null; projectId: string }) {
  const store = useProject(projectId);
  const syncStatus = useCloudSync({
    userId: user?.id ?? null,
    projectId,
    project: store.project,
    onLoad: store.replaceProject,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [previewMode, setPreviewMode] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [propsOpen, setPropsOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);

  const sections = store.activePage.sections;
  const libraryPrefs = useLibraryPrefs();

  // Adding a component: from a click/tap/keyboard (append) or a drag-drop (at an index).
  const activateVariant = useCallback(
    (variantId: string) => {
      const id = store.addSection(variantId);
      libraryPrefs.pushRecent(variantId);
      setSelectedId(id);
      setSelectedElement(null);
      setLibraryOpen(false);
      setPropsOpen(true);
      window.setTimeout(() => scrollCanvasToSection(id), 120);
    },
    [store, libraryPrefs],
  );

  const canvasDrag = useCanvasDrag({
    getIframe: () => document.querySelector("iframe"),
    onDrop: (variantId, index) => {
      const id = store.addSection(variantId, index);
      libraryPrefs.pushRecent(variantId);
      setSelectedId(id);
      setSelectedElement(null);
      setLibraryOpen(false);
      setPropsOpen(true);
      window.setTimeout(() => scrollCanvasToSection(id), 120);
    },
    onTap: activateVariant,
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      setIsNarrow(mq.matches);
      if (mq.matches) {
        setLibraryOpen(false);
        setPropsOpen(false);
      }
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const selected = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? null,
    [sections, selectedId],
  );

  // Selection is per-page; clear it when the active page changes.
  useEffect(() => {
    setSelectedId(null);
    setSelectedElement(null);
  }, [store.activePageId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        e.preventDefault();
        store.redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store]);

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

  // Resolve link targets. In edit mode links are inert (returns null → clicks select).
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
          // section: the iframe renders at full content height and does not scroll
          // internally, so scroll the outer canvas container to bring the target in view.
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

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      <FontLoader typography={store.project.typography} />
      <EditorTopBar
        projectName={store.project.name}
        onRenameProject={store.renameProject}
        pages={store.project.pages}
        activePageId={store.activePageId}
        onSelectPage={store.setActivePage}
        onAddPage={store.addPage}
        onRenamePage={store.renamePage}
        onDuplicatePage={store.duplicatePage}
        onDeletePage={store.removePage}
        onMovePage={store.movePage}
        canUndo={store.canUndo}
        canRedo={store.canRedo}
        onUndo={store.undo}
        onRedo={store.redo}
        device={device}
        onDevice={setDevice}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode((v) => !v)}
        onExport={() => downloadHTML(store.project, store.activePageId)}
        isNarrow={isNarrow}
        onOpenLibrary={() => { setLibraryOpen(!libraryOpen); if (!libraryOpen) setPropsOpen(false); }}
        propsOpen={propsOpen}
        onToggleProps={() => { setPropsOpen(!propsOpen); if (!propsOpen) setLibraryOpen(false); }}
        email={user ? (user.email ?? "") : null}
        syncStatus={syncStatus}
        onSignOut={user ? () => { signOut(); } : undefined}
      />

      {/* Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {!previewMode && (!isNarrow || libraryOpen) && (
          <SectionLibrary
            open={libraryOpen}
            onToggle={() => { setLibraryOpen(!libraryOpen); if (!libraryOpen) setPropsOpen(false); }}
            onAdd={activateVariant}
            onInsertPreset={(preset: PagePreset, destination) => {
              const ids = destination === "new"
                ? store.addPresetPage(preset.name, preset.sectionIds)
                : store.addComposition(preset.sectionIds);
              const firstId = ids[0] ?? null;
              setSelectedId(firstId);
              setSelectedElement(null);
              if (firstId) {
                setPropsOpen(true);
                window.setTimeout(() => scrollCanvasToSection(firstId), 140);
              }
              setLibraryOpen(false);
            }}
            sections={sections}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setSelectedElement(null);
              setPropsOpen(true);
              setLibraryOpen(false);
            }}
            onRemove={store.removeSection}
            onDuplicate={store.duplicateSection}
            onToggleHidden={store.toggleHidden}
            onMove={store.moveSection}
            onReorder={store.reorderSections}
            prefs={libraryPrefs}
            drag={{ start: canvasDrag.start }}
            overlay={isNarrow}
            onClose={() => setLibraryOpen(false)}
          />
        )}

        <Canvas
          device={device}
          sections={sections}
          selectedId={selectedId}
          onSelect={(id, focus = "section") => {
            setSelectedId(id);
            setSelectedElement(null);
            if (focus === "section") setPropsOpen(true);
            setLibraryOpen(false);
          }}
          onDuplicate={store.duplicateSection}
          onRemove={(id) => {
            store.removeSection(id);
            setSelectedId((selected) => (selected === id ? null : selected));
          }}
          onMove={store.moveSection}
          selectedElement={selectedElement}
          onElementSelect={(element) => {
            setSelectedElement(element);
            if (!element) setPropsOpen(true);
            setLibraryOpen(false);
          }}
          onElementLayoutChange={(sectionId, selector, patch) => {
            const section = sections.find((item) => item.id === sectionId);
            if (!section) return;
            const layout = parseElementLayout(section.props.elementLayout);
            store.updateProp(sectionId, "elementLayout", encodeElementLayout({
              ...layout,
              [selector]: { ...elementLayout(layout, selector), ...patch },
            }));
          }}
          onInteractionStart={store.beginInteraction}
          onInteractionEnd={store.endInteraction}
          onResetLayout={(sectionId) => {
            store.updateProp(sectionId, "elementLayout", "");
            setSelectedElement(null);
          }}
          onAddElement={(sectionId, type) => {
            const section = sections.find((item) => item.id === sectionId);
            if (!section) return;
            const defaults: Record<string, Record<string, string>> = {
              text: { text: "Escreva aqui" },
              button: { text: "Botão", link: "" },
              image: { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200", alt: "" },
              divider: {},
              box: { text: "Container" },
            };
            const current = Array.isArray(section.props.customElements) ? section.props.customElements : [];
            store.updateProp(sectionId, "customElements", [...current, { _id: uuid(), type, ...(defaults[type] ?? {}) }]);
          }}
          onInlineTextChange={(sectionId, previous, next) => {
            const section = sections.find((item) => item.id === sectionId);
            if (!section) return;
            const candidates = new Set([
              previous,
              previous.replace(/^[“"']|[”"']$/g, "").trim(),
            ]);
            for (const [key, value] of Object.entries(section.props)) {
              if (typeof value === "string" && candidates.has(value)) {
                store.updateProp(sectionId, key, next);
                return;
              }
              if (Array.isArray(value)) {
                for (const item of value) {
                  const field = Object.entries(item).find(([field, itemValue]) => field !== "_id" && candidates.has(itemValue));
                  if (field) {
                    store.updateListItem(sectionId, key, item._id, field[0], next);
                    return;
                  }
                }
              }
            }
          }}
          onImageChange={(sectionId, previous, next) => {
            const section = sections.find((item) => item.id === sectionId);
            if (!section) return;
            for (const [key, value] of Object.entries(section.props)) {
              if (typeof value === "string" && parseImage(value).src === previous) {
                store.updateProp(sectionId, key, encodeImage({ ...parseImage(value), src: next }));
                return;
              }
              if (Array.isArray(value)) {
                const item = value.find((entry) => parseImage(entry.src ?? "").src === previous);
                if (item) {
                  store.updateListItem(sectionId, key, item._id, "src", encodeImage({ ...parseImage(item.src), src: next }));
                  return;
                }
              }
            }
          }}
          onBackgroundChange={(sectionId, color) => store.updateProp(sectionId, "bg", color)}
          onSectionPropChange={(sectionId, key, value) => store.updateProp(sectionId, key, value)}
          renderers={RENDERERS}
          typography={store.project.typography}
          previewMode={previewMode}
          resolveLink={resolveLink}
          dropIndex={canvasDrag.dropIndex}
          dragging={canvasDrag.variantId !== null}
        />

        {!previewMode && propsOpen && (
          <PropertiesPanel
            instance={selected}
            variant={selected ? (getVariant(selected.variantId) ?? null) : null}
            typography={store.project.typography}
            linkOptions={linkOptions}
            project={store.project}
            onToggleBillingAddon={store.toggleBillingAddon}
            onUploadImage={(file) => uploadProjectImage(file, user?.id ?? null)}
            selectedElement={selectedElement}
            onChange={(k, v) => selected && store.updateProp(selected.id, k, v)}
            onApplyColorsToAll={() => selected && store.applyColorsToAllSections(selected.id)}
            canApplyColorsToAll={sections.length > 1}
            onListAdd={(k) => selected && store.addListItem(selected.id, k)}
            onListRemove={(k, itemId) => selected && store.removeListItem(selected.id, k, itemId)}
            onListChange={(k, itemId, field, value) =>
              selected && store.updateListItem(selected.id, k, itemId, field, value)
            }
            onListMove={(k, itemId, dir) =>
              selected && store.moveListItem(selected.id, k, itemId, dir)
            }
            onListReorder={(k, fromId, toId) =>
              selected && store.reorderListItem(selected.id, k, fromId, toId)
            }
            onTypographyChange={store.updateTypography}
            open={propsOpen}
            onToggle={() => setPropsOpen((v) => !v)}
            overlay={isNarrow}
            onClose={() => setPropsOpen(false)}
          />
        )}
      </div>

      {canvasDrag.variantId && canvasDrag.point && (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs font-medium text-foreground shadow-2xl backdrop-blur"
          style={{ left: canvasDrag.point.x + 14, top: canvasDrag.point.y + 14 }}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          {getVariant(canvasDrag.variantId)?.name ?? "Componente"}
        </div>
      )}
    </div>
  );
}
