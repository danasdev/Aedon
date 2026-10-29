import { sectionAnchorId } from "./links";

/** Image source shown inside an editable element (the frame or the <img> itself). */
export function imageSourceOf(element: Element | null) {
  if (!element) return "";
  const img = element.tagName === "IMG" ? element : element.querySelector("img");
  return img?.getAttribute("src") ?? "";
}

/** The live DOM node for a selected element, looked up inside the preview iframe. */
export function findElementInPreview(sectionId: string, selector: string): HTMLElement | null {
  const doc = document.querySelector("iframe")?.contentDocument;
  const root = doc
    ?.getElementById(sectionAnchorId(sectionId))
    ?.querySelector<HTMLElement>("[data-section-root]");
  return root?.querySelector<HTMLElement>(selector) ?? null;
}
