import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { markTourDone } from "@/lib/editor/tour";

/** Each step points at a `data-tour` anchor in the editor. */
const STEPS: { anchor: string; title: string; body: string }[] = [
  {
    anchor: "canvas",
    title: "Clique no que quer mudar",
    body: "Textos, imagens, botões e seções: tudo se edita direto no site. Dois cliques num texto já deixam você digitar.",
  },
  {
    anchor: "toolbar",
    title: "Uma barra para tudo",
    body: "Esta barra muda conforme o que você selecionou. Cores, tamanho, trocar imagem, mover ou excluir ficam sempre aqui.",
  },
  {
    anchor: "add",
    title: "Adicione blocos",
    body: "Escolha seções prontas ou páginas inteiras. Você também pode passar o mouse entre dois blocos e clicar em “Adicionar seção”.",
  },
  {
    anchor: "pages",
    title: "Páginas do site",
    body: "Crie, renomeie e organize as páginas. A primeira da lista é a página inicial.",
  },
  {
    anchor: "publish",
    title: "Veja e entregue",
    body: "“Prévia” mostra o site como o visitante vê, com links funcionando. “Exportar” baixa o HTML pronto.",
  },
];

const CARD_WIDTH = 320;
const GAP = 14;

type Rect = { top: number; left: number; width: number; height: number };

export function OnboardingTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<Element | null>(null);
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  const finish = useCallback(() => {
    markTourDone();
    onClose();
  }, [onClose]);

  // Remember and restore focus around the overlay.
  useEffect(() => {
    restoreRef.current = document.activeElement;
    return () => (restoreRef.current as HTMLElement | null)?.focus?.();
  }, []);

  // Track the highlighted anchor (it can move as panels open or the window resizes).
  useLayoutEffect(() => {
    const measure = () => {
      const el = document.querySelector(`[data-tour="${current.anchor}"]`);
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    const t = window.setInterval(measure, 400);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearInterval(t);
    };
  }, [current.anchor]);

  useEffect(() => {
    primaryRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "ArrowRight" && !last) setStep((s) => s + 1);
      else if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1);
      else if (e.key === "Tab") {
        // Keep focus inside the card while the tour is open.
        const items = Array.from(cardRef.current?.querySelectorAll<HTMLElement>("button") ?? []);
        if (!items.length) return;
        const index = items.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        items[(index + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [finish, last, step]);

  // Card placement: right of narrow anchors (the side rail), otherwise below or above.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  let cardStyle: React.CSSProperties = { left: vw / 2 - CARD_WIDTH / 2, top: vh / 2 - 100 };
  if (rect) {
    if (rect.width < 120) {
      cardStyle = { left: rect.left + rect.width + GAP, top: Math.min(rect.top, vh - 240) };
    } else if (rect.height > vh * 0.5) {
      // Large areas (the canvas): sit near the bottom so the content stays visible.
      cardStyle = { left: rect.left + 24, top: rect.top + rect.height - 236 };
    } else if (rect.top + rect.height + 230 < vh) {
      cardStyle = {
        left: rect.left + rect.width / 2 - CARD_WIDTH / 2,
        top: rect.top + rect.height + GAP,
      };
    } else {
      cardStyle = {
        left: rect.left + rect.width / 2 - CARD_WIDTH / 2,
        top: Math.max(16, rect.top - 220),
      };
    }
    cardStyle.left = Math.max(16, Math.min(Number(cardStyle.left), vw - CARD_WIDTH - 16));
  }

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
    >
      {/* Spotlight: a transparent box whose huge shadow dims everything else. */}
      <div
        className="pointer-events-none absolute rounded-xl transition-all duration-300 ease-out motion-reduce:transition-none"
        style={
          rect
            ? {
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                boxShadow: "0 0 0 2px var(--ion), 0 0 0 9999px rgb(5 5 5 / 0.72)",
              }
            : { inset: 0, background: "rgb(5 5 5 / 0.72)" }
        }
      />
      {/* Clicks outside the card do nothing (the tour has explicit buttons). */}
      <div className="absolute inset-0" aria-hidden />

      <div
        key={step}
        ref={cardRef}
        className="editor-float-in absolute rounded-2xl border border-border bg-surface p-5 shadow-[0_24px_60px_-16px_rgb(0_0_0/0.9)]"
        style={{ ...cardStyle, width: CARD_WIDTH }}
      >
        <div className="flex items-center justify-between">
          <span className="ae-eyebrow">
            Passo {step + 1} de {STEPS.length}
          </span>
          <div className="flex gap-1" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-4 bg-ion" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>
        </div>
        <h2 id="tour-title" className="mt-3 text-base font-semibold leading-snug text-foreground">
          {current.title}
        </h2>
        <p id="tour-body" className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {current.body}
        </p>
        <div className="mt-5 flex items-center justify-between gap-2">
          <button type="button" onClick={finish} className="ae-btn ae-btn-flat ae-btn-sm">
            Pular tutorial
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="ae-btn ae-btn-sm"
              >
                Voltar
              </button>
            )}
            <button
              ref={primaryRef}
              type="button"
              onClick={() => (last ? finish() : setStep((s) => s + 1))}
              className="ae-btn ae-btn-primary ae-btn-sm"
            >
              {last ? "Começar a editar" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
