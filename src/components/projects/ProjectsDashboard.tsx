import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Loader2,
  Plus,
  Copy,
  Trash2,
  Pencil,
  LogOut,
  FileText,
  Check,
  MoreHorizontal,
  X,
} from "lucide-react";
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
import { AedonMark } from "@/components/editor/AedonMark";
import { isSupabaseEnabled } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth";
import { signOut } from "@/lib/supabase/auth";
import { AuthScreen } from "@/components/editor/AuthScreen";
import {
  listLocalProjects,
  createLocalProject,
  duplicateLocalProject,
  renameLocalProject,
  deleteLocalProject,
  type ProjectSummary,
} from "@/lib/editor/projects";
import {
  listCloudProjects,
  createCloudProject,
  duplicateCloudProject,
  renameCloudProject,
  deleteCloudProject,
} from "@/lib/supabase/projects";

export function ProjectsDashboard() {
  const { user, loading } = useAuth();

  if (isSupabaseEnabled) {
    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (mode === "local") {
      setProjects(listLocalProjects());
    } else if (userId) {
      setProjects(await listCloudProjects(userId));
    }
  }, [mode, userId]);

  useEffect(() => {
    refresh().catch((err) => setError(errorMessage(err)));
  }, [refresh]);

  const openProject = (id: string) => navigate({ to: "/build/$projectId", params: { projectId: id } });

  const handleCreate = async () => {
    setBusy(true);
    setError(null);
    try {
      const id =
        mode === "local" ? createLocalProject() : await createCloudProject(userId as string);
      openProject(id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const newId =
        mode === "local" ? duplicateLocalProject(id) : await duplicateCloudProject(userId as string, id);
      if (newId) await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async (id: string, name: string) => {
    setError(null);
    try {
      if (mode === "local") renameLocalProject(id, name);
      else await renameCloudProject(userId as string, id, name);
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "local") deleteLocalProject(id);
      else await deleteCloudProject(userId as string, id);
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-5xl h-16 px-5 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <AedonMark className="w-5 h-5" />
            <span className="text-sm font-medium tracking-[0.2em]">AEDON</span>
          </Link>
          {mode === "cloud" && userEmail && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">{userEmail}</span>
              <button
                onClick={signOut}
                title="Sair"
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 sm:px-6 py-10 sm:py-14">
        {error && (
          <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight">Meus projetos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {projects === null
                ? "Carregando…"
                : projects.length === 0
                  ? "Nenhum projeto ainda."
                  : `${projects.length} projeto${projects.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={busy}
            className="h-10 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground flex items-center justify-center gap-2 transition-all hover:-translate-y-px hover:bg-primary/90 disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            Novo projeto
          </button>
        </div>

        {projects === null ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyProjects onCreate={handleCreate} busy={busy} />
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={() => openProject(p.id)}
                onRename={(name) => handleRename(p.id, name)}
                onDuplicate={() => handleDuplicate(p.id)}
                onDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: ProjectSummary;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(project.name);

  const commitRename = () => {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== project.name) onRename(trimmed);
    else setName(project.name);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-foreground/30 hover:bg-white/[0.035]">
      <button
        onClick={onOpen}
        className="group relative flex aspect-[4/3] w-full items-center justify-center border-b border-white/5 bg-black text-left"
        aria-label={`Abrir ${project.name}`}
      >
        <div className="absolute inset-x-5 top-5 space-y-2 opacity-30 transition-opacity group-hover:opacity-50">
          <div className="h-2 w-2/5 rounded-full bg-white" />
          <div className="h-1.5 w-full rounded-full bg-white/60" />
          <div className="h-1.5 w-4/5 rounded-full bg-white/60" />
        </div>
        <AedonMark className="h-8 w-8 opacity-25 transition-opacity group-hover:opacity-50" />
      </button>
      <div className="flex items-center gap-2 p-3">
        {editing ? (
          <form
            className="flex min-w-0 flex-1 gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              commitRename();
            }}
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setName(project.name);
                  setEditing(false);
                }
              }}
              className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-input/60 px-2.5 text-sm font-medium outline-none focus:border-foreground/40"
              aria-label="Nome do projeto"
            />
            <IconBtn title="Salvar nome" onClick={commitRename}>
              <Check className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title="Cancelar"
              onClick={() => {
                setName(project.name);
                setEditing(false);
              }}
            >
              <X className="h-4 w-4" />
            </IconBtn>
          </form>
        ) : (
          <>
            <button onClick={onOpen} className="min-w-0 flex-1 text-left" title={project.name}>
              <span className="block truncate text-sm font-medium">{project.name}</span>
              <span className="block text-[11px] text-muted-foreground">
                Editado {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: ptBR })}
              </span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Ações de ${project.name}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                >
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
          </>
        )}
      </div>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{project.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              O projeto e todas as suas páginas serão apagados. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Excluir projeto</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

function EmptyProjects({ onCreate, busy }: { onCreate: () => void; busy: boolean }) {
  return (
    <button
      onClick={onCreate}
      disabled={busy}
      className="w-full rounded-2xl border border-dashed border-white/15 hover:border-foreground/30 hover:bg-white/[0.02] py-16 px-6 flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-all disabled:opacity-60"
    >
      <span className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center"><FileText className="w-5 h-5" /></span>
      <span className="text-sm font-medium">Crie o primeiro site deste espaço</span>
      <span className="text-xs">Você poderá adicionar seções, editar textos e publicar depois.</span>
    </button>
  );
}

function IconBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return `Não foi possível concluir: ${String((err as { message: unknown }).message)}`;
  }
  return "Não foi possível concluir a ação. Tente novamente.";
}
