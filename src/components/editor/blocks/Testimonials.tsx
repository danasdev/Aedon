import type { PropMap } from "@/lib/editor/types";
import { str, list, headingStyle, textVars } from "./_shared";

type P = { props: PropMap };

export function TestimonialsCards({ props }: P) {
  const bg = str(props, "bg", "#000000");
  const textColor = str(props, "textColor", "#FFFFFF");
  const items = list(props, "items");
  return (
    <section
      className="py-16 sm:py-24 border-t border-[color:var(--tc-10)]"
      style={{ background: bg, ...textVars(textColor) }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          className="text-2xl sm:text-3xl md:text-5xl font-bold text-[color:var(--tc)] text-center mb-10 sm:mb-16"
          style={headingStyle}
        >
          {str(props, "title")}
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {items.map((it) => (
            <figure
              key={it._id}
              className="p-6 sm:p-8 rounded-2xl border border-[color:var(--tc-15)] bg-[color:var(--tc-5)]"
            >
              <blockquote className="text-[color:var(--tc-90)] text-base sm:text-lg leading-relaxed">
                &ldquo;{it.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 sm:mt-6 text-sm text-[color:var(--tc-50)]">
                {it.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
