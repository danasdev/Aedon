import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { ProjectsDashboard } from "@/components/projects/ProjectsDashboard";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [{ title: "Aedon — Meus projetos" }],
  }),
  // `modelo` comes from "Usar este modelo" on the home page: opens "Criar site" with it picked.
  validateSearch: (search: Record<string, unknown>): { modelo?: string } =>
    typeof search.modelo === "string" ? { modelo: search.modelo } : {},
  component: Index,
});

function Index() {
  const { modelo } = Route.useSearch();
  return (
    <ClientOnly fallback={<div className="h-screen w-screen bg-background" />}>
      <ProjectsDashboard initialModel={modelo} />
    </ClientOnly>
  );
}
