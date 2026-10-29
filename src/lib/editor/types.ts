export type FieldType =
  "text" | "textarea" | "color" | "image" | "url" | "toggle" | "select" | "list" | "link";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  /** Options for `select` fields. */
  options?: SelectOption[];
  /** For `list` fields: the schema of each item (primitive field types only). */
  itemSchema?: FieldSchema[];
  /** For `list` fields: default values for a freshly added item. */
  itemDefaults?: Record<string, string>;
  /** For `list` fields: singular label of an item, e.g. "Link", "Card". */
  itemLabel?: string;
  /** For `list` fields: bounds on how many items are allowed. */
  min?: number;
  max?: number;
  /** Only show this field when another field has the given value (structural toggles). */
  showWhen?: { key: string; equals: string | boolean };
}

export type LibraryCategory = "Header" | "Hero" | "Corpo" | "Conversão" | "Footer";

export interface SectionVariant {
  id: string; // unique variant id, e.g. "navbar.modern"
  kind: SectionKind;
  name: string;
  description: string;
  schema: FieldSchema[];
  defaults: PropMap;
  /** Library grouping (assigned when the catalog is built). */
  category?: LibraryCategory;
  /** Marked as a premium component in the library (badge; gating is server-side). */
  premium?: boolean;
}

export type SectionKind =
  "navbar" | "hero" | "features" | "gallery" | "testimonials" | "faq" | "cta" | "footer";

/** A single row inside a `list` field. `_id` is a stable key for React + editing. */
export type ListItem = Record<string, string> & { _id: string };

/** A prop can be a scalar (text/color/url/select), a boolean (toggle), or a list. */
export type PropValue = string | boolean | ListItem[];

export type PropMap = Record<string, PropValue>;

export interface SectionInstance {
  id: string; // instance id (uuid)
  variantId: string;
  props: PropMap;
  hidden?: boolean;
}

export interface Typography {
  headingFont: string; // font family name, e.g. "Inter Tight"
  bodyFont: string;
  headingWeight: number; // 300–900
  bodyWeight: number; // 300–700
  lineHeight: number; // 1.0–2.0
  letterSpacing: number; // em, -0.05–0.1
  baseSize: number; // px, base body size, 14–20
}

export interface Page {
  id: string; // uuid
  name: string; // "Home", "Sobre"…
  slug: string; // url-safe, unique within the project ("home", "sobre")
  sections: SectionInstance[];
}

export interface BillingState {
  /** Manually toggled add-ons, keyed by feature key (see lib/pricing/catalog.ts). */
  addons: Record<string, boolean>;
}

export interface ProjectState {
  name: string;
  pages: Page[];
  typography: Typography;
  billing: BillingState;
  /** Id of the site palette last applied from "Estilo do site" (see lib/editor/palettes.ts). */
  palette?: string;
}

/**
 * A navigation target stored on a button/link.
 * Serialized to a string prop so it fits the existing PropValue union:
 *   ""                    → none
 *   "url:https://…"       → external URL
 *   "page:<pageId>"       → another page
 *   "section:<sectionId>" → scroll to a section (on any page)
 */
export type LinkTarget =
  | { kind: "none" }
  | { kind: "url"; url: string }
  | { kind: "page"; pageId: string }
  | { kind: "section"; sectionId: string };

export type Device = "desktop" | "tablet" | "mobile";
