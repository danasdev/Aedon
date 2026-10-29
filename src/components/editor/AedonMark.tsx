/**
 * Aedon mark: a rounded block with three stacked bars — the sections of a page.
 * Drawn in ink on void, following the Entropy logo rule; ion stays reserved for interaction.
 */
export function AedonMark({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} role="img" aria-label="Aedon">
      <rect width="28" height="28" rx="8" fill="var(--ink, #f5f4f1)" />
      <rect x="7" y="7.5" width="14" height="3.4" rx="1.7" fill="var(--void, #0a0a0a)" />
      <rect x="7" y="12.3" width="10" height="3.4" rx="1.7" fill="var(--void, #0a0a0a)" />
      <rect x="7" y="17.1" width="6" height="3.4" rx="1.7" fill="var(--void, #0a0a0a)" />
    </svg>
  );
}

/** Mark + wordmark lockup. */
export function AedonLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <AedonMark className="h-7 w-7" />
      <span className="font-display text-[15px] font-black tracking-[0.04em] text-foreground">
        AEDON
      </span>
    </span>
  );
}
