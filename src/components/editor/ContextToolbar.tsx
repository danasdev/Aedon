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

export type SectionBackground = {
  /** Solid colour (also the gradient's start when none was picked yet). */
  base: string;
  gradient: boolean;
  from: string;
  to: string;
  direction: string;
  /** Second colour of a decorative glow, for blocks that have one. */
  glow?: string;
};

type SectionActions = {
  name: string;
  background: SectionBackground;
  onBackgroundChange: (patch: Record<string, string | boolean>) => void;
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
  /** Current colours as rendered (used when the element has no override yet). */
  renderedColor: string;
  renderedBg: string;
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
      <BackgroundTool value={s.background} onChange={s.onBackgroundChange} />
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
      {el.element.kind === "button" && (
        <>
          <Sep />
          <ColorTool
            label="Cor do botão"
            value={el.layout.bg || el.renderedBg}
            onChange={(bg) => el.onPatch({ bg })}
          >
            <PaintBucket className="h-4 w-4 text-muted-foreground" />
          </ColorTool>
          <CornerTool value={el.layout.radius} onChange={(radius) => el.onPatch({ radius })} />
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

const DIRECTIONS: { value: string; label: string; rotate: number }[] = [
  { value: "180deg", label: "De cima para baixo", rotate: 90 },
  { value: "90deg", label: "Da esquerda para a direita", rotate: 0 },
  { value: "135deg", label: "Diagonal", rotate: 45 },
  { value: "45deg", label: "Diagonal inversa", rotate: -45 },
];

/** Section fill: one colour, or a two-colour gradient (plus the glow on blocks that have one). */
function BackgroundTool({
  value: v,
  onChange,
}: {
  value: SectionBackground;
  onChange: (patch: Record<string, string | boolean>) => void;
}) {
  const preview = v.gradient ? `linear-gradient(${v.direction}, ${v.from}, ${v.to})` : v.base;
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-[34px] shrink-0 items-center gap-2 rounded-[9px] px-2.5 text-[13px] text-foreground hover:bg-surface-2 data-[state=open]:bg-surface-2"
            >
              <PaintBucket className="h-4 w-4 text-muted-foreground" /> Fundo
              <span className="flex -space-x-1.5">
                <Swatch color={v.gradient ? v.from : v.base} />
                {v.gradient && <Swatch color={v.to} />}
                {v.glow && <Swatch color={v.glow} round />}
              </span>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Fundo da seção</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-72 space-y-4 rounded-xl border-border bg-surface p-4"
        data-editor-control
      >
        <div
          className="h-14 rounded-lg shadow-[inset_0_0_0_1px_rgb(245_244_241/0.12)] transition-[background] duration-300"
          style={{ background: preview }}
        />
        <div className="ae-seg" role="radiogroup" aria-label="Tipo de fundo">
          <button
            type="button"
            role="radio"
            aria-checked={!v.gradient}
            aria-pressed={!v.gradient}
            onClick={() => onChange({ gradientEnabled: false })}
            className="flex-1 text-xs"
          >
            Cor sólida
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={v.gradient}
            aria-pressed={v.gradient}
            onClick={() =>
              onChange({ gradientEnabled: true, gradientFrom: v.from, gradientTo: v.to })
            }
            className="flex-1 text-xs"
          >
            Gradiente
          </button>
        </div>
        {v.gradient ? (
          <>
            <ColorRow
              label="Cor inicial"
              value={v.from}
              onChange={(c) => onChange({ gradientFrom: c })}
            />
            <ColorRow
              label="Cor final"
              value={v.to}
              onChange={(c) => onChange({ gradientTo: c })}
            />
            <div>
              <span className="ae-label mb-1.5 block">Direção</span>
              <div className="grid grid-cols-4 gap-1.5">
                {DIRECTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    title={d.label}
                    aria-label={d.label}
                    aria-pressed={v.direction === d.value}
                    onClick={() => onChange({ gradientDirection: d.value })}
                    className={`flex h-9 items-center justify-center rounded-lg border transition-colors ${
                      v.direction === d.value
                        ? "border-ion text-ion"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ArrowRightSmall rotate={d.rotate} />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <ColorRow label="Cor" value={v.base} onChange={(c) => onChange({ bg: c })} />
        )}
        {v.glow !== undefined && (
          <ColorRow label="Cor do brilho" value={v.glow} onChange={(c) => onChange({ glow: c })} />
        )}
      </PopoverContent>
    </Popover>
  );
}

function ArrowRightSmall({ rotate }: { rotate: number }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path
        d="M2.5 8h10m0 0L9 4.5M12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Swatch({ color, round }: { color: string; round?: boolean }) {
  return (
    <span
      className={`relative h-5 w-5 shadow-[0_0_0_1.5px_var(--surface),0_0_0_2.5px_rgb(245_244_241/0.28)] ${round ? "rounded-full" : "rounded-md"}`}
      style={{ background: color }}
    />
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const safe = /^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff";
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase text-muted-foreground">{safe}</span>
        <span
          className="relative h-8 w-8 rounded-lg shadow-[0_0_0_1px_rgb(245_244_241/0.28)]"
          style={{ background: safe }}
        >
          <input
            type="color"
            aria-label={label}
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </span>
      </span>
    </label>
  );
}

const CORNERS: { value: number; label: string; radius: string }[] = [
  { value: 0, label: "Cantos retos", radius: "0px" },
  { value: 8, label: "Cantos suaves", radius: "4px" },
  { value: 999, label: "Cantos redondos", radius: "999px" },
];

/** Button corners: straight, soft or pill. */
function CornerTool({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div
      className="mx-1 flex shrink-0 items-center gap-0.5"
      role="radiogroup"
      aria-label="Cantos do botão"
    >
      {CORNERS.map((c) => (
        <Tool
          key={c.value}
          label={c.label}
          pressed={value === c.value}
          onClick={() => onChange(value === c.value ? -1 : c.value)}
        >
          <span
            className="block h-3.5 w-5 border-[1.75px] border-current"
            style={{ borderRadius: c.radius }}
            aria-hidden
          />
        </Tool>
      ))}
    </div>
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
