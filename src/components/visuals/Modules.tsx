'use client';
/** Section 5 — five protocol modules, each with its own small motion study. */
import type React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Status } from '@/lib/site';
import { Reveal, StatusBadge } from '../ui';

const loop = (d: number, delay = 0) => ({ duration: d, repeat: Infinity, ease: 'easeInOut' as const, delay });

function TreasuryViz() { // vault balance bars move, the totals stay sealed
  const r = useReducedMotion();
  return (
    <svg viewBox="0 0 240 140" className="h-full w-full" aria-hidden>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.rect key={i} x={20 + i * 36} width="22" y="20" rx="0" fill="none" stroke="#F3F3EF" strokeOpacity=".5"
          initial={{ height: 40 }} animate={r ? {} : { height: [40 + i * 8, 90 - i * 6, 40 + i * 8], y: [100 - i * 8 - 0, 30 + i * 6, 100 - i * 8] }} transition={loop(5 + i * 0.4)} />
      ))}
      <line x1="10" x2="230" y1="125" y2="125" stroke="#292D2B" />
      <text x="20" y="138" fill="#858985" fontSize="8" fontFamily="monospace">balance ▒▒▒▒▒▒ · policy ≤ 2,500,000</text>
    </svg>
  );
}
function ProofViz() { // bit lattice resolving
  const r = useReducedMotion();
  return (
    <svg viewBox="0 0 240 140" className="h-full w-full" aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.rect key={i} x={12 + i * 9.2} width="3" fill={i % 6 === 2 ? '#72D6A1' : '#F3F3EF'}
          initial={{ y: 70, height: 2 }} animate={r ? { y: 50, height: 20 } : { y: [70, 70 - (i % 2 ? 26 : 10), 70], height: [2, i % 2 ? 52 : 20, 2] }} transition={loop(3.2, i * 0.06)} />
      ))}
      <text x="12" y="132" fill="#858985" fontSize="8" fontFamily="monospace">Σ 2ⁱ·Cᵢ = C   ∧   Cᵢ ∈ {'{'}0,1{'}'}</text>
    </svg>
  );
}
function PayrollViz() { // salaries stream out as sealed packets
  const r = useReducedMotion();
  return (
    <svg viewBox="0 0 240 140" className="h-full w-full" aria-hidden>
      <circle cx="40" cy="70" r="16" fill="none" stroke="#F3F3EF" strokeOpacity=".7" />
      {[30, 55, 85, 110].map((y, i) => (
        <g key={i}>
          <line x1="56" y1="70" x2="200" y2={y} stroke="#292D2B" />
          <circle cx="206" cy={y} r="5" fill="none" stroke="#F3F3EF" strokeOpacity=".6" />
          {!r && <motion.rect width="10" height="5" fill="#F3F3EF" initial={{ x: 56, y: 68 }} animate={{ x: [56, 196], y: [68, y - 2], opacity: [0, 1, 0] }} transition={loop(2.6, i * 0.55)} />}
        </g>
      ))}
      <text x="12" y="132" fill="#858985" fontSize="8" fontFamily="monospace">4 payments · amounts sealed · limits proven</text>
    </svg>
  );
}
function DisclosureViz() { // one key opens one field
  const r = useReducedMotion();
  return (
    <svg viewBox="0 0 240 140" className="h-full w-full" aria-hidden>
      {['recipient', 'amount', 'memo', 'invoice'].map((f, i) => (
        <g key={f}>
          <rect x="20" y={18 + i * 26} width="200" height="18" fill="none" stroke="#292D2B" />
          <text x="28" y={30 + i * 26} fill="#858985" fontSize="8" fontFamily="monospace">{f}</text>
          <motion.text x="100" y={30 + i * 26} fontSize="8" fontFamily="monospace" fill={i === 1 ? '#72D6A1' : '#585c59'}
            animate={r || i !== 1 ? {} : { opacity: [0.2, 1, 1, 0.2] }} transition={loop(4)}>{i === 1 ? '48,250.00 USDC  ← auditor key' : '▒▒▒▒▒▒▒▒▒▒▒▒▒▒'}</motion.text>
        </g>
      ))}
    </svg>
  );
}
function ExplorerViz() { // records scroll, each gets a check
  const r = useReducedMotion();
  return (
    <svg viewBox="0 0 240 140" className="h-full w-full overflow-hidden" aria-hidden>
      <motion.g animate={r ? {} : { y: [0, -78] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i}>
            <text x="16" y={22 + i * 26} fill="#F3F3EF" fillOpacity=".7" fontSize="8" fontFamily="monospace">{`prf_${(0x91d0a3 * (i + 3)).toString(16).slice(0, 6)}…`}</text>
            <text x="110" y={22 + i * 26} fill="#858985" fontSize="8" fontFamily="monospace">{['payroll', 'treasury', 'vendor', 'grant'][i % 4]}</text>
            <text x="196" y={22 + i * 26} fill={i % 5 === 3 ? '#E06C5B' : '#72D6A1'} fontSize="8" fontFamily="monospace">{i % 5 === 3 ? 'fail' : 'valid'}</text>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

const MODULES: { n: string; title: string; body: string; status: Status; Viz: () => React.ReactElement; points: string[] }[] = [
  { n: '01', title: 'Private Treasury', Viz: TreasuryViz, status: 'experimental', body: 'Confidential financial operation workflows for digital treasuries. Rebalances and transfers carry a commitment to the amount and a proof that it respects the treasury policy.',
    points: ['Policy limits per category and asset', 'Amounts committed, not published', 'Encrypted operation log for signers'] },
  { n: '02', title: 'Proof Engine', Viz: ProofViz, status: 'experimental', body: 'Generate and verify cryptographic proofs. Today: veilops-range-v1, a bit-decomposition range proof on Pedersen commitments over ristretto255, made non-interactive with Fiat–Shamir.',
    points: ['Proves 0 ≤ amount ≤ limit', 'No trusted setup', 'Verifies in the browser in well under a second'] },
  { n: '03', title: 'Private Payroll', Viz: PayrollViz, status: 'simulated', body: 'Support confidential contributor payment workflows. Batch payouts where each line item is sealed for the contributor and finance, and proven against the payroll policy.',
    points: ['Per-recipient envelopes', 'Compensation never in public records', 'Batch workflow is simulated today'] },
  { n: '04', title: 'Selective Disclosure', Viz: DisclosureViz, status: 'implemented', body: 'Reveal specific information only to authorized parties. A data key is wrapped per viewer (X25519 + HKDF). An auditor can open the envelope and check the commitment opening.',
    points: ['Grant access without re-encrypting', 'Commitment opening proves the disclosed amount', 'Keys never leave the browser'] },
  { n: '05', title: 'Public Proof Explorer', Viz: ExplorerViz, status: 'implemented', body: 'Allow independent verification of permitted public proof records. Every record can be re-verified from scratch in your browser. The dataset is sample data today.',
    points: ['Search by operation or proof id', 'Re-verify any record locally', 'Tampered samples fail, by design'] },
];

export function Modules() {
  return (
    <div className="border-t border-line">
      {MODULES.map((m, i) => (
        <article key={m.n} className="grid gap-8 border-b border-line py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <Reveal className="lg:col-span-1"><span className="font-mono text-[12px] text-mute">{m.n}</span></Reveal>
          <Reveal className={`lg:col-span-5 ${i % 2 ? 'lg:order-3' : ''}`} delay={0.05}>
            <div className="flex items-center gap-3"><StatusBadge status={m.status} /></div>
            <h3 className="mt-5 text-4xl font-medium tracking-[-0.035em] text-paper sm:text-5xl">{m.title}</h3>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-mute">{m.body}</p>
            <ul className="mt-6 space-y-2 font-mono text-[12px] text-paper/75">{m.points.map(p => <li key={p}>— {p}</li>)}</ul>
          </Reveal>
          <Reveal className={`lg:col-span-6 ${i % 2 ? 'lg:order-2' : ''}`} delay={0.12}>
            <div className="hairline-grid aspect-[12/7] border border-line bg-ink-2/40 p-4"><m.Viz /></div>
          </Reveal>
        </article>
      ))}
    </div>
  );
}
