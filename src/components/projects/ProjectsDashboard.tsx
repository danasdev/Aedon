import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Copy, Loader2, LogOut, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AedonLogo } from "@/components/editor/AedonMark";
import { AuthScreen } from "@/components/editor/AuthScreen";
import { VariantPreview } from "@/components/editor/VariantPreview";
import { isSupabaseEnabled } from "@/lib/supabase/client";
import { signOut, useAuth } from "@/lib/supabase/auth";
import { getVariant } from "@/lib/editor/sections";
import { PAGE_PRESETS } from "@/lib/editor/presets";
import {
  createLocalProject,
  deleteLocalProject,
  duplicateLocalProject,
  listLocalProjects,
  loadLocalProject,
  renameLocalProject,
  type ProjectSummary,
} from "@/lib/editor/projects";
import {
  createCloudProject,
  deleteCloudProject,
  duplicateCloudProject,
  listCloudProjects,
  renameCloudProject,
} from "@/lib/supabase/projects";

export function ProjectsDashboard() {
  const { user, loading } = useAuth();

  if (isSupabaseEnabled) {
    if (loading) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (!user) return <AuthScreen />;
    return <Dashboard mode="cloud" userId={user.id} userEmail={user.email ?? ""} />;
  }

  return <Dashboard mode="local" userId={null} userEmail={null} />;
}

function Dashboard({
  mode,
  userId,
  userEmail,
}: {
  mode: "local" | "cloud";
  userId: string | null;
  userEmail: string | null;
}) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (mode === "local") setProjects(listLocalProjects());
    else if (userId) setProjects(await listCloudProjects(userId));
  }, [mode, userId]);

  useEffect(() => {
    refresh().catch((err) => setError(errorMessage(err)));
  }, [refresh]);

  const openProject = (id: string, preset?: string) =>
    navigate({
      to: "/build/$projectId",
      params: { projectId: id },
      search: preset ? { preset } : {},
    });

  const run = async (action: () => Promise<unknown> | unknown) => {
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const count = projects?.length ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <AedonLogo />
          {mode === "cloud" && userEmail && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Conta"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-xs font-bold uppercase hover:border-ion"
                >
                  {userEmail.slice(0, 1)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="truncate font-mono text-[11px] font-normal text-faint">
                  {userEmail}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ae-eyebrow">
              // {projects === null ? "carregando" : `${count} ${count === 1 ? "site" : "sites"}`}
            </p>
            <h1 className="ae-display mt-3 text-4xl sm:text-[44px]">Seus sites</h1>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="ae-btn ae-btn-primary ae-btn-lg self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} /> Criar site
          </button>
        </div>

        {projects === null ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="ae-tile flex flex-col items-start gap-3 border-dashed p-10">
            <p className="ae-eyebrow">// comece aqui</p>
            <h2 className="ae-title text-xl">Crie seu primeiro site</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Escolha uma página pronta, troque textos e imagens clicando direto nelas e exporte
              quando quiser.
            </p>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="ae-btn ae-btn-primary mt-2"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} /> Criar site
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                local={mode === "local"}
                onOpen={() => openProject(p.id)}
                onRename={(name) =>
                  run(() =>
                    mode === "local"
                      ? renameLocalProject(p.id, name)
                      : renameCloudProject(userId as string, p.id, name),
                  )
                }
                onDuplicate={() =>
                  run(() =>
                    mode === "local"
                      ? duplicateLocalProject(p.id)
                      : duplicateCloudProject(userId as string, p.id),
                  )
                }
                onDelete={() =>
                  run(() =>
                    mode === "local"
                      ? deleteLocalProject(p.id)
                      : deleteCloudProject(userId as string, p.id),
                  )
                }
              />
            ))}
          </div>
        )}
      </main>

      <CreateSiteDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={async (name, preset) => {
          const id =
            mode === "local"
              ? createLocalProject(name)
              : await createCloudProject(userId as string, name);
          openProject(id, preset);
        }}
      />
    </div>
  );
}

