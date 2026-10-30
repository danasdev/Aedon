import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bold,
  FileText,
  Italic,
  Layers,
  Monitor,
  MousePointerClick,
  Palette,
  Pencil,
  Plus,
  Smartphone,
  Tablet,
} from "@/components/icons";
import { VariantPreview } from "@/components/editor/VariantPreview";
import { presetSectionProps, type PagePreset } from "@/lib/editor/presets";
import { PALETTES, paletteColors } from "@/lib/editor/palettes";
import { BASE_PLAN, FEATURES, formatBRL } from "@/lib/pricing/catalog";
import { SHOWCASE } from "./showcase";

const byId = (id: string) => SHOWCASE.find((p) => p.id === id) ?? SHOWCASE[0];

/** Soft, slowly drifting colour fields behind the glass. */
function Blobs({ colors }: { colors: string[] }) {
  const spots = [
    "left-[8%] top-[10%]",
    "right-[6%] top-[28%]",
    "left-[30%] bottom-[2%]",
    "right-[30%] -top-[6%]",
  ];
  return (
    <div
      className="blob-field pointer-events-none absolute inset-x-0 -inset-y-40 overflow-hidden"
      aria-hidden
    >
      {colors.map((c, i) => (
        <span
          key={i}
          className={`blob absolute h-[42vw] max-h-[560px] w-[42vw] max-w-[560px] rounded-full ${spots[i % spots.length]}`}
          style={{
            background: c,
            animationDelay: `${i * -4}s`,
            transition: "background 1.2s ease",
          }}
          data-parallax={i % 2 ? "0.12" : "-0.08"}
        />
      ))}
    </div>
  );
}

/** A preset's first blocks stacked, like a page seen in a browser. Heights are given at
 *  the 1024px design width and scale with the container, so content never gets clipped. */
function PresetStack({
  preset,
  heights,
  recolor,
}: {
  preset: PagePreset;
  heights: number[];
  recolor?: (variantId: string) => Record<string, string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => el.clientWidth && setScale(el.clientWidth / 1024);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref}>
      {heights.map((h, i) => {
        const id = preset.sectionIds[i];
        if (!id) return null;
        const props = { ...presetSectionProps(preset, i), ...(recolor?.(id) ?? {}) };
        return (
          <VariantPreview
            key={`${id}-${i}`}
            variantId={id}
            defaults={props}
            typography={preset.typography}
            scale={scale}
            height={Math.round(h * scale)}
          />
        );
      })}
    </div>
  );
}

