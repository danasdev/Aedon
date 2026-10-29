import type { PropMap } from "@/lib/editor/types";
import { str, list, headingStyle, SiteLink, textVars } from "./_shared";

type P = { props: PropMap };

export function FooterDark({ props }: P) {
  const bg = str(props, "bg", "#000000");
  const textColor = str(props, "textColor", "#FFFFFF");
  const links = list(props, "links");
  return (
    <footer
      className="border-t border-[color:var(--tc-15)] py-10 sm:py-14"
      style={{ background: bg, ...textVars(textColor) }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-bold text-[color:var(--tc)] text-xl" style={headingStyle}>
            {str(props, "brand")}
          </div>
          <div className="text-[color:var(--tc-50)] text-sm mt-1">{str(props, "tagline")}</div>
        </div>
        {links.length > 0 && (
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[color:var(--tc-60)]">
            {links.map((l) => (
              <SiteLink
                key={l._id}
                link={l.link}
                className="hover:text-[color:var(--tc)] transition-colors cursor-pointer"
              >
                {l.label}
              </SiteLink>
            ))}
          </nav>
        )}
        <div className="text-[color:var(--tc-40)] text-xs">{str(props, "copyright")}</div>
      </div>
    </footer>
  );
}

export function FooterMinimal({ props }: P) {
  const bg = str(props, "bg", "#000000");
  const textColor = str(props, "textColor", "#FFFFFF");
  return (
    <footer
      className="border-t border-[color:var(--tc-10)] py-8"
      style={{ background: bg, ...textVars(textColor) }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-[color:var(--tc-40)] text-xs">
        {str(props, "copyright")}
      </div>
    </footer>
  );
}