/** First sections of the site's first page, scaled down. Local projects only; cloud ones get a neutral frame. */
function ProjectThumb({ id, local }: { id: string; local: boolean }) {
  const sections = useMemo(
    () =>
      local
        ? (loadLocalProject(id)
            ?.pages[0]?.sections.filter((s) => !s.hidden)
            .slice(0, 3) ?? [])
        : [],
    [id, local],
  );
  return (
    <div className="ae-tile overflow-hidden p-2 group-hover:-translate-y-0.5 group-hover:border-ion/60">
      <div className="h-[168px] overflow-hidden rounded-[7px] bg-surface">
        {sections.length > 0 ? (
          sections.map((s) => (
            <VariantPreview
              key={s.id}
              variantId={s.variantId}
              defaults={s.props}

              height={56}
            />
          ))
        ) : (
          <div className="flex h-full flex-col gap-2 p-5">
            <div className="h-1.5 w-1/3 rounded-full bg-faint/60" />
            <div className="mt-6 h-3 w-3/4 rounded bg-faint/40" />
            <div className="h-3 w-1/2 rounded bg-faint/40" />
            <div className="mt-2 h-4 w-16 rounded-full bg-ion/50" />
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  local,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: ProjectSummary;
  local: boolean;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <article className="group">
      {/* Not a <button>: the thumbnail renders the site's own buttons inside. */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Abrir ${project.name}`}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="cursor-pointer outline-none focus-visible:[&>div]:border-ion"
      >
        <ProjectThumb id={project.id} local={local} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        {editing ? (
          <input
            autoFocus
            defaultValue={project.name}
            aria-label="Nome do site"
            onBlur={(e) => {
              const name = e.target.value.trim();
              if (name && name !== project.name) onRename(name);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setEditing(false);
            }}
            className="ae-input h-9 min-h-0 flex-1 text-sm font-semibold"
          />
        ) : (
          <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold">{project.name}</span>
            <span className="block font-mono text-[10.5px] text-faint">
              editado{" "}
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: ptBR })}
            </span>
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="ae-ib" aria-label={`Ações de ${project.name}`}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Renomear
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate}>
              <Copy className="h-4 w-4" /> Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{project.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              O site e todas as páginas dele serão apagados. Isso não pode ser desfeito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Excluir site</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

const BLANK = "blank";

function CreateSiteDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, preset?: string) => Promise<void>;
}) {
  const [name, setName] = useState("Meu site");
  const [choice, setChoice] = useState<string>(PAGE_PRESETS[0]?.id ?? BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) {
      setError("Dê um nome ao site.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onCreate(name.trim(), choice === BLANK ? undefined : choice);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const options = [
    { id: BLANK, name: "Em branco", description: "Comece do zero", sectionIds: [] as string[] },
    ...PAGE_PRESETS,
  ];

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] max-w-[880px] overflow-y-auto border-border bg-panel p-7 sm:rounded-2xl">
        <p className="ae-eyebrow">// novo site</p>
        <DialogTitle className="ae-display text-[28px]">Criar um site</DialogTitle>
        <DialogDescription className="-mt-2 text-sm">
          Você pode mudar tudo depois.
        </DialogDescription>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="mt-2 space-y-6"
        >
          <div className="max-w-md space-y-2">
            <label htmlFor="new-site-name" className="ae-label block">
              nome do site
            </label>
            <input
              id="new-site-name"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="ae-input"
            />
          </div>

          <div role="radiogroup" aria-label="Ponto de partida">
            <p className="ae-label mb-2.5">ponto de partida</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {options.map((preset) => {
                const selected = choice === preset.id;
                return (
                  // Not a <button>: the thumbnail renders the site's own buttons inside.
                  <div
                    key={preset.id}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => setChoice(preset.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setChoice(preset.id);
                      }
                    }}
                    className="group relative cursor-pointer outline-none"
                  >
                    <div
                      className={`ae-tile overflow-hidden p-1.5 group-focus-visible:border-ion ${
                        selected
                          ? "border-ion shadow-[0_0_0_1px_var(--ion)]"
                          : "group-hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="h-[108px] overflow-hidden rounded-[6px] bg-surface">
                        {preset.sectionIds.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-faint">
                            <Plus className="h-6 w-6" />
                          </div>
                        ) : (
                          preset.sectionIds.slice(0, 3).map((id) => (
                            <VariantPreview
                              key={id}
                              variantId={id}
                              defaults={getVariant(id)?.defaults ?? {}}

                              height={36}
                            />
                          ))
                        )}
                      </div>
                    </div>
                    {selected && (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-ion text-background">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                    <p className="mt-2 text-[13px] font-semibold">{preset.name}</p>
                    <p className="line-clamp-1 font-mono text-[10.5px] text-faint">
                      {preset.description.toLowerCase()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onOpenChange(false)}
              className="ae-btn ae-btn-flat ae-btn-lg"
            >
              Cancelar
            </button>
            <button type="submit" disabled={busy} className="ae-btn ae-btn-primary ae-btn-lg">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar site
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return `Não deu para concluir: ${String((err as { message: unknown }).message)}`;
  }
  return "Não deu para concluir. Tente de novo.";
}
