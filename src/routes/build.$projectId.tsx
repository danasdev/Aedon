import { createFileRoute, ClientOnly, useNavigate } from "@tanstack/react-router";
import { AppRoot } from "@/components/editor/AppRoot";

export const Route = createFileRoute("/build/$projectId")({
  head: () => ({
    meta: [
      { title: "Aedon — Editor" },
      {
        name: "description",
        content: "Monte seu site combinando seções prontas, com preview em tempo real.",
      },
    ],
  }),
  // `preset` comes from "Criar site" and is applied once to the new, empty site.
  validateSearch: (search: Record<string, unknown>): { preset?: string } =>
    typeof search.preset === "string" ? { preset: search.preset } : {},
  component: Index,
});

function Index() {
  const { projectId } = Route.useParams();
  const { preset } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <ClientOnly fallback={<div className="h-screen w-screen bg-background" />}>
      <AppRoot
        projectId={projectId}
        initialPreset={preset}
        onPresetConsumed={() =>
          navigate({ to: "/build/$projectId", params: { projectId }, search: {}, replace: true })
        }
      />
    </ClientOnly>
  );
}
