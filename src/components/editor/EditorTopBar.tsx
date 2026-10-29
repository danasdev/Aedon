import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Device, Page } from "@/lib/editor/types";
import type { SyncStatus } from "@/lib/supabase/sync";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageMenu } from "./PageMenu";
import {
  Download,
  Eye,
  Home,
  LogOut,
  Menu,
  Monitor,
  Pencil,
  Redo2,
  Smartphone,
  SlidersHorizontal,
  Tablet,
  Undo2,
  UserRound,
} from "lucide-react";

interface Props {
  projectName: string;
  onRenameProject: (name: string) => void;

  pages: Page[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onRenamePage: (id: string, name: string) => void;
  onDuplicatePage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onMovePage: (id: string, dir: -1 | 1) => void;

  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;

  device: Device;
  onDevice: (d: Device) => void;
  previewMode: boolean;
  onTogglePreview: () => void;
  onExport: () => void;

  /** Narrow screens show a button that opens the library as an overlay. */
  isNarrow: boolean;
  onOpenLibrary: () => void;
  propsOpen: boolean;
  onToggleProps: () => void;

  email: string | null;
  syncStatus: SyncStatus;
  onSignOut?: () => void;
}

const SYNC_LABEL: Record<SyncStatus, string> = {
  idle: "Pronto",
  loading: "Carregando…",
  saving: "Salvando…",
  saved: "Salvo na nuvem",
  error: "Erro ao salvar",
};

const DEVICES: { id: Device; label: string; Icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", Icon: Monitor },
  { id: "tablet", label: "Tablet", Icon: Tablet },
  { id: "mobile", label: "Celular", Icon: Smartphone },
];

/** The single top bar: where am I (project, page) · undo/redo · device · preview / export. */
export function EditorTopBar(props: Props) {
  const { previewMode, device, syncStatus } = props;
  const dot =
    syncStatus === "error"
      ? "bg-destructive"
      : syncStatus === "saving" || syncStatus === "loading"
        ? "bg-yellow-400 animate-pulse"
        : "bg-emerald-400";

  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border bg-card px-2 sm:gap-2 sm:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
          {props.isNarrow && !previewMode && (
            <Tip label="Biblioteca">
              <button
                type="button"
                onClick={props.onOpenLibrary}
                aria-label="Abrir biblioteca"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <Menu className="h-4 w-4" />
              </button>
            </Tip>
          )}
          <Tip label="Meus projetos">
            <Link
              to="/projects"
              aria-label="Voltar para Meus projetos"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Home className="h-4 w-4" />
            </Link>
          </Tip>
          <input
            value={props.projectName}
            onChange={(e) => props.onRenameProject(e.target.value)}
            aria-label="Nome do projeto"
            className="h-9 w-24 min-w-0 rounded-lg bg-transparent px-2 text-sm font-medium outline-none transition-colors hover:bg-white/5 focus:bg-white/5 sm:w-44"
          />
          <span className="hidden h-5 w-px bg-border sm:block" />
          <PageMenu
            pages={props.pages}
            activePageId={props.activePageId}
            onSelect={props.onSelectPage}
            onAdd={props.onAddPage}
            onRename={props.onRenamePage}
            onDuplicate={props.onDuplicatePage}
            onDelete={props.onDeletePage}
            onMove={props.onMovePage}
          />
          {!previewMode && (
            <div className="ml-1 hidden items-center sm:flex">
              <Tip label="Desfazer" shortcut="Ctrl Z">
                <IconButton onClick={props.onUndo} disabled={!props.canUndo} label="Desfazer">
                  <Undo2 className="h-4 w-4" />
                </IconButton>
              </Tip>
              <Tip label="Refazer" shortcut="Ctrl Shift Z">
                <IconButton onClick={props.onRedo} disabled={!props.canRedo} label="Refazer">
                  <Redo2 className="h-4 w-4" />
                </IconButton>
              </Tip>
            </div>
          )}
        </div>

        <div
          className="hidden items-center gap-0.5 rounded-full bg-white/5 p-0.5 md:flex"
          role="group"
          aria-label="Tamanho da tela"
        >
          {DEVICES.map(({ id, label, Icon }) => (
            <Tip key={id} label={label}>
              <button
                type="button"
                onClick={() => props.onDevice(id)}
                aria-label={`Visualizar em ${label}`}
                aria-pressed={device === id}
                className={`flex h-8 w-9 items-center justify-center rounded-full transition-colors ${
                  device === id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            </Tip>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
          <button
            type="button"
            onClick={props.onTogglePreview}
            aria-pressed={previewMode}
            className={`flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors ${
              previewMode
                ? "border-foreground/30 bg-foreground/10 text-foreground"
                : "border-white/10 text-foreground hover:border-white/30 hover:bg-white/5"
            }`}
          >
            {previewMode ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{previewMode ? "Voltar a editar" : "Prévia"}</span>
          </button>
          <button
            type="button"
            onClick={props.onExport}
            className="flex h-9 items-center gap-2 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          {!previewMode && (
            <Tip label={props.propsOpen ? "Fechar painel" : "Painel de edição"}>
              <button
                type="button"
                onClick={props.onToggleProps}
                aria-label={props.propsOpen ? "Fechar painel de edição" : "Abrir painel de edição"}
                aria-pressed={props.propsOpen}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  props.propsOpen
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </Tip>
          )}
          {props.email !== null && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Conta"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-white/30 hover:bg-white/5 hover:text-foreground"
                >
                  <UserRound className="h-4 w-4" />
                  <span
                    className={`absolute right-0 top-0 h-2 w-2 rounded-full ring-2 ring-card ${dot}`}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="space-y-0.5">
                  <span className="block truncate text-sm font-medium">{props.email}</span>
                  <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                    {SYNC_LABEL[syncStatus]}
                  </span>
                </DropdownMenuLabel>
                {props.onSignOut && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={props.onSignOut}>
                      <LogOut className="h-4 w-4" /> Sair
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function Tip({
  label,
  shortcut,
  children,
}: {
  label: string;
  shortcut?: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom">
        {label}
        {shortcut && <kbd className="ml-2 text-[10px] opacity-60">{shortcut}</kbd>}
      </TooltipContent>
    </Tooltip>
  );
}
