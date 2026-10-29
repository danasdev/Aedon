import type { PropMap } from "@/lib/editor/types";
import { str, bool, headingStyle, SiteLink, textVars, accentButton } from "./_shared";

type P = { props: PropMap };

export function CTABanner({ props }: P) {
  const bg = str(props, "bg", "#000000");
  const textColor = str(props, "textColor", "#FFFFFF");
  const accent = str(props, "accent", "#D4D4D8");
  return (
    <section
      className="py-16 sm:py-24 border-t border-[color:var(--tc-10)]"
      style={{ background: bg, ...textVars(textColor) }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 md:p-16 text-center border"
          style={{
            background: "var(--tc-5)",
            borderColor: "var(--tc-15)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              background: `radial-gradient(circle at 50% 100%, ${accent}, transparent 60%)`,
            }}
          />
          <h2
            className="relative text-2xl sm:text-3xl md:text-5xl font-bold text-[color:var(--tc)]"
            style={headingStyle}
          >
            {str(props, "title")}
          </h2>
          {bool(props, "showSubtitle") && str(props, "subtitle") && (
            <p className="relative mt-4 text-[color:var(--tc-70)] text-base sm:text-lg max-w-xl mx-auto">
              {str(props, "subtitle")}
            </p>
          )}
          <SiteLink
            link={str(props, "ctaLink")}
            className="relative mt-6 sm:mt-8 inline-flex items-center justify-center font-medium px-8 py-3 rounded-full transition-transform hover:-translate-y-0.5 cursor-pointer"
            style={accentButton(accent)}
          >
            {str(props, "cta")}
          </SiteLink>
        </div>
      </div>
    </section>
  );
}
