import type { CSSProperties } from "react";

export { str, bool, list } from "@/lib/editor/props";
export { SiteLink } from "./_link";
export { SmartImage } from "./_image";

/** Inline style that makes a heading follow the project's typography settings. */
export const headingStyle: CSSProperties = {
  fontFamily: "var(--site-heading-font)",
  fontWeight: "var(--site-heading-weight, 700)",
};

/**
 * Applies the section's user-chosen text color at a given opacity (100 = full
 * strength, lower = a muted/secondary tone — mirrors the old fixed `text-white/60`
 * etc. utility classes, but driven by the editable `textColor` prop instead of a
 * hardcoded white).
 */
export function textTone(color: string, opacityPct = 100): string {
  return opacityPct >= 100 ? color : `color-mix(in oklab, ${color} ${opacityPct}%, transparent)`;
}

/**
 * CSS custom properties for the common opacity tiers of a section's text color,
 * meant to be spread onto the section's root `style`. Consumed via Tailwind
 * arbitrary-value utilities, e.g. `text-[color:var(--tc-70)]`, so hover/group-hover
 * variants keep working (a plain inline `style={{color}}` can't respond to `:hover`).
 */
export function textVars(color: string): CSSProperties {
  return {
    "--tc": color,
    "--tc-5": textTone(color, 5),
    "--tc-10": textTone(color, 10),
    "--tc-15": textTone(color, 15),
    "--tc-20": textTone(color, 20),
    "--tc-30": textTone(color, 30),
    "--tc-90": textTone(color, 90),
    "--tc-80": textTone(color, 80),
    "--tc-70": textTone(color, 70),
    "--tc-60": textTone(color, 60),
    "--tc-50": textTone(color, 50),
    "--tc-40": textTone(color, 40),
  } as CSSProperties;
}

/** Readable text colour (near-black or near-white) for a solid fill such as an accent button. */
export function onColor(hex: string): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex.trim());
  if (!m) return "#0b0b0b";
  const [r, g, b] = m.slice(1).map((c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#0b0b0b" : "#ffffff";
}

/** Solid accent button: fill + readable label. */
export function accentButton(accent: string) {
  return { background: accent, color: onColor(accent) };
}
