'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadLocal, type LocalEntry } from '@/lib/local';
import { Kv, StatusBadge, Label } from './ui';
import { VerifyPlayground } from './VerifyPlayground';
import { fmtAmount, fmtTime, kb } from '@/lib/format';

export function LocalRecord({ id }: { id: string }) {
  const [e, setE] = useState<LocalEntry | null | undefined>(undefined);
  useEffect(() => setE(loadLocal().find(x => x.record.operationId === id) ?? null), [id]);
  if (e === undefined) return <section className="page pt-40 font-mono text-mute">Loading…</section>;
  if (e === null) return <section className="page pt-40"><h1 className="text-4xl text-paper">Record not found</h1><p className="mt-4 text-mute">No sample record or record created in this browser has the id <span className="font-mono">{id}</span>.</p><Link href="/explorer" className="btn-ghost mt-8">Back to explorer</Link></section>;
  const r = e.record;
  return (
    <section className="page pt-36">
      <Link href="/explorer" className="label hover:text-paper">← Explorer</Link>
      <div className="mt-8 flex gap-3"><StatusBadge status={e.status} /><StatusBadge status="implemented">created in this browser</StatusBadge></div>
      <h1 className="mt-5 break-all font-mono text-2xl text-paper sm:text-4xl">{r.operationId}</h1>
      <div className="mt-12 grid gap-px border border-line bg-line lg:grid-cols-2">
        <div className="bg-ink p-6 sm:p-8"><Label className="mb-4">Operation</Label>
          <Kv k="Proof ID" v={r.proofId} /><Kv k="Published" v={fmtTime(r.createdAt)} /><Kv k="Category" v={r.category} /><Kv k="Asset" v={r.asset} /><Kv k="Mode" v={r.mode} />
          <Kv k="Recipient" v={r.recipient ?? <span className="text-mute">confidential</span>} /></div>
        <div className="bg-ink p-6 sm:p-8"><Label className="mb-4">Lifecycle</Label>
          {e.stages.map(s => <Kv key={s.stage} k={s.stage} v={<span className={s.ok ? '' : 'text-alert'}>{s.detail}</span>} />)}
          <Kv k="Limit" v={fmtAmount(r.policy.maxAmount, r.asset)} /><Kv k="Proof size" v={kb(r.proof)} /></div>
      </div>
      <div className="mt-14"><Label className="mb-5">Verify this record</Label><VerifyPlayground initialId={r.operationId} /></div>
    </section>
  );
}
