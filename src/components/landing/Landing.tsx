import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "@/components/icons";
import { AedonLogo } from "@/components/editor/AedonMark";
import { BASE_PLAN, FEATURES, formatBRL } from "@/lib/pricing/catalog";
import { TemplateGallery } from "./TemplateGallery";
import { SHOWCASE } from "./showcase";

/** Scroll distance (in viewport heights) that moves the gallery by one template. */
const STEP_VH = 0.62;

const STEPS = [
  {
    n: "01",
    title: "Escolha um modelo",
    body: "Comece de uma página pronta para o seu tipo de negócio, ou de uma página em branco.",
  },
  {
    n: "02",
    title: "Clique e troque",
    body: "Textos, fotos, cores e botões: tudo se edita direto no site, sem painel de propriedades.",
  },
  {
    n: "03",
    title: "Coloque no ar",
    body: "O site salva sozinho. Quando estiver pronto, exporte o HTML e publique onde quiser.",
  },
];

const STATEMENT =
  "Seu negócio merece um site que pareça caro. Escolha um modelo, troque as palavras e as fotos, e coloque no ar no mesmo dia.";

export function Landing() {
  const navigate = useNavigate();
  const targetRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<import("lenis").default | null>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  /** Scroll position (px) where the gallery shows template `i`. */
  const scrollForIndex = useCallback((i: number) => {
    const el = sectionRef.current;
    if (!el) return 0;
    return el.offsetTop + i * window.innerHeight * STEP_VH;
  }, []);

  // Smooth scroll + everything that reacts to it.
  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let snapTimer = 0;
    let lenis: import("lenis").default | null = null;
    // Template the gallery last settled on; snapping moves away from it in the scroll's direction.
    let settled = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onScroll = (y: number) => {
      const el = sectionRef.current;
      if (el) {
        const p = (y - el.offsetTop) / (window.innerHeight * STEP_VH);
        targetRef.current = Math.max(0, Math.min(SHOWCASE.length - 1, p));
        setProgress(Math.max(0, Math.min(1, p / (SHOWCASE.length - 1))));
      }
      // Statement: words light up as the paragraph crosses the viewport.
      const st = statementRef.current;
      if (st) {
        const r = st.getBoundingClientRect();
        const t = Math.max(
          0,
          Math.min(1, (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.35)),
        );
        const words = st.children;
        for (let i = 0; i < words.length; i++) {
          const on = Math.max(0, Math.min(1, t * words.length - i));
          (words[i] as HTMLElement).style.opacity = String(0.16 + on * 0.84);
        }
      }
      // Marquee drifts with the scroll.
      const mq = marqueeRef.current;
      if (mq) mq.style.transform = `translate3d(${-(y * 0.35) % (mq.scrollWidth / 2)}px,0,0)`;

      // Snap to the nearest template when the user stops inside the gallery.
      window.clearTimeout(snapTimer);
      const sec = sectionRef.current;
      if (sec && lenis && !reduced) {
        snapTimer = window.setTimeout(() => {
          const p = (window.scrollY - sec.offsetTop) / (window.innerHeight * STEP_VH);
          if (p < -0.02 || p > SHOWCASE.length - 1 + 0.02) return;
          // A small push is enough to reach the next template (like a wheel "tick").
          const next =
            p > settled + 0.12 ? Math.ceil(p) : p < settled - 0.12 ? Math.floor(p) : settled;
          settled = Math.max(0, Math.min(SHOWCASE.length - 1, next));
          if (Math.abs(p - settled) > 0.002)
            lenis?.scrollTo(scrollForIndex(settled), { duration: 0.7 });
        }, 160);
      }
    };

    (async () => {
      if (!reduced) {
        const { default: Lenis } = await import("lenis");
        if (disposed) return;
        lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
        lenisRef.current = lenis;
        lenis.on("scroll", ({ scroll }: { scroll: number }) => onScroll(scroll));
        const loop = (time: number) => {
          lenis?.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } else {
        window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
      }
      onScroll(window.scrollY);
    })();

    // Reveal-on-scroll for anything marked [data-reveal].
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(snapTimer);
      lenis?.destroy();
      lenisRef.current = null;
      io.disconnect();
    };
  }, [scrollForIndex]);

  const goTo = (i: number) => {
    const y = scrollForIndex(i);
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const t = SHOWCASE[active];
  const introOpacity = Math.max(0, 1 - progress * (SHOWCASE.length - 1) * 1.6);
  const extraFeatures = FEATURES.filter((f) => f.kind === "toggle").slice(0, 3);

  return (
    <div className="bg-background text-foreground">
      {/* Fixed header over the gallery */}
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 sm:px-10">
          <AedonLogo />
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#modelos" className="transition-colors hover:text-foreground">
              Modelos
            </a>
            <a href="#como-funciona" className="transition-colors hover:text-foreground">
              Como funciona
            </a>
            <a href="#preco" className="transition-colors hover:text-foreground">
              Preço
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/projects" className="ae-btn ae-btn-flat hidden sm:inline-flex">
              Entrar
            </Link>
            <Link to="/projects" className="ae-btn ae-btn-primary">
              Criar site
            </Link>
          </div>
        </nav>
      </header>

      {/* Pinned 3D gallery, driven by scroll */}
      <section
        id="modelos"
        ref={sectionRef}
        className="relative"
        style={{ height: `${(SHOWCASE.length - 1) * STEP_VH * 100 + 100}vh` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden bg-[radial-gradient(120%_90%_at_60%_20%,#16171a_0%,#0a0a0a_60%)]">
          <TemplateGallery
            targetRef={targetRef}
            onActiveChange={setActive}
            onCardClick={(i) =>
              i === active
                ? navigate({ to: "/projects", search: { modelo: SHOWCASE[i].id } })
                : goTo(i)
            }
          />

          {/* corner marks */}
          {["left-5 top-20", "right-5 top-20", "left-5 bottom-5", "right-5 bottom-5"].map((pos) => (
            <span
              key={pos}
              className={`pointer-events-none absolute ${pos} text-lg leading-none text-faint`}
              aria-hidden
            >
              +
            </span>
          ))}

          {/* Intro headline — fades as the gallery starts moving */}
          <div
            className="pointer-events-none absolute left-6 top-28 max-w-xl sm:left-10 sm:top-32"
            style={{
              opacity: introOpacity,
              transform: `translateY(${(1 - introOpacity) * -24}px)`,
            }}
          >
            <p className="ae-eyebrow hero-in" style={{ animationDelay: "200ms" }}>
              Construtor visual de sites
            </p>
            <h1 className="mt-4 text-[44px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[64px]">
              <span className="hero-line">
                <span style={{ animationDelay: "300ms" }}>Sites que parecem</span>
              </span>
              <span className="hero-line">
                <span style={{ animationDelay: "420ms" }}>caros. Feitos hoje.</span>
              </span>
            </h1>
            <p
              className="hero-in mt-5 max-w-md text-base text-muted-foreground"
              style={{ animationDelay: "650ms" }}
            >
              Escolha um modelo pronto para o seu negócio e edite tudo clicando direto no site.
            </p>
          </div>

          {/* Caption of the active template */}
          <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between gap-6 sm:bottom-10 sm:left-10 sm:right-10">
            <div key={t.id} className="caption-in max-w-md">
              <p className="text-xs tabular-nums text-muted-foreground">
                {String(active + 1).padStart(2, "0")} / {String(SHOWCASE.length).padStart(2, "0")} ·{" "}
                {t.segment}
              </p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
                {t.brand}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.description}</p>
              <Link to="/projects" search={{ modelo: t.id }} className="ae-btn ae-btn-primary mt-5">
                Usar este modelo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Progress rail */}
            <div className="hidden flex-col items-end gap-2 sm:flex" aria-label="Modelos">
              {SHOWCASE.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ver ${s.brand}`}
                  aria-current={i === active}
                  className="group flex items-center gap-3"
                >
                  <span
                    className={`text-xs transition-all duration-300 ${i === active ? "text-foreground opacity-100" : "text-faint opacity-0 group-hover:opacity-100"}`}
                  >
                    {s.segment}
                  </span>
                  <span
                    className={`h-px transition-all duration-500 ${i === active ? "w-10 bg-ion" : "w-4 bg-faint group-hover:w-6"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div
            className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-xs text-muted-foreground lg:flex"
            style={{ opacity: introOpacity }}
          >
            Role para ver os modelos
            <span className="scroll-cue h-10 w-px bg-faint" />
          </div>

          {/* Overall progress */}
          <div className="absolute inset-x-0 top-16 h-px bg-border/60">
            <div
              className="h-full origin-left bg-ion"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </div>
      </section>

      {/* Statement — words light up while scrolling */}
      <section className="mx-auto max-w-5xl px-6 py-40 sm:px-10">
        <p
          ref={statementRef}
          className="text-3xl font-medium leading-[1.2] tracking-[-0.02em] sm:text-5xl"
        >
          {STATEMENT.split(" ").map((w, i) => (
            <span key={i} className="transition-opacity duration-300" style={{ opacity: 0.16 }}>
              {w}{" "}
            </span>
          ))}
        </p>
      </section>

      {/* Marquee of segments */}
      <div className="overflow-hidden border-y border-border py-6">
        <div
          ref={marqueeRef}
          className="flex w-max gap-12 whitespace-nowrap text-4xl font-medium tracking-[-0.02em] text-faint will-change-transform sm:text-6xl"
        >
          {[...SHOWCASE, ...SHOWCASE, ...SHOWCASE].map((s, i) => (
            <span key={i} className="flex items-center gap-12">
              {s.segment}
              <span className="h-2 w-2 rounded-full bg-ion" />
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="como-funciona" className="mx-auto max-w-[1400px] px-6 py-32 sm:px-10">
        <p className="ae-eyebrow reveal" data-reveal>
          Como funciona
        </p>
        <h2
          className="reveal mt-4 max-w-2xl text-4xl font-medium tracking-[-0.02em] sm:text-5xl"
          data-reveal
          style={{ transitionDelay: "80ms" }}
        >
          Três passos. Nenhum deles é código.
        </h2>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              data-reveal
              className="reveal ae-tile p-7"
              style={{ transitionDelay: `${150 + i * 120}ms` }}
            >
              <span className="text-sm tabular-nums text-ion">{s.n}</span>
              <h3 className="mt-10 text-xl font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="preco" className="mx-auto max-w-[1400px] px-6 pb-32 sm:px-10">
        <div className="reveal ae-tile grid gap-10 p-8 sm:p-12 md:grid-cols-2" data-reveal>
          <div>
            <p className="ae-eyebrow">Preço</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-medium tracking-[-0.03em]">
                {formatBRL(BASE_PLAN.priceCents)}
              </span>
              <span className="text-sm text-muted-foreground">/mês</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {BASE_PLAN.description} Adicione páginas, componentes e recursos só quando precisar.
            </p>
          </div>
          <ul className="flex flex-col justify-end gap-3 text-sm">
            {extraFeatures.map((f) => (
              <li
                key={f.key}
                className="flex items-center justify-between gap-6 border-b border-border pb-3 text-muted-foreground"
              >
                <span>{f.label}</span>
                <span className="tabular-nums text-foreground">+{formatBRL(f.unitPriceCents)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1400px] px-6 pb-40 text-center sm:px-10">
        <h2
          className="reveal text-5xl font-medium leading-[1.02] tracking-[-0.03em] sm:text-7xl"
          data-reveal
        >
          Seu próximo site
          <br />
          começa em um clique.
        </h2>
        <div className="reveal mt-10" data-reveal style={{ transitionDelay: "150ms" }}>
          <Link to="/projects" className="group ae-btn ae-btn-primary ae-btn-lg">
            Criar meu site
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 text-xs text-muted-foreground sm:px-10">
          <AedonLogo />
          <span>© {new Date().getFullYear()} · Um produto Entropy</span>
        </div>
      </footer>
    </div>
  );
}
