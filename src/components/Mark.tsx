/** VEILOPS mark: a committed value (filled disc) behind a veil (offset ring), cut by the verification line. */
export function Mark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="9.5" cy="12" r="6.5" fill="currentColor" />
      <circle cx="14.5" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 12h22" stroke="#080909" strokeWidth="1.4" />
      <path d="M16 12h7" stroke="#72D6A1" strokeWidth="1.4" />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark />
      <span className="font-sans text-[15px] font-semibold tracking-[0.32em]">VEILOPS</span>
    </span>
  );
}
