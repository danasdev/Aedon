/** The Aedon logo mark (public/aedon-mark.png), cropped from the brand asset (public/AEDON.png). */
export function AedonMark({ className = "w-4 h-4" }: { className?: string }) {
  return <img src="/aedon-mark.png" alt="Aedon" className={`${className} object-contain`} />;
}

/** Mark + wordmark lockup, following the brand asset: light, widely tracked capitals. */
export function AedonLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <AedonMark className="h-5 w-5" />
      <span className="text-[13px] font-normal tracking-[0.32em] text-foreground">AEDON</span>
    </span>
  );
}
