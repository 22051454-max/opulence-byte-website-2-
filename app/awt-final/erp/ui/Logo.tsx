/**
 * SM Imperial Hospital mark: a royal shield with a gold crown, a medical cross
 * and a heartbeat line running through the "SM" monogram.
 */
export function Logo({ size = 40, animate = false, className }: { size?: number; animate?: boolean; className?: string }) {
  const d = animate ? 'draw' : undefined
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="SM Imperial Hospital logo">
      <defs>
        <linearGradient id="smi-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e4fb0" />
          <stop offset="1" stopColor="#0a1a36" />
        </linearGradient>
        <linearGradient id="smi-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d98b" />
          <stop offset="1" stopColor="#b9892c" />
        </linearGradient>
      </defs>
      {/* crown */}
      <path d="M38 22 L46 9 L53 19 L60 5 L67 19 L74 9 L82 22 Z" fill="url(#smi-gold)" />
      <circle cx="46" cy="9" r="2.6" fill="#f6d98b" />
      <circle cx="60" cy="5" r="2.8" fill="#f6d98b" />
      <circle cx="74" cy="9" r="2.6" fill="#f6d98b" />
      {/* shield */}
      <path d="M60 24 C74 30 88 30 98 28 L98 62 C98 86 80 102 60 112 C40 102 22 86 22 62 L22 28 C32 30 46 30 60 24 Z" fill="url(#smi-shield)" stroke="url(#smi-gold)" strokeWidth="3.2" />
      {/* cross */}
      <path d="M54 36 h12 v10 h10 v12 h-10 v10 h-12 v-10 h-10 v-12 h10 z" fill="#fff" opacity=".12" />
      {/* monogram */}
      <text x="60" y="76" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="34" fill="url(#smi-gold)" letterSpacing="1">SM</text>
      {/* heartbeat */}
      <path className={d} style={{ ['--len' as string]: 160 }} d="M30 88 H48 L53 80 L59 96 L65 84 L69 88 H90" fill="none" stroke="#5eead4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
