import type { PropMap } from "./types";
import { bool, str } from "./props";
import { objectPosition, parseImage } from "./images";

export type EntryAnimation = "none" | "fade" | "slide-up" | "slide-left" | "zoom";
export type ScrollEffect = "none" | "parallax" | "fade";

export function sectionBackground(props: PropMap): string {
  const base = str(props, "bg", "#000000");
  const photo = str(props, "bgImage");
  if (photo) {
    // Photo backdrop: darkened by a flat overlay so text stays readable, colour as fallback.
    const img = parseImage(photo);
    const shade = Math.max(0, Math.min(90, Number(str(props, "bgOverlay", "35")) || 0)) / 100;
    return `linear-gradient(rgba(0,0,0,${shade}), rgba(0,0,0,${shade})), url("${img.src}") ${objectPosition(img)} / cover no-repeat, ${base}`;
  }
  if (!bool(props, "gradientEnabled")) return base;
  const from = str(props, "gradientFrom", base);
  const to = str(props, "gradientTo", str(props, "accent", "#D4D4D8"));
  const direction = str(props, "gradientDirection", "135deg");
  return `linear-gradient(${direction}, ${from}, ${to})`;
}

export function entryAnimation(props: PropMap): EntryAnimation {
  const value = str(props, "entryAnimation", "none");
  return value === "fade" || value === "slide-up" || value === "slide-left" || value === "zoom"
    ? value
    : "none";
}

export function scrollEffect(props: PropMap): ScrollEffect {
  const value = str(props, "scrollEffect", "none");
  return value === "parallax" || value === "fade" ? value : "none";
}
