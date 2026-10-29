import { useState } from "react";
import type { Page } from "@/lib/editor/types";
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
  ArrowDown,
  ArrowUp,
  Copy,
  FileText,
  Home,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "@/components/icons";
import { PanelShell } from "./PanelShell";

interface Props {
  pages: Page[];
  activePageId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onClose: () => void;
  overlay?: boolean;
}

export function PagesPanel({
  pages,
  activePageId,
  onSelect,
  onAdd,
  onRename,
  onDuplicate,
  onDelete,
  onMove,
  onClose,
  overlay,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Page | null>(null);

  const commit = () => {
    if (editingId && draft.trim()) onRename(editingId, draft.trim());
    setEditingId(null);
  };

  return (
    <PanelShell
      title="Páginas"
      onClose={onClose}
      overlay={overlay}
      action={
        <button type="button" onClick={() => onAdd()} className="ae-btn ae-btn-sm">
          <Plus className="h-3.5 w-3.5" /> Nova
        </button>
      }
    >
      <p className="ae-label px-4 pb-2">
        {pages.length} {pages.length === 1 ? "página" : "páginas"} · a primeira é a inicial
      </p>
      <ul className="space-y-0.5 px-2">
        {pages.map((p, i) => {
          const active = p.id === activePageId;
          const HomeOrFile = i === 0 ? Home : FileText;
          if (editingId === p.id) {
            return (
              <li key={p.id} className="px-1 py-0.5">
                <input
                  autoFocus
                  value={draft}
                  aria-label="Nome da página"
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="ae-input h-10"
                />
              </li>
            );
          }
          return (
            <li
              key={p.id}
              className={`group flex h-11 items-center gap-1 rounded-[10px] pl-1 pr-1 transition-colors ${
                active
                  ? "bg-ion/10 text-ion shadow-[inset_0_0_0_1px_rgb(60_207_224/0.35)]"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                onDoubleClick={() => {
                  setEditingId(p.id);
                  setDraft(p.name);
                }}
                aria-current={active ? "page" : undefined}
                className="flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-[10px] px-2 text-left"
              >
                <HomeOrFile className="h-4 w-4 shrink-0" />
                <span className={`truncate text-sm ${active ? "font-semibold" : "font-medium"}`}>
                  {p.name}
                </span>
                {i === 0 && <span className="ml-auto text-xs text-faint">Inicial</span>}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ae-ib h-8 w-8"
                    aria-label={`Ações da página ${p.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditingId(p.id);
                      setDraft(p.name);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Renomear
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDuplicate(p.id)}>
                    <Copy className="h-4 w-4" /> Duplicar
                  </DropdownMenuItem>
                  {i > 0 && (
                    <DropdownMenuItem
                      onSelect={() => {
                        for (let step = 0; step < i; step++) onMove(p.id, -1);
                      }}
                    >
                      <Home className="h-4 w-4" /> Tornar página inicial
                    </DropdownMenuItem>
                  )}
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
                    <Trash2 className="h-4 w-4" /> Excluir página
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          );
        })}
      </ul>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a página “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              As seções dessa página saem junto. Dá para desfazer logo depois com Ctrl Z.
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
    </PanelShell>
  );
}
