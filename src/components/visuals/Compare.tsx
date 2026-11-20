'use client';
/** Section 4 — what an outside observer can see, side by side. */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../sound';
import { EASE } from '../ui';

type Kind = 'public' | 'confidential' | 'encrypted' | 'proof' | 'outcome';
const LEGEND: Record<Kind, [string, string]> = {
  public: ['Public metadata', 'text-paper'],
  confidential: ['Confidential value', 'text-alert'],
  encrypted: ['Encrypted value', 'text-mute'],
  proof: ['Proof data', 'text-amber'],
  outcome: ['Verification outcome', 'text-jade'],
};

const ROWS: { field: string; open: [string, Kind]; veil: [string, Kind] }[] = [
  { field: 'Sender', open: ['Dao7…Treasury', 'public'], veil: ['Dao7…Treasury', 'public'] },
  { field: 'Recipient', open: ['contributor-0x91', 'confidential'], veil: ['sealed · 3f9a…c21e', 'encrypted'] },
  { field: 'Amount', open: ['48,250.00 USDC', 'confidential'], veil: ['C = 6a1f…09bd (commitment)', 'encrypted'] },
  { field: 'Memo', open: ['October contributor payout', 'confidential'], veil: ['sealed · AES-256-GCM', 'encrypted'] },
  { field: 'Timestamp', open: ['2026-11-04 14:02 UTC', 'public'], veil: ['2026-11-04 14:02 UTC', 'public'] },
  { field: 'Fee / asset', open: ['USDC · 0.000005 SOL', 'public'], veil: ['USDC · 0.000005 SOL', 'public'] },
  { field: 'Policy', open: ['n/a', 'public'], veil: ['pol_3c… · max 60,000.00', 'public'] },
  { field: 'Proof', open: ['n/a', 'public'], veil: ['prf_91d0… · 48 OR-proofs', 'proof'] },
  { field: 'Result', open: ['Everything, forever', 'confidential'], veil: ['0 ≤ amount ≤ limit · VALID', 'outcome'] },
];

export function Compare() {
  const [focus, setFocus] = useState<Kind | null>(null);
  const { play } = useSound();
  const cell = (v: string, k: Kind) => (
    <motion.span className={`block truncate font-mono text-[12.5px] ${LEGEND[k][1]}`} animate={{ opacity: !focus || focus === k ? 1 : 0.18 }} transition={{ duration: 0.4, ease: EASE }}>{v}</motion.span>
  );
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Highlight by data class">
        {(Object.keys(LEGEND) as Kind[]).map(k => (
          <button key={k} onMouseEnter={() => setFocus(k)} onMouseLeave={() => setFocus(null)} onFocus={() => setFocus(k)} onBlur={() => setFocus(null)}
            onClick={() => { setFocus(f => (f === k ? null : k)); play('tick'); }}
            className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${focus === k ? 'border-paper' : 'border-line'} ${LEGEND[k][1]}`}>
            {LEGEND[k][0]}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="w-36 px-5 py-4 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-mute">Field</th>
              <th className="border-l border-line px-5 py-4 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-mute">Ordinary public transfer</th>
              <th className="border-l border-line px-5 py-4 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-paper">VEILOPS operation</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(r => (
              <tr key={r.field} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">{r.field}</td>
                <td className="max-w-0 border-l border-line px-5 py-3">{cell(...r.open)}</td>
                <td className="max-w-0 border-l border-line px-5 py-3">{cell(...r.veil)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-mute">
        Illustrative values. Sender, timing, fees, asset, policy limit and the fact that an operation happened remain observable. That is metadata the
        underlying chain or indexer exposes. VEILOPS conceals amounts and, by mode, recipients and memos. It does not make operations anonymous.
      </p>
    </div>
  );
}
