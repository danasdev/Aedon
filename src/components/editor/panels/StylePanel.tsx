import { useState } from "react";
import type { Typography } from "@/lib/editor/types";
import { PALETTES, type Palette } from "@/lib/editor/palettes";
import { FONTS, PAIRINGS, fontStack, getFont } from "@/lib/editor/typography";
import { Check, ChevronDown, PaintBucket } from "@/components/icons";
import { PanelShell } from "./PanelShell";

interface Props {
  typography: Typography;
  onTypographyChange: (patch: Partial<Typography>) => void;
  /** Palette last applied to the site, if any. */
  paletteId: string | undefined;
  onApplyPalette: (palette: Palette) => void;
  /** Name of the selected section whose colours can be copied everywhere, if any. */
  colorSource: string | null;
  onApplyColorsToAll: () => void;
  onClose: () => void;
  overlay?: boolean;
}

const WEIGHT_LABEL: Record<number, string> = {
  300: "Leve",
  400: "Regular",
  500: "Médio",
  600: "Seminegrito",
  700: "Negrito",
  800: "Extranegrito",
  900: "Black",
};

/** Site-wide look: one palette, one font pairing, fine-tuning tucked away. */
export function StylePanel(props: Props) {
  const { typography: t, onTypographyChange } = props;
  const [copied, setCopied] = useState(false);
  const [fineTune, setFineTune] = useState(false);
  const activePairing = PAIRINGS.find((p) => p.heading === t.headingFont && p.body === t.bodyFont);

  return (
    <PanelShell title="Estilo do site" onClose={props.onClose} overlay={props.overlay}>
      <p className="px-4 text-sm leading-relaxed text-muted-foreground">
        Vale para todas as páginas. Você ainda pode mudar a cor de uma seção pela barra no topo.
      </p>

      <Section title="Cores">
        <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Paleta do site">
          {PALETTES.map((p) => {
            const active = props.paletteId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => props.onApplyPalette(p)}
                className={`relative rounded-xl border p-1.5 text-left transition-colors ${
                  active
                    ? "border-ion shadow-[0_0_0_1px_var(--ion)]"
                    : "border-border hover:border-[#4a4844]"
                }`}
              >
                <PaletteSwatch palette={p} />
                <span className="mt-1.5 block truncate px-1 text-[13px] font-medium text-foreground">
                  {p.name}
                </span>
                {active && (
                  <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-ion text-background">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {props.colorSource && (
          <button
            type="button"
            onClick={() => {
              props.onApplyColorsToAll();
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }}
            className="mt-3 flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <PaintBucket className="h-4 w-4 shrink-0" />
            <span className="min-w-0">
              {copied
                ? "Cores copiadas para esta página"
                : `Usar as cores de “${props.colorSource}” nesta página`}
            </span>
          </button>
        )}
      </Section>

      <Section title="Fontes">
        <div className="space-y-2" role="radiogroup" aria-label="Combinação de fontes">
          {PAIRINGS.map((p) => {
            const active = activePairing?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onTypographyChange({ headingFont: p.heading, bodyFont: p.body })}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  active
                    ? "border-ion bg-ion/[0.06] shadow-[0_0_0_1px_var(--ion)]"
                    : "border-border hover:border-[#4a4844]"
                }`}
              >
                <span
                  className="w-10 shrink-0 text-center text-2xl leading-none text-foreground"
                  style={{ fontFamily: fontStack(p.heading), fontWeight: 600 }}
                  aria-hidden
                >
                  Aa
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {p.label.replace(" (padrão)", "")}
                  </span>
                  <span className="block text-xs leading-snug text-muted-foreground">
                    {p.heading} + {p.body}
                  </span>
                </span>
                {active && <Check className="h-4 w-4 shrink-0 text-ion" />}
              </button>
            );
          })}
        </div>
      </Section>

      <div className="mt-6 border-t border-border px-4 pt-2">
        <button
          type="button"
          onClick={() => setFineTune((v) => !v)}
          aria-expanded={fineTune}
          className="flex min-h-11 w-full items-center justify-between text-left text-sm font-medium text-foreground"
        >
          Ajustar fontes e espaçamento
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${fineTune ? "rotate-180" : ""}`}
          />
        </button>
        {fineTune && (
          <div className="space-y-4 pb-4 pt-2">
            <FontField
              label="Fonte dos títulos"
              value={t.headingFont}
              onChange={(v) => onTypographyChange({ headingFont: v })}
            />
            <WeightField
              label="Peso dos títulos"
              value={t.headingWeight}
              weights={getFont(t.headingFont)?.weights ?? [400, 700]}
              onChange={(v) => onTypographyChange({ headingWeight: v })}
            />
            <FontField
              label="Fonte do texto"
              value={t.bodyFont}
              onChange={(v) => onTypographyChange({ bodyFont: v })}
            />
            <WeightField
              label="Peso do texto"
              value={t.bodyWeight}
              weights={getFont(t.bodyFont)?.weights ?? [400, 700]}
              onChange={(v) => onTypographyChange({ bodyWeight: v })}
            />
            <SliderField
              label="Tamanho do texto"
              value={t.baseSize}
              min={14}
              max={20}
              step={1}
              format={(v) => `${v} px`}
              onChange={(v) => onTypographyChange({ baseSize: v })}
            />
            <SliderField
              label="Altura da linha"
              value={t.lineHeight}
              min={1}
              max={2}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={(v) => onTypographyChange({ lineHeight: v })}
            />
            <SliderField
              label="Espaço entre letras"
              value={t.letterSpacing}
              min={-0.05}
              max={0.1}
              step={0.005}
              format={(v) => `${v.toFixed(3)} em`}
              onChange={(v) => onTypographyChange({ letterSpacing: v })}
            />
          </div>
        )}
      </div>
    </PanelShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-4 pt-6">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

/** A tiny page in the palette's colours: content block, deeper band, accent button. */
function PaletteSwatch({ palette: p }: { palette: Palette }) {
  return (
    <div className="overflow-hidden rounded-lg" style={{ background: p.paper }} aria-hidden>
      <div className="px-2.5 pb-2 pt-2.5">
        <div className="text-[15px] font-semibold leading-none" style={{ color: p.ink }}>
          Aa
        </div>
        <div
          className="mt-1.5 h-1 w-3/4 rounded-full"
          style={{ background: p.ink, opacity: 0.35 }}
        />
        <div className="mt-2 h-3 w-9 rounded-full" style={{ background: p.accent }} />
      </div>
      <div className="flex h-3">
        <div className="flex-1" style={{ background: p.paperDeep }} />
        <div className="w-1/3" style={{ background: p.accent }} />
      </div>
    </div>
  );
}

function FontField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="ae-label mb-1.5 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ae-input h-10 text-sm"
      >
        {FONTS.map((f) => (
          <option key={f.name} value={f.name}>
            {f.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function WeightField({
  label,
  value,
  weights,
  onChange,
}: {
  label: string;
  value: number;
  weights: number[];
  onChange: (v: number) => void;
}) {
  // Snap to the nearest weight the font actually ships.
  const effective = weights.includes(value)
    ? value
    : weights.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a));
  return (
    <label className="block">
      <span className="ae-label mb-1.5 block">{label}</span>
      <select
        value={effective}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ae-input h-10 text-sm"
      >
        {weights.map((w) => (
          <option key={w} value={w}>
            {WEIGHT_LABEL[w] ?? w}
          </option>
        ))}
      </select>
    </label>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between">
        <span className="ae-label">{label}</span>
        <span className="text-xs tabular-nums text-foreground">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-[var(--ion)]"
      />
    </label>
  );
}
