'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { Summary } from '@/lib/samples';
import { loadLocal, clearLocal } from '@/lib/local';
import { ago, fmtAmount, fmtTime, short } from '@/lib/format';
import { StatusBadge } from './ui';
import { useSound } from './sound';

type Row = Pick<Summary, 'operationId' | 'proofId' | 'createdAt' | 'category' | 'asset' | 'mode' | 'policy' | 'status' | 'proofSystem'> & { local?: boolean };
const STATUSES = ['all', 'verified', 'failed', 'pending'] as const;

export function ExplorerTable({ rows: sample }: { rows: Row[] }) {
  const { play } = useSound();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('all');
  const [cat, setCat] = useState('all');
  const [local, setLocal] = useState<Row[]>([]);
  useEffect(() => {
    const read = () => setLocal(loadLocal().map(e => ({ ...e.record, status: e.status, local: true })));
    read(); window.addEventListener('veilops-local', read);
    return () => window.removeEventListener('veilops-local', read);
  }, []);
  const all = useMemo(() => [...local, ...sample], [local, sample]);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter(r => (status === 'all' || r.status === status) && (cat === 'all' || r.category === cat) &&
      (!s || r.operationId.toLowerCase().includes(s) || (r.proofId || '').toLowerCase().includes(s)));
  }, [all, q, status, cat]);
  const counts = useMemo(() => Object.fromEntries(STATUSES.map(s => [s, s === 'all' ? all.length : all.filter(r => r.status === s).length])), [all]);

  return (
    <div>
      <div className="grid gap-px border border-line bg-line sm:grid-cols-4">
        {[['Records', counts.all], ['Verified', counts.verified], ['Failed', counts.failed], ['Pending', counts.pending]].map(([k, v]) => (
          <div key={k as string} className="bg-ink p-5"><div className="label">{k}</div><div className="mt-2 text-4xl font-medium tracking-[-0.03em] text-paper">{v}</div></div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[16rem] flex-1">
          <span className="sr-only">Search by operation or proof id</span>
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input className="field pl-9" placeholder="Search operation ID or proof ID (op_… / prf_…)" value={q} onChange={e => setQ(e.target.value)} />
        </label>
        <div className="flex border border-line" role="group" aria-label="Filter by verification status">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); play('tick'); }} aria-pressed={status === s}
              className={`px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] ${status === s ? 'bg-paper text-ink' : 'text-mute hover:text-paper'}`}>{s} <span className="opacity-60">{counts[s]}</span></button>
          ))}
        </div>
        <select className="field w-auto" value={cat} onChange={e => setCat(e.target.value)} aria-label="Filter by category">
          <option value="all">all categories</option>{['treasury', 'payroll', 'vendor', 'grant', 'operations'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[880px] border-collapse font-mono text-[12px]">
          <thead>
            <tr className="border-b border-line text-left text-mute">
              {['Operation', 'Proof', 'Time', 'Category', 'Asset', 'Policy limit', 'Proof type', 'Result'].map(h => <th key={h} className="px-4 py-3 font-normal uppercase tracking-[0.12em]">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.operationId} className="group border-b border-line/50 transition-colors hover:bg-ink-2">
                <td className="px-4 py-3"><Link href={`/explorer/${r.operationId}`} className="text-paper underline decoration-line underline-offset-4 group-hover:decoration-jade">{short(r.operationId, 9, 5)}</Link>{r.local && <span className="ml-2 text-[10px] text-jade">yours</span>}</td>
                <td className="px-4 py-3 text-paper/75">{short(r.proofId, 9, 5)}</td>
                <td className="px-4 py-3 text-mute" title={fmtTime(r.createdAt)}>{ago(r.createdAt)}</td>
                <td className="px-4 py-3 text-paper/80">{r.category}</td>
                <td className="px-4 py-3 text-paper/80">{r.asset}</td>
                <td className="px-4 py-3 text-paper/80">{fmtAmount(r.policy.maxAmount, '')}</td>
                <td className="px-4 py-3 text-mute">{r.proofSystem}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-mute">No records match.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-3 font-mono text-[11px] text-mute">
        <span>Results shown are the indexer’s recorded status. Open any record to re-verify it in your browser.</span>
        {local.length > 0 && <button onClick={() => clearLocal()} className="hover:text-paper">Clear {local.length} record(s) created in this browser</button>}
      </div>
    </div>
  );
}
