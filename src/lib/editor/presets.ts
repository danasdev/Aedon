import type { PropMap, Typography } from "./types";
import { getVariant } from "./sections";
import { SEGMENT_PRESETS } from "./segmentPresets";

/**
 * Page presets are compositions of regular section variants, never special renderers:
 * everything a preset shows can be built and edited with the normal blocks.
 */
export interface PagePreset {
  id: string;
  name: string;
  description: string;
  sectionIds: string[];
  /** Per-section prop overrides (same order as sectionIds): texts, photos, colours. */
  content?: (PropMap | undefined)[];
  /** Fonts applied when a whole site starts from this preset. */
  typography?: Partial<Typography>;
  /** For segment presets: who it's for, shown in galleries. */
  segment?: string;
  brand?: string;
}

/** The props section `i` of a preset starts with: the block defaults plus the preset's content. */
export function presetSectionProps(preset: PagePreset, i: number): PropMap {
  return { ...(getVariant(preset.sectionIds[i])?.defaults ?? {}), ...(preset.content?.[i] ?? {}) };
}

const GENERIC_PRESETS: PagePreset[] = [
  {
    id: "landing",
    name: "Landing page",
    description: "Uma página de conversão completa para apresentar uma oferta.",
    sectionIds: [
      "navbar.modern",
      "hero.gradient",
      "features.grid",
      "testimonials.cards",
      "cta.banner",
      "footer.dark",
    ],
  },
  {
    id: "saas",
    name: "SaaS",
    description: "Apresente produto, benefícios, prova social e chamada para ação.",
    sectionIds: [
      "navbar.minimal",
      "hero.split",
      "features.list",
      "testimonials.cards",
      "faq.accordion",
      "cta.banner",
      "footer.minimal",
    ],
  },
  {
    id: "portfolio",
    name: "Portfólio",
    description: "Uma composição visual para destacar projetos e trabalho autoral.",
    sectionIds: [
      "navbar.minimal",
      "hero.gradient",
      "gallery.editorial",
      "text.manifesto",
      "cta.banner",
      "footer.minimal",
    ],
  },
  {
    id: "agency",
    name: "Agência",
    description: "Apresente serviços, resultados e formas de contato.",
    sectionIds: [
      "navbar.modern",
      "hero.split",
      "features.grid",
      "gallery.masonry",
      "testimonials.cards",
      "cta.banner",
      "footer.dark",
    ],
  },
  {
    id: "about",
    name: "Sobre",
    description: "Conte a história da marca com conteúdo editorial e destaques.",
    sectionIds: [
      "navbar.minimal",
      "hero.gradient",
      "text.editorial",
      "features.list",
      "text.quote",
      "footer.minimal",
    ],
  },
  {
    id: "contact",
    name: "Contato",
    description: "Uma página simples com apresentação, próximos passos e contato.",
    sectionIds: ["navbar.minimal", "hero.split", "text.manifesto", "cta.banner", "footer.minimal"],
  },
];

/** Segment-ready sites first, then the generic compositions. */
export const PAGE_PRESETS: PagePreset[] = [...SEGMENT_PRESETS, ...GENERIC_PRESETS];
