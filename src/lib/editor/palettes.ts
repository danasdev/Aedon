import type { PropMap } from "./types";

/** A site-wide colour scheme. Blocks pick a role from it so a page keeps its rhythm. */
export interface Palette {
  id: string;
  name: string;
  /** Main page background. */
  paper: string;
  /** Slightly deeper background for alternating blocks. */
  paperDeep: string;
  /** Text on paper. */
  ink: string;
  /** Buttons, icons and the call-to-action band. */
  accent: string;
}

export const PALETTES: Palette[] = [
  {
    id: "moss",
    name: "Papel e musgo",
    paper: "#F6F3EC",
    paperDeep: "#EFEADF",
    ink: "#161512",
    accent: "#1F4D3A",
  },
  {
    id: "ocean",
    name: "Oceano",
    paper: "#F2F6F8",
    paperDeep: "#E3ECF1",
    ink: "#0E1B26",
    accent: "#1F6FA8",
  },
  {
    id: "terracotta",
    name: "Terracota",
    paper: "#FBF4EE",
    paperDeep: "#F3E5D8",
    ink: "#2A1A12",
    accent: "#C2562B",
  },
  {
    id: "lavender",
    name: "Lavanda",
    paper: "#F7F5FB",
    paperDeep: "#ECE7F6",
    ink: "#1D1530",
    accent: "#6B4FD8",
  },
  {
    id: "ink",
    name: "Preto e branco",
    paper: "#FFFFFF",
    paperDeep: "#F2F2F0",
    ink: "#111111",
    accent: "#111111",
  },
  {
    id: "night",
    name: "Noite",
    paper: "#0F1013",
    paperDeep: "#17191E",
    ink: "#F3F2EE",
    accent: "#8FB3FF",
  },
];

export const DEFAULT_PALETTE = PALETTES[0];

type Role = "base" | "deep" | "accent" | "inverse";

/** Which part of the palette each block uses by default. */
const ROLE_BY_VARIANT: Record<string, Role> = {
  "features.grid": "deep",
  "testimonials.cards": "deep",
  "text.quote": "deep",
  "gallery.filmstrip": "deep",
  "cta.banner": "accent",
  "footer.dark": "inverse",
};

/** Blocks whose backdrop has a second colour (a glow) that the palette also sets. */
export const GLOW_VARIANTS = new Set(["hero.gradient"]);

/** bg / textColor / accent (and glow, where the block has one) under a palette. */
export function paletteColors(p: Palette, variantId: string): PropMap {
  const colors = roleColors(p, variantId);
  return GLOW_VARIANTS.has(variantId) ? { ...colors, glow: p.accent } : colors;
}

function roleColors(p: Palette, variantId: string): PropMap {
  switch (ROLE_BY_VARIANT[variantId] ?? "base") {
    case "deep":
      return { bg: p.paperDeep, textColor: p.ink, accent: p.accent };
    case "accent":
      return { bg: p.accent, textColor: p.paper, accent: p.paper };
    case "inverse":
      return { bg: p.ink, textColor: p.paper, accent: p.paperDeep };
    default:
      return { bg: p.paper, textColor: p.ink, accent: p.accent };
  }
}
