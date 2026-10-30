import { SEGMENT_PRESETS } from "@/lib/editor/segmentPresets";
import { DEFAULT_TYPOGRAPHY, googleFontsHref } from "@/lib/editor/typography";

/**
 * The home gallery shows the real segment presets: what you see on a card is exactly
 * what the editor creates when you pick that model.
 */
export const SHOWCASE = SEGMENT_PRESETS;

/** One stylesheet with every family the showcased presets use. */
export const SHOWCASE_FONTS_HREF =
  googleFontsHref(
    Array.from(
      new Set(
        SHOWCASE.flatMap((p) => [
          p.typography?.headingFont ?? DEFAULT_TYPOGRAPHY.headingFont,
          p.typography?.bodyFont ?? DEFAULT_TYPOGRAPHY.bodyFont,
        ]),
      ),
    ),
  ) ?? "";