/** 1 — The editor, in glass, editing a real preset. Tilts upright as it scrolls in. */
export function EditorShowcase() {
  const preset = byId("perfumaria");
  return (
    <section className="relative overflow-x-clip py-28 sm:py-36">
      <Blobs colors={["#e8d9bc", "#c2562b", "#6b4fd8", "#1f4d3a"]} />
      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="ae-eyebrow reveal" data-reveal>
            O editor
          </p>
          <h2
            className="reveal mt-4 text-4xl font-medium tracking-[-0.03em] sm:text-6xl"
            data-reveal
            style={{ transitionDelay: "80ms" }}
          >
            Clique. Mude. <span className="text-ion">Pronto.</span>
          </h2>
        </div>

        <div data-tilt className="mt-14 [perspective:1800px]">
          <div className="glass tilt-target relative mx-auto max-w-6xl rounded-[22px] p-2.5 will-change-transform">
            {/* window bar */}
            <div className="flex h-11 items-center gap-3 px-3">
              <img src="/aedon-mark.png" alt="" className="h-4 w-4" />
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-foreground/90">
                {preset.brand}
              </span>
              <div className="mx-auto hidden items-center gap-1 rounded-full bg-black/30 p-1 sm:flex">
                {[Monitor, Tablet, Smartphone].map((Icon, i) => (
                  <span
                    key={i}
                    className={`flex h-6 w-8 items-center justify-center rounded-full ${i === 0 ? "bg-white/15 text-foreground" : "text-faint"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                ))}
              </div>
              <span className="ml-auto rounded-full bg-ion px-3 py-1 text-xs font-semibold text-background shadow-[0_3px_0_var(--ion-deep)]">
                Exportar
              </span>
            </div>
            <div className="flex gap-2.5">
              {/* rail */}
              <div className="hidden w-14 shrink-0 flex-col items-center gap-2 rounded-2xl bg-black/25 py-3 sm:flex">
                {[Plus, FileText, Layers, Palette].map((Icon, i) => (
                  <span
                    key={i}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${i === 0 ? "bg-ion/15 text-ion" : "text-faint"}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                ))}
              </div>
              {/* canvas */}
              <div className="relative aspect-[16/9] min-w-0 flex-1 overflow-hidden rounded-2xl">
                <PresetStack preset={preset} heights={[64, 620, 400]} />
                {/* selection on the hero title */}
                <div className="pointer-events-none absolute left-[12%] right-[12%] top-[43%] h-[28%] rounded-[4px] border-2 border-ion shadow-[0_0_0_1px_rgba(0,0,0,.4)]">
                  <span className="absolute -top-6 left-0 rounded-[5px] bg-ion px-2 py-0.5 text-[11px] font-semibold text-background">
                    Título
                  </span>
                </div>
                {/* floating contextual toolbar */}
                <div className="glass float-y absolute left-1/2 top-[16%] flex -translate-x-1/2 items-center gap-1 rounded-2xl px-2 py-1.5 text-xs text-foreground">
                  <span className="rounded-lg bg-ion/15 px-2 py-1 text-ion">Título</span>
                  <span className="flex items-center gap-1 rounded-lg bg-ion px-2.5 py-1 font-semibold text-background">
                    <Pencil className="h-3 w-3" /> Editar texto
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center">
                    <Bold className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center">
                    <Italic className="h-3.5 w-3.5" />
                  </span>
                  <span className="h-4 w-4 rounded-md bg-[#d8a657] shadow-[0_0_0_1px_rgba(255,255,255,.3)]" />
                </div>
                {/* cursor */}
                <MousePointerClick className="cursor-path pointer-events-none absolute h-7 w-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.6)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 2 — One click on a palette recolours the whole site; the section glows in its colour. */
export function PaletteShowcase() {
  const preset = byId("estetica");
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const palette = PALETTES[index];

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % PALETTES.length), 2600);
    return () => window.clearInterval(t);
  }, [auto]);

  const recolor = useMemo(
    () => (variantId: string) => paletteColors(palette, variantId) as Record<string, string>,
    [palette],
  );

  return (
    <section className="relative overflow-x-clip py-28 sm:py-36">
      <div
        className="blob-field pointer-events-none absolute inset-x-0 -inset-y-32 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(60% 70% at 70% 50%, ${palette.accent}55, transparent 70%), radial-gradient(40% 50% at 15% 80%, ${palette.paperDeep}22, transparent 70%)`,
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="ae-eyebrow reveal" data-reveal>
            Paletas
          </p>
          <h2
            className="reveal mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl"
            data-reveal
            style={{ transitionDelay: "80ms" }}
          >
            Uma paleta.
            <br />
            <span
              className="transition-colors duration-700"
              style={{ color: palette.accent === "#111111" ? "#f5f4f1" : palette.accent }}
            >
              O site inteiro muda.
            </span>
          </h2>
          <div
            className="reveal mt-10 flex flex-wrap gap-2"
            data-reveal
            style={{ transitionDelay: "160ms" }}
            role="radiogroup"
            aria-label="Paletas"
          >
            {PALETTES.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={i === index}
                onClick={() => {
                  setAuto(false);
                  setIndex(i);
                }}
                className={`glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm transition-transform duration-300 ${
                  i === index
                    ? "scale-105 text-foreground shadow-[0_0_0_1px_var(--ion)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex -space-x-1">
                  {[p.paper, p.accent, p.ink].map((c, j) => (
                    <span
                      key={j}
                      className="h-5 w-5 rounded-full shadow-[0_0_0_1.5px_rgba(0,0,0,.35)]"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div data-parallax="-0.06" className="reveal" data-reveal>
          <div className="glass rounded-[22px] p-2.5">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
              <PresetStack preset={preset} heights={[64, 560, 420]} recolor={recolor} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 3 — Real hero sections of each segment, as a mosaic. */
export function SegmentsBento() {
  const spans = [
    "sm:col-span-2 sm:row-span-2",
    "",
    "",
    "sm:col-span-2",
    "",
    "",
    "sm:col-span-2",
    "",
  ];
  return (
    <section className="relative mx-auto max-w-[1400px] px-6 py-28 sm:px-10 sm:py-36">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2
          className="reveal max-w-xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl"
          data-reveal
        >
          Pronto para o seu <span className="text-ion">negócio.</span>
        </h2>
        <Link to="/projects" className="reveal ae-btn" data-reveal>
          Ver todos os modelos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-4">
        {SHOWCASE.map((p, i) => (
          <Link
            key={p.id}
            to="/projects"
            search={{ modelo: p.id }}
            data-reveal
            className={`reveal group relative overflow-hidden rounded-[20px] border border-white/10 ${spans[i] ?? ""}`}
            style={{ transitionDelay: `${(i % 4) * 90}ms` }}
          >
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
              <VariantPreview
                variantId={p.sectionIds[1]}
                defaults={presetSectionProps(p, 1)}
                typography={p.typography}
                height={i === 0 ? 496 : 240}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent via-40% to-transparent" />
            <span className="glass absolute bottom-3 left-3 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-foreground">
              <span className="font-medium">{p.brand}</span>
              <span className="text-foreground/60">{p.segment}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** 4 — The whole process in three words. */
export function StepsStrip() {
  const steps = [
    { n: "01", label: "Escolha", Icon: Layers },
    { n: "02", label: "Clique e mude", Icon: MousePointerClick },
    { n: "03", label: "Exporte", Icon: ArrowRight },
  ];
  return (
    <section id="como-funciona" className="relative mx-auto max-w-[1400px] px-6 pb-28 sm:px-10">
      <div className="relative grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.n}
            data-reveal
            className="reveal glass relative flex items-center gap-4 rounded-2xl p-5"
            style={{ transitionDelay: `${i * 140}ms` }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ion text-background shadow-[0_3px_0_var(--ion-deep)]">
              <s.Icon className="h-5 w-5" />
            </span>
            <div>
              <span className="text-xs tabular-nums text-faint">{s.n}</span>
              <p className="text-lg font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 5 — Price on glass, over colour. */
export function PricingGlass() {
  const extras = FEATURES.filter((f) => f.kind === "toggle").slice(0, 3);
  return (
    <section id="preco" className="relative overflow-x-clip py-28 sm:py-36">
      <Blobs colors={["#6b4fd8", "#e8d9bc", "#d8a657"]} />
      <div className="relative mx-auto max-w-3xl px-6">
        <div className="reveal glass rounded-[28px] p-8 text-center sm:p-14" data-reveal>
          <p className="ae-eyebrow">Preço</p>
          <div className="mt-5 flex items-baseline justify-center gap-2">
            <span className="text-6xl font-medium tracking-[-0.04em] sm:text-7xl">
              {formatBRL(BASE_PLAN.priceCents)}
            </span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {extras.map((f) => (
              <span
                key={f.key}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-muted-foreground"
              >
                {f.label} <span className="text-foreground">+{formatBRL(f.unitPriceCents)}</span>
              </span>
            ))}
          </div>
          <Link to="/projects" className="ae-btn ae-btn-primary ae-btn-lg mt-10">
            Começar agora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 6 — Closing line. */
export function FinalCta() {
  return (
    <section className="relative px-4 pb-24 pt-8 sm:px-8">
      <div
        className="reveal relative mx-auto max-w-[1400px] overflow-hidden rounded-[36px] bg-ion px-6 py-28 text-center text-background sm:py-36"
        data-reveal
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_0%,rgba(255,255,255,0.55),transparent_60%),radial-gradient(50%_70%_at_10%_110%,rgba(161,141,104,0.55),transparent_70%)]"
          aria-hidden
        />
        <h2 className="relative text-5xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-8xl">
          Seu próximo site
          <br />
          começa em um clique.
        </h2>
        <div className="relative mt-12">
          <Link to="/projects" className="group ae-btn ae-btn-ink ae-btn-lg">
            Criar meu site
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
