import { getVariant } from "@/lib/editor/sections";
import { PAGE_PRESETS, type PagePreset } from "@/lib/editor/presets";
import { Plus } from "lucide-react";
import { VariantPreview } from "./VariantPreview";

/** Shown instead of the page frame while a page has no sections: pick a starting point. */
export function EmptyPageStart({
  onPick,
  onAddSection,
}: {
  onPick: (preset: PagePreset) => void;
  onAddSection: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-2 pb-10 pt-8">
      <p className="ae-eyebrow">// página vazia</p>
      <h2 className="ae-display mt-3 text-[34px]">Por onde quer começar?</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Escolha uma página pronta e edite tudo depois, ou monte bloco por bloco.
      </p>
      <div className="mt-8 grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
        {PAGE_PRESETS.map((preset) => (
          // Not a <button>: the thumbnail renders the site's own buttons inside.
          <div
            key={preset.id}
            role="button"
            tabIndex={0}
            onClick={() => onPick(preset)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPick(preset);
              }
            }}
            className="group cursor-pointer text-left outline-none"
          >
            <div className="ae-tile overflow-hidden p-2 group-hover:-translate-y-0.5 group-focus-visible:border-ion">
              <div className="overflow-hidden rounded-[7px]">
                {preset.sectionIds.slice(0, 3).map((id) => (
                  <VariantPreview
                    key={id}
                    variantId={id}
                    defaults={getVariant(id)?.defaults ?? {}}

                    height={42}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm font-semibold">{preset.name}</p>
            <p className="line-clamp-1 font-mono text-[10.5px] text-faint">
              {preset.sectionIds.length} blocos · {preset.description.toLowerCase()}
            </p>
          </div>
        ))}
      </div>
      <button type="button" onClick={onAddSection} className="ae-btn mt-8">
        <Plus className="h-4 w-4" /> Montar bloco por bloco
      </button>
    </div>
  );
}
