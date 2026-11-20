import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { find, dataset } from '@/lib/samples';
import { Kv, StatusBadge, Label } from '@/components/ui';
import { VerifyPlayground } from '@/components/VerifyPlayground';
import { LocalRecord } from '@/components/LocalRecord';
import { fmtAmount, fmtTime, kb } from '@/lib/format';
import anchorsFile from '../../../../data/devnet-anchors.json';

export function generateStaticParams() { return dataset().records.map(e => ({ id: e.record.operationId })); }
export const dynamicParams = true;
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const { id } = await params; return { title: `Operation ${id}` }; }

export default async function OperationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = find(id);
  if (!e) {
    // may be a record created in this browser — resolved client-side
    if (/^op_[0-9a-f]{16}$/.test(id)) return <LocalRecord id={id} />;
    notFound();
  }
  const r = e.record;
  const pol = dataset().policies.find(p => p.id === r.policy.id);
  const anchor = (anchorsFile.anchors as { operationId: string; signature: string; slot: number | null }[]).find(a => a.operationId === r.operationId);
  return (
    <section className="page pt-36">
      <Link href="/explorer" className="label hover:text-paper">← Explorer</Link>
      <div className="mt-8 flex flex-wrap items-center gap-3"><StatusBadge status={e.status} /><StatusBadge status="sample">sample</StatusBadge></div>
      <h1 className="mt-5 break-all font-mono text-2xl text-paper sm:text-4xl">{r.operationId}</h1>
      {e.note && <p className="mt-4 max-w-2xl text-[14px] text-mute">{e.note}</p>}

      <div className="mt-12 grid gap-px border border-line bg-line lg:grid-cols-2">
        <div className="bg-ink p-6 sm:p-8">
          <Label className="mb-4">Operation</Label>
          <Kv k="Operation ID" v={r.operationId} />
          <Kv k="Proof ID" v={r.proofId || '—'} />
          <Kv k="Published" v={fmtTime(r.createdAt)} />
          <Kv k="Category" v={r.category} />
          <Kv k="Asset" v={r.asset} />
          <Kv k="Mode" v={r.mode} />
          <Kv k="Recipient" v={r.recipient ?? <span className="text-mute">confidential</span>} />
          <Kv k="Amount" v={<span className="text-mute">confidential (committed)</span>} />
        </div>
        <div className="bg-ink p-6 sm:p-8">
          <Label className="mb-4">Proof &amp; policy</Label>
          <Kv k="Proof type" v={r.proofSystem} />
          <Kv k="Proof size" v={r.proof ? kb(r.proof) : '—'} />
          <Kv k="Policy" v={`${pol?.name ?? 'unknown'} · ${r.policy.id}`} />
          <Kv k="Public limit" v={fmtAmount(r.policy.maxAmount, r.asset)} />
          <Kv k="Range bits" v={r.policy.rangeBits} />
          <Kv k="Commitment" v={r.amountCommitment || '—'} />
          <Kv k="Envelope digest" v={r.envelopeDigest} />
          <Kv k="Attested by" v={r.attestation.publicKey} />
          {anchor && <Kv k="Solana devnet" v={<a className="text-jade underline decoration-jade/40 underline-offset-4 hover:decoration-jade" href={`https://explorer.solana.com/tx/${anchor.signature}?cluster=devnet`} target="_blank" rel="noreferrer">anchored · slot {anchor.slot ?? '?'} · {anchor.signature.slice(0, 12)}…</a>} />}
        </div>
      </div>

      {e.status === 'pending'
        ? <p className="mt-10 border border-line p-6 font-mono text-[13px] text-amber">No proof is attached to this record yet, so there is nothing to verify.</p>
        : <div className="mt-14"><Label className="mb-5">Verify this record</Label><VerifyPlayground initialId={r.operationId} /></div>}
    </section>
  );
}
