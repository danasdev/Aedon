import type { ReactNode } from "react";
import { PanelLeftClose } from "@/components/icons";

/** Frame shared by the left panels: title row, close, scrolling body. Overlay on narrow screens. */
export function PanelShell({
  title,
  action,
  onClose,
  overlay,
  children,
}: {
  title: string;
  action?: ReactNode;
  onClose: () => void;
  overlay?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {overlay && <div className="absolute inset-0 z-20 bg-black/60" onClick={onClose} />}
      <aside
        aria-label={title}
        className={`editor-library-in flex w-[304px] max-w-[88vw] shrink-0 flex-col border-r border-border bg-panel ${
          overlay ? "absolute inset-y-0 left-[76px] z-30 shadow-2xl" : ""
        }`}
      >
        <div className="flex h-[58px] shrink-0 items-center justify-between gap-2 px-4">
          <h2 className="ae-title">{title}</h2>
          <div className="flex items-center gap-1">
            {action}
            <button
              type="button"
              onClick={onClose}
              className="ae-ib h-8 w-8"
              aria-label="Fechar painel"
              title="Fechar painel"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin pb-4">{children}</div>
      </aside>
    </>
  );
}
