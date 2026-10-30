import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";
import { SHOWCASE_FONTS_HREF } from "@/components/landing/showcase";

export const Route = createFileRoute("/")({
  head: () => ({
    // Families used inside the template mockups of the 3D gallery.
    links: [{ rel: "stylesheet", href: SHOWCASE_FONTS_HREF }],
    meta: [
      { title: "Aedon — Construtor visual de sites" },
      {
        name: "description",
        content:
          "Crie sites profissionais em minutos combinando seções pré-desenhadas. Editor visual com preview em tempo real.",
      },
      { property: "og:title", content: "Aedon — Construtor visual de sites" },
      {
        property: "og:description",
        content: "Editor de sites baseado em componentes premium. Sem código.",
      },
    ],
  }),
  component: Landing,
});
