import { ArrowDown, ArrowUp, Copy, Image, Minus, Plus, Square, Trash2, Type, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NewElement = "text" | "button" | "image" | "divider" | "box";

const NEW_ELEMENTS: { type: NewElement; label: string; Icon: LucideIcon }[] = [
  { type: "text", label: "Texto", Icon: Type },
  { type: "button", label: "Botão", Icon: Square },
  { type: "image", label: "Imagem", Icon: Image },
  { type: "divider", label: "Divisor", Icon: Minus },
  { type: "box", label: "Caixa", Icon: Square },
];

interface Props {
  name: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onAddElement: (type: NewElement) => void;
}

/** Actions for the selected section. Lives outside the page preview so it never covers content. */
export function SectionBar({ name, canMoveUp, canMoveDown, onMove, onDuplicate, onRemove, onAddElement }: Props) {
  return (
    <div
      data-editor-control
      className="editor-float-in pointer-events-auto flex items-center gap-0.5 rounded-xl border border-white/15 bg-[#171717] p-1 shadow-2xl"
    >
      <span className="max-w-40 truncate px-3 text-xs font-medium text-white/80">{name}</span>
      <span className="mx-1 h-5 w-px bg-white/15" />
      <BarButton label="Subir seção" disabled={!canMoveUp} onClick={() => onMove(-1)}>
        <ArrowUp className="h-4 w-4" />
      </BarButton>
      <BarButton label="Descer seção" disabled={!canMoveDown} onClick={() => onMove(1)}>
        <ArrowDown className="h-4 w-4" />
      </BarButton>
      <BarButton label="Duplicar seção" onClick={onDuplicate}>
        <Copy className="h-4 w-4" />
      </BarButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white data-[state=open]:bg-white/15"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="center" className="w-40">
          {NEW_ELEMENTS.map(({ type, label, Icon }) => (
            <DropdownMenuItem key={type} onSelect={() => onAddElement(type)}>
              <Icon className="h-4 w-4" /> {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="mx-1 h-5 w-px bg-white/15" />
      <BarButton label="Excluir seção (Ctrl Z desfaz)" danger onClick={onRemove}>
        <Trash2 className="h-4 w-4" />
      </BarButton>
    </div>
  );
}

function BarButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors disabled:pointer-events-none disabled:opacity-30 ${
        danger ? "hover:bg-red-500/25 hover:text-red-200" : "hover:bg-white/15 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
