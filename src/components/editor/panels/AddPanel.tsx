import { useMemo, useState } from "react";
import { CATEGORY_ORDER, VARIANTS, getVariant } from "@/lib/editor/sections";
import { PAGE_PRESETS, type PagePreset } from "@/lib/editor/presets";
import type { LibraryCategory } from "@/lib/editor/types";
import type { DragState } from "@/hooks/use-canvas-drag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Image,
  Minus,
  Search,
  Square,
  SquareDashed,
  Type,
  X,
  type LucideIcon,
} from "@/components/icons";
import { VariantPreview } from "../VariantPreview";
import { PanelShell } from "./PanelShell";

export type NewElement = "text" | "button" | "image" | "divider" | "box";

const CATEGORY_LABEL: Record<LibraryCategory, string> = {
  Header: "Menu",
  Hero: "Destaque",
  Corpo: "Conteúdo",
  Conversão: "Contato",
  Footer: "Rodapé",
};

const ELEMENTS: { type: NewElement; label: string; Icon: LucideIcon }[] = [
  { type: "text", label: "Texto", Icon: Type },
  { type: "button", label: "Botão", Icon: Square },
  { type: "image", label: "Imagem", Icon: Image },
  { type: "divider", label: "Divisor", Icon: Minus },
  { type: "box", label: "Caixa", Icon: SquareDashed },
];

interface Props {
  onAdd: (variantId: string) => void;
  drag: Pick<DragState, "start">;
  /** Section that receives loose elements (the selected one, or the last). Null when the page is empty. */
  elementTarget: string | null;
  onAddElement: (type: NewElement) => void;
  /** Shown when a "+ Adicionar seção" gap was clicked on the canvas. */
  insertHint: string | null;
  onClearInsert: () => void;
  hasSections: boolean;
  onInsertPreset: (preset: PagePreset, destination: "current" | "new") => void;
  onClose: () => void;
  overlay?: boolean;
}

export function AddPanel(props: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LibraryCategory | null>(null);
  const q = query.trim().toLowerCase();

  const items = useMemo(
    () =>
      VARIANTS.filter((v) => !category || v.category === category).filter(
        (v) =>
          !q ||
          v.name.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          (v.category ? CATEGORY_LABEL[v.category].includes(q) : false),
      ),
    [q, category],
  );

  return (
    <PanelShell title="Adicionar" onClose={props.onClose} overlay={props.overlay}>
      <div className="px-4">
        <label className="flex h-[38px] items-center gap-2 rounded-full border border-border bg-background pl-3.5 pr-2 text-muted-foreground focus-within:border-ion">
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar blocos"
            aria-label="Buscar blocos"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-faint"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="ae-ib h-6 w-6"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </div>

      {props.insertHint && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-ion/40 bg-ion/10 px-3 py-2 text-xs text-ion">
          <span className="flex-1">{props.insertHint}</span>
          <button
            type="button"
            onClick={props.onClearInsert}
            className="ae-ib h-6 w-6 text-ion"
            aria-label="Adicionar no fim da página"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div
        className="flex flex-wrap gap-1.5 px-4 pb-1 pt-3.5"
        role="group"
        aria-label="Filtrar por tipo"
      >
        <button
          type="button"
          className="ae-chip"
          aria-pressed={category === null}
          onClick={() => setCategory(null)}
        >
          Todos
        </button>
        {CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            className="ae-chip"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {!q && !category && (
        <>
          <p className="ae-label px-4 pb-2 pt-5">Elementos</p>
          <div className="grid grid-cols-5 gap-1.5 px-4">
            {ELEMENTS.map(({ type, label, Icon }) => (
              <button
                key={type}
                type="button"
                disabled={!props.elementTarget}
                title={
                  props.elementTarget
                    ? `Adicionar ${label} na seção`
                    : "Adicione uma seção primeiro"
                }
                onClick={() => props.onAddElement(type)}
                className="ae-tile flex h-16 flex-col items-center justify-center gap-1.5 text-foreground disabled:opacity-40"
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span className="text-xs text-faint">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <p className="ae-label px-4 pb-2 pt-5">Seções{q ? ` · ${items.length}` : ""}</p>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-muted-foreground">
          Nada encontrado para “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4">
          {items.map((v) => (
            <div
              key={v.id}
              role="button"
              tabIndex={0}
              title={v.description}
              // Press may become a drag onto the canvas or, if released in place, an add.
              onPointerDown={(e) => props.drag.start(v.id, e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  props.onAdd(v.id);
                }
              }}
              style={{ touchAction: "pan-y" }}
              className="group cursor-grab select-none outline-none active:cursor-grabbing"
            >
              <div className="ae-tile overflow-hidden p-1.5 group-hover:-translate-y-0.5 group-focus-visible:border-ion">
                <div className="overflow-hidden rounded-[6px]">
                  <VariantPreview variantId={v.id} defaults={v.defaults} height={72} />
                </div>
              </div>
              <p className="mt-1.5 truncate text-sm font-medium text-foreground">{v.name}</p>
              <p className="text-xs text-faint">{v.category ? CATEGORY_LABEL[v.category] : ""}</p>
            </div>
          ))}
        </div>
      )}

      {!q && !category && (
        <>
          <p className="ae-label px-4 pb-2 pt-6">Páginas prontas</p>
          <div className="grid grid-cols-2 gap-3 px-4 pb-6">
            {PAGE_PRESETS.map((preset) => (
              <DropdownMenu key={preset.id}>
                <DropdownMenuTrigger asChild>
                  {/* Not a <button>: the thumbnail renders the site's own buttons inside. */}
                  <div
                    role="button"
                    tabIndex={0}
                    title={preset.description}
                    className="group text-left outline-none"
                  >
                    <div className="ae-tile overflow-hidden p-1.5 group-hover:-translate-y-0.5 group-focus-visible:border-ion group-data-[state=open]:border-ion">
                      <div className="overflow-hidden rounded-[6px]">
                        {preset.sectionIds.slice(0, 3).map((id) => (
                          <VariantPreview
                            key={id}
                            variantId={id}
                            defaults={getVariant(id)?.defaults ?? {}}

                            height={24}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-medium text-foreground">
                      {preset.name}
                    </p>
                    <p className="text-xs text-faint">{preset.sectionIds.length} blocos</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onSelect={() => props.onInsertPreset(preset, "current")}>
                    {props.hasSections ? "Adicionar ao fim desta página" : "Usar nesta página"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => props.onInsertPreset(preset, "new")}>
                    Criar nova página com ele
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>
        </>
      )}
    </PanelShell>
  );
}
