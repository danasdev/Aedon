import { getVariant } from "@/lib/editor/sections";
import { PAGE_PRESETS, type PagePreset } from "@/lib/editor/presets";
import { VariantPreview } from "./SectionLibrary";

/** Shown instead of the page frame while a page has no sections: pick a starting point. */
export function EmptyPageStart({ onPick }: { onPick: (preset: PagePreset) => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-2 py-10 text-center">
      <h2 className="text-xl font-semibold tracking-tight">Por onde quer começar?</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Escolha uma página pronta e edite tudo depois, ou adicione blocos avulsos pela lista à esquerda.
      </p>
      <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
        {PAGE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPick(preset)}
            className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-foreground/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground"
          >
            <div className="h-28 overflow-hidden bg-white">
              {preset.sectionIds.slice(0, 3).map((id) => (
                <div key={id} className="h-[37px] overflow-hidden border-b border-black/10">
                  <VariantPreview variantId={id} defaults={getVariant(id)?.defaults ?? {}} scale={0.16} height={37} />
                </div>
              ))}
            </div>
            <div className="px-3 py-2.5">
              <p className="text-sm font-medium">{preset.name}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{preset.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
