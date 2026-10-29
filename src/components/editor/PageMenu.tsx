import { useState } from "react";
import type { Page } from "@/lib/editor/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  Copy,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Props {
  pages: Page[];
  activePageId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}

/** Page switcher. One compact control in the top bar; per-page actions live in a row menu. */
export function PageMenu({
  pages,
  activePageId,
  onSelect,
  onAdd,
  onRename,
  onDuplicate,
  onDelete,
  onMove,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Page | null>(null);

  const active = pages.find((p) => p.id === activePageId) ?? pages[0];

  const startEdit = (p: Page) => {
    setEditingId(p.id);
    setDraft(p.name);
  };
  const commitEdit = () => {
    if (editingId && draft.trim()) onRename(editingId, draft.trim());
    setEditingId(null);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-9 max-w-44 items-center gap-2 rounded-lg px-2.5 text-sm text-foreground transition-colors hover:bg-white/5 data-[state=open]:bg-white/10"
            aria-label={`Página atual: ${active?.name}. Trocar de página`}
          >
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{active?.name}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-1.5" data-editor-control>
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium text-muted-foreground">
            Páginas
          </p>
          <ul className="max-h-72 overflow-y-auto scrollbar-thin">
            {pages.map((p, i) => {
              const isActive = p.id === activePageId;
              if (editingId === p.id) {
                return (
                  <li key={p.id} className="px-1 py-0.5">
                    <input
                      autoFocus
                      value={draft}
                      aria-label="Nome da página"
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-9 w-full rounded-lg border border-foreground/30 bg-background px-2.5 text-sm outline-none"
                    />
                  </li>
                );
              }
              return (
                <li key={p.id} className="group flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(p.id);
                      setOpen(false);
                    }}
                    onDoubleClick={() => startEdit(p)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex h-9 min-w-0 flex-1 items-center rounded-lg px-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Ações da página ${p.name}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onSelect={() => startEdit(p)}>
                        <Pencil className="h-4 w-4" /> Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onDuplicate(p.id)}>
                        <Copy className="h-4 w-4" /> Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={i === 0} onSelect={() => onMove(p.id, -1)}>
                        <ArrowUp className="h-4 w-4" /> Mover para cima
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={i === pages.length - 1}
                        onSelect={() => onMove(p.id, 1)}
                      >
                        <ArrowDown className="h-4 w-4" /> Mover para baixo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={pages.length <= 1}
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setPendingDelete(p)}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 border-t border-border pt-1">
            <button
              type="button"
              onClick={() => {
                onAdd();
                setOpen(false);
              }}
              className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Plus className="h-4 w-4" /> Nova página
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a página “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              As seções dessa página serão removidas. Você ainda pode desfazer logo depois com Ctrl
              Z.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Excluir página
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
