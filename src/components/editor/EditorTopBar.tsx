import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Device, ProjectState } from "@/lib/editor/types";
import type { SyncStatus } from "@/lib/supabase/sync";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronDown,
  Download,
  Eye,
  LayoutGrid,
  LogOut,
  Monitor,
  Pencil,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
  Wallet,
} from "lucide-react";
import { AedonMark } from "./AedonMark";
import { PricingPanel } from "./PricingPanel";

interface Props {
  project: ProjectState;
  onRenameProject: (name: string) => void;
  onToggleBillingAddon: (key: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  device: Device;
  onDevice: (d: Device) => void;
  previewMode: boolean;
  onTogglePreview: () => void;
  onExport: () => void;
  email: string | null;
  syncStatus: SyncStatus;
  onSignOut?: () => void;
}

const SYNC: Record<SyncStatus, { label: string; dot: string }> = {
  idle: { label: "salvo neste navegador", dot: "bg-[#4cd08a]" },
  loading: { label: "carregando", dot: "bg-grain animate-pulse" },
  saving: { label: "salvando", dot: "bg-grain animate-pulse" },
  saved: { label: "salvo", dot: "bg-[#4cd08a]" },
  error: { label: "erro ao salvar", dot: "bg-destructive" },
};

const DEVICES: { id: Device; label: string; Icon: typeof Monitor }[] = [
  { id: "desktop", label: "Computador", Icon: Monitor },
  { id: "tablet", label: "Tablet", Icon: Tablet },
  { id: "mobile", label: "Celular", Icon: Smartphone },
];

export function EditorTopBar(props: Props) {
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const sync = SYNC[props.syncStatus];

  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-panel pl-[22px] pr-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <AedonMark className="h-7 w-7 shrink-0" />
          {renaming ? (
            <input
              autoFocus
              defaultValue={props.project.name}
              aria-label="Nome do site"
              onBlur={(e) => {
                if (e.target.value.trim()) props.onRenameProject(e.target.value.trim());
                setRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="ae-input h-8 min-h-0 w-48 text-sm font-semibold"
            />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-8 min-w-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold hover:bg-surface data-[state=open]:bg-surface"
                >
                  <span className="truncate">{props.project.name}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-faint" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuItem onSelect={() => setRenaming(true)}>
                  <Pencil className="h-4 w-4" /> Renomear site
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setBudgetOpen(true)}>
                  <Wallet className="h-4 w-4" /> Orçamento do projeto
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/projects" })}>
                  <LayoutGrid className="h-4 w-4" /> Meus sites
                </DropdownMenuItem>
                {props.email !== null && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="truncate font-mono text-[11px] font-normal text-faint">
                      {props.email}
                    </DropdownMenuLabel>
                    {props.onSignOut && (
                      <DropdownMenuItem onSelect={props.onSignOut}>
                        <LogOut className="h-4 w-4" /> Sair
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span
            className="hidden items-center gap-1.5 font-mono text-[10.5px] text-faint lg:flex"
            role="status"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${sync.dot}`} />
            {sync.label}
          </span>
        </div>

        <div className="ae-seg hidden md:flex" role="group" aria-label="Tamanho da tela">
          {DEVICES.map(({ id, label, Icon }) => (
            <Tip key={id} label={label}>
              <button
                type="button"
                onClick={() => props.onDevice(id)}
                aria-label={`Ver no ${label.toLowerCase()}`}
                aria-pressed={props.device === id}
              >
                <Icon className="h-4 w-4" />
              </button>
            </Tip>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          {!props.previewMode && (
            <>
              <Tip label="Desfazer" shortcut="Ctrl Z">
                <button
                  type="button"
                  onClick={props.onUndo}
                  disabled={!props.canUndo}
                  className="ae-ib"
                  aria-label="Desfazer"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
              </Tip>
              <Tip label="Refazer" shortcut="Ctrl Shift Z">
                <button
                  type="button"
                  onClick={props.onRedo}
                  disabled={!props.canRedo}
                  className="ae-ib"
                  aria-label="Refazer"
                >
                  <Redo2 className="h-4 w-4" />
                </button>
              </Tip>
              <span className="mx-1 h-[22px] w-px bg-border" />
            </>
          )}
          <button
            type="button"
            onClick={props.onTogglePreview}
            aria-pressed={props.previewMode}
            className={`ae-btn ${props.previewMode ? "border-ion text-ion" : ""}`}
          >
            {props.previewMode ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {props.previewMode ? "Voltar a editar" : "Prévia"}
            </span>
          </button>
          <button type="button" onClick={props.onExport} className="ae-btn ae-btn-primary">
            <Download className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </header>

      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-border bg-panel p-0">
          <DialogHeader className="border-b border-border px-5 py-4">
            <p className="ae-eyebrow">// orçamento</p>
            <DialogTitle className="ae-title text-base">Orçamento do projeto</DialogTitle>
            <DialogDescription className="text-xs">
              Calculado pelas seções e recursos do site.
            </DialogDescription>
          </DialogHeader>
          <PricingPanel project={props.project} onToggleAddon={props.onToggleBillingAddon} />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
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
        {shortcut && <kbd className="ml-2 font-mono text-[10px] opacity-60">{shortcut}</kbd>}
      </TooltipContent>
    </Tooltip>
  );
}
