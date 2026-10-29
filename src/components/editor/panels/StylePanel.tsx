import { useState } from "react";
import type { Typography } from "@/lib/editor/types";
import { PaintBucket } from "@/components/icons";
import { TypographyPanel } from "../TypographyPanel";
import { PanelShell } from "./PanelShell";

interface Props {
  typography: Typography;
  onTypographyChange: (patch: Partial<Typography>) => void;
  /** Name of the selected section whose colours can be copied everywhere, if any. */
  colorSource: string | null;
  onApplyColorsToAll: () => void;
  onClose: () => void;
  overlay?: boolean;
}

export function StylePanel({
  typography,
  onTypographyChange,
  colorSource,
  onApplyColorsToAll,
  onClose,
  overlay,
}: Props) {
  const [applied, setApplied] = useState(false);
  return (
    <PanelShell title="Estilo do site" onClose={onClose} overlay={overlay}>
      <p className="px-4 text-[13px] leading-relaxed text-muted-foreground">
        Vale para todas as páginas. Cada seção ainda pode ter a própria cor.
      </p>

      <p className="ae-label px-4 pb-2 pt-5">Cores</p>
      <div className="px-4">
        <button
          type="button"
          disabled={!colorSource}
          onClick={() => {
            onApplyColorsToAll();
            setApplied(true);
            window.setTimeout(() => setApplied(false), 1600);
          }}
          className="ae-btn w-full"
        >
          <PaintBucket className="h-4 w-4" />
          {applied ? "Cores aplicadas" : "Usar as cores desta seção no site todo"}
        </button>
        <p className="mt-2 text-xs leading-relaxed text-faint">
          {colorSource
            ? `Copia fundo, texto e destaque de “${colorSource}”.`
            : "Selecione uma seção no site para copiar as cores dela."}
        </p>
      </div>

      <p className="ae-label px-4 pb-1 pt-5">Fontes e texto</p>
      <TypographyPanel typography={typography} onChange={onTypographyChange} />
    </PanelShell>
  );
}
