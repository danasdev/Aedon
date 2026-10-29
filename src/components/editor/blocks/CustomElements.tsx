import type { PropMap } from "@/lib/editor/types";
import { SiteLink, SmartImage, list, str, textVars, accentButton } from "./_shared";

export function CustomElements({ props }: { props: PropMap }) {
  const elements = list(props, "customElements");
  if (elements.length === 0) return null;
  return (
    // Rendered beside the block, outside its colour scope, so it sets its own tones.
    <div
      className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 sm:px-6"
      style={textVars(str(props, "textColor", "#161512"))}
    >
      {elements.map((item) => {
        if (item.type === "image")
          return (
            <div
              key={item._id}
              className="aspect-video overflow-hidden rounded-2xl border border-[color:var(--tc-15)]"
            >
              <SmartImage value={item.src} alt={item.alt || ""} />
            </div>
          );
        if (item.type === "button")
          return (
            <SiteLink
              key={item._id}
              link={item.link}
              className="inline-flex w-fit rounded-full px-5 py-3 text-sm font-medium"
              style={accentButton(str(props, "accent", "#1f4d3a"))}
            >
              {item.text || "Botão"}
            </SiteLink>
          );
        if (item.type === "divider")
          return <div key={item._id} className="h-px w-full bg-[color:var(--tc-20)]" />;
        if (item.type === "box")
          return (
            <div
              key={item._id}
              className="min-h-24 rounded-2xl border border-[color:var(--tc-15)] bg-[color:var(--tc-5)] p-5 text-sm text-[color:var(--tc-70)]"
            >
              {item.text || "Container"}
            </div>
          );
        return (
          <p key={item._id} className="max-w-2xl text-base leading-7 text-[color:var(--tc-70)]">
            {item.text || "Escreva aqui"}
          </p>
        );
      })}
    </div>
  );
}
