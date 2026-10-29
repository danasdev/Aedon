import { useRef, useState, type ReactNode } from "react";
import type { EditableElement, ElementLayout } from "@/lib/editor/layout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  Copy,
  CornerLeftUp,
  EyeOff,
  Image as ImageIcon,
  Italic,
  Loader2,
  Minus,
  MousePointerClick,
  PaintBucket,
  Pencil,
  Plus,
  RotateCcw,
  Square,
  Trash2,
  Type,
  Upload,
} from "@/components/icons";

type SectionActions = {
  name: string;
  background: string;
  onBackground: (color: string) => void;
  onEditContent: () => void;
  contentOpen: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onHide: () => void;
  onRemove: () => void;
};

type ElementActions = {
  element: EditableElement;
  layout: ElementLayout;
  /** Current colour as rendered (used when the element has no override yet). */
  renderedColor: string;
  imageSrc: string;
  onPatch: (patch: Partial<ElementLayout>) => void;
  onEditText: () => void;
  onReplaceImage: (src: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onReset: () => void;
  modified: boolean;
  onBackToSection: () => void;
};

type Props =
  | { mode: "none"; hasSections: boolean }
  | { mode: "section"; section: SectionActions }
  | { mode: "element"; el: ElementActions; sectionName: string };

const KIND_ICON = { title: Type, text: Type, button: Square, image: ImageIcon };

/** The one place actions live. It changes with the selection and never covers the page. */
export function ContextToolbar(props: Props) {
  return (
    <TooltipProvider delayDuration={250}>
      <div
        data-editor-control
        className="editor-float-in flex h-12 items-center gap-0.5 overflow-x-auto rounded-[14px] border border-border bg-surface px-1.5 shadow-[inset_0_1px_0_rgb(245_244_241/0.06),0_16px_40px_-12px_rgb(0_0_0/0.8)] scrollbar-none"
      >
        {props.mode === "none" && (
          <span className="flex items-center gap-2 px-3 text-[13px] text-muted-foreground">
            <MousePointerClick className="h-4 w-4 text-ion" />
            {props.hasSections
              ? "Clique em qualquer parte do site para editar"
              : "Escolha uma página pronta ou adicione uma seção"}
          </span>
        )}
        {props.mode === "section" && <SectionTools {...props.section} />}
        {props.mode === "element" && <ElementTools {...props.el} sectionName={props.sectionName} />}
      </div>
    </TooltipProvider>
  );
}

function Tag({ icon: Icon, children }: { icon: typeof Type; children: ReactNode }) {
  return (
    <span className="mr-1 flex h-[30px] shrink-0 items-center gap-1.5 rounded-lg bg-ion/12 px-2.5 text-xs text-ion">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function Sep() {
  return <span className="mx-1 h-[22px] w-px shrink-0 bg-border" />;
}

function Tool({
  label,
  shortcut,
  onClick,
  pressed,
  disabled,
  danger,
  children,
}: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={pressed}
          className={`ae-ib ${danger ? "ae-ib-danger" : ""}`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {label}
        {shortcut && <kbd className="ml-2 font-mono text-xs opacity-60">{shortcut}</kbd>}
      </TooltipContent>
    </Tooltip>
  );
}

function ColorTool({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children?: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <label className="flex h-[34px] shrink-0 cursor-pointer items-center gap-2 rounded-[9px] px-2.5 text-[13px] text-foreground hover:bg-surface-2">
          {children}
          <span
            className="relative h-5 w-5 rounded-md shadow-[0_0_0_1px_rgb(245_244_241/0.28)]"
            style={{ background: value }}
          >
            <input
              type="color"
              aria-label={label}
              value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </span>
        </label>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

function SectionTools(s: SectionActions) {
  return (
    <>
      <Tag icon={Square}>{s.name}</Tag>
      <ColorTool label="Cor de fundo da seção" value={s.background} onChange={s.onBackground}>
        <PaintBucket className="h-4 w-4 text-muted-foreground" /> Fundo
      </ColorTool>
      <button
        type="button"
        onClick={s.onEditContent}
        aria-pressed={s.contentOpen}
        className="ae-btn ae-btn-primary ae-btn-sm mx-1 h-8 shadow-[0_3px_0_var(--ion-deep)]"
      >
        <Pencil className="h-3.5 w-3.5" /> Editar conteúdo
      </button>
      <Sep />
      <Tool label="Subir seção" onClick={() => s.onMove(-1)} disabled={!s.canMoveUp}>
        <ArrowUp className="h-4 w-4" />
      </Tool>
      <Tool label="Descer seção" onClick={() => s.onMove(1)} disabled={!s.canMoveDown}>
        <ArrowDown className="h-4 w-4" />
      </Tool>
      <Tool label="Duplicar seção" onClick={s.onDuplicate}>
        <Copy className="h-4 w-4" />
      </Tool>
      <Tool label="Ocultar seção (volta em Camadas)" onClick={s.onHide}>
        <EyeOff className="h-4 w-4" />
      </Tool>
      <Tool label="Excluir seção" shortcut="Ctrl Z desfaz" onClick={s.onRemove} danger>
        <Trash2 className="h-4 w-4" />
      </Tool>
    </>
  );
}

function ElementTools({ sectionName, ...el }: ElementActions & { sectionName: string }) {
  const isImage = el.element.kind === "image";
  const scale = el.layout.scale;
  const setScale = (next: number) => el.onPatch({ scale: Math.max(50, Math.min(200, next)) });
  return (
    <>
      <Tag icon={KIND_ICON[el.element.kind]}>{el.element.label}</Tag>
      {isImage ? (
        <ImageTool src={el.imageSrc} onReplace={el.onReplaceImage} onUpload={el.onUploadImage} />
      ) : (
        <button
          type="button"
          onClick={el.onEditText}
          className="ae-btn ae-btn-primary ae-btn-sm mx-1 h-8 shadow-[0_3px_0_var(--ion-deep)]"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar texto
        </button>
      )}
      <div className="mx-1 flex h-[34px] shrink-0 items-center rounded-[9px] border border-border bg-background">
        <button
          type="button"
          onClick={() => setScale(scale - 10)}
          className="ae-ib h-8 w-8"
          aria-label="Diminuir tamanho"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span
          className="min-w-11 text-center font-mono text-xs tabular-nums text-foreground"
          title="Tamanho"
        >
          {scale}%
        </span>
        <button
          type="button"
          onClick={() => setScale(scale + 10)}
          className="ae-ib h-8 w-8"
          aria-label="Aumentar tamanho"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {!isImage && (
        <>
          <Sep />
          <Tool
            label="Negrito"
            onClick={() => el.onPatch({ weight: el.layout.weight === 700 ? 0 : 700 })}
            pressed={el.layout.weight === 700}
          >
            <Bold className="h-4 w-4" />
          </Tool>
          <Tool
            label="Itálico"
            onClick={() => el.onPatch({ italic: !el.layout.italic })}
            pressed={el.layout.italic}
          >
            <Italic className="h-4 w-4" />
          </Tool>
          <Tool
            label="Alinhamento"
            onClick={() =>
              el.onPatch({
                align:
                  el.layout.align === ""
                    ? "center"
                    : el.layout.align === "center"
                      ? "right"
                      : el.layout.align === "right"
                        ? "left"
                        : "",
              })
            }
            pressed={el.layout.align !== ""}
          >
            {el.layout.align === "right" ? (
              <AlignRight className="h-4 w-4" />
            ) : el.layout.align === "center" ? (
              <AlignCenter className="h-4 w-4" />
            ) : (
              <AlignLeft className="h-4 w-4" />
            )}
          </Tool>
          <ColorTool
            label="Cor do texto"
            value={el.layout.color || el.renderedColor}
            onChange={(color) => el.onPatch({ color })}
          />
        </>
      )}
      <Sep />
      <Tool label="Voltar ao original" onClick={el.onReset} disabled={!el.modified}>
        <RotateCcw className="h-4 w-4" />
      </Tool>
      <Tool
        label={`Selecionar a seção (${sectionName})`}
        shortcut="Esc"
        onClick={el.onBackToSection}
      >
        <CornerLeftUp className="h-4 w-4" />
      </Tool>
    </>
  );
}

function ImageTool({
  src,
  onReplace,
  onUpload,
}: {
  src: string;
  onReplace: (src: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [url, setUrl] = useState(src);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <Popover onOpenChange={(open) => open && (setUrl(src), setError(null))}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ae-btn ae-btn-primary ae-btn-sm mx-1 h-8 shadow-[0_3px_0_var(--ion-deep)]"
        >
          <ImageIcon className="h-3.5 w-3.5" /> Trocar imagem
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-80 space-y-3 rounded-xl border-border bg-surface p-3"
        data-editor-control
      >
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="ae-btn w-full"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Enviar do computador
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            setError(null);
            try {
              onReplace(await onUpload(file));
            } catch {
              setError("Não deu para enviar essa imagem. Tente outra Ou cole um link.");
            } finally {
              setBusy(false);
            }
          }}
        />
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (url.trim()) onReplace(url.trim());
          }}
        >
          <label className="ae-label block" htmlFor="ae-image-url">
            Ou cole um link
          </label>
          <div className="flex gap-2">
            <input
              id="ae-image-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="ae-input h-9 min-h-0 text-[13px]"
              placeholder="https://…"
            />
            <button type="submit" className="ae-btn ae-btn-sm h-9">
              Usar
            </button>
          </div>
        </form>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </PopoverContent>
    </Popover>
  );
}
