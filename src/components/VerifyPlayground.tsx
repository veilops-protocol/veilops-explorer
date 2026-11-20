'use client';
/**
 * Proof verification playground. Verification here is REAL: the browser runs verifyRecord() from
 * @veilops/proof-engine (range proofs + proof-id binding + Ed25519 attestation). Records are SAMPLE data.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Server, Monitor, Shuffle, Pencil, RotateCcw } from 'lucide-react';
import type { PublicRecord } from '@veilops/shared';
import type { RecordVerification } from '@veilops/proof-engine';
import { useSound } from './sound';
import { EASE, Kv, StatusBadge } from './ui';
import { fmtAmount, fmtTime, kb, short } from '@/lib/format';
import { loadLocal } from '@/lib/local';

type Summary = { operationId: string; proofId: string; category: string; asset: string; status: 'verified' | 'failed' | 'pending'; createdAt: string };
type Result = RecordVerification & { where: 'browser' | 'server' };

export function VerifyPlayground({ initialId, compact = false }: { initialId?: string; compact?: boolean }) {
  const { play } = useSound();
  const [list, setList] = useState<Summary[]>([]);
  const [record, setRecord] = useState<PublicRecord | null>(null);
  const [original, setOriginal] = useState<PublicRecord | null>(null);
  const [note, setNote] = useState<string | undefined>();
  const [busy, setBusy] = useState<'browser' | 'server' | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [shown, setShown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [paste, setPaste] = useState('');

  const load = useCallback(async (id: string) => {
    setResult(null); setError(null);
    const local = loadLocal().find(e => e.record.operationId === id);
    if (local) { setRecord(local.record); setOriginal(local.record); setNote('Created in this browser.'); return; }
    const r = await fetch(`/api/records/${id}`);
    if (!r.ok) { setError('Record not found.'); return; }
    const j = await r.json();
    setRecord(j.record); setOriginal(j.record); setNote(j.note);
  }, []);

  useEffect(() => {
    fetch('/api/records').then(r => r.json()).then(j => {
      const rows: Summary[] = j.records.filter((x: Summary) => x.status !== 'pending');
      const local = loadLocal().map(e => ({ operationId: e.record.operationId, proofId: e.record.proofId, category: e.record.category, asset: e.record.asset, status: e.status, createdAt: e.record.createdAt }));
      setList([...local, ...rows]);
      void load(initialId ?? rows.find(x => x.status === 'verified')?.operationId ?? rows[0]!.operationId);
    }).catch(() => setError('Could not load sample records.'));
  }, [initialId, load]);

  const random = () => { const pick = list[Math.floor(Math.random() * list.length)]; if (pick) { void load(pick.operationId); play('click'); } };

  const run = async (where: 'browser' | 'server') => {
    if (!record) return;
    setBusy(where); setResult(null); setShown(0); play('scan');
    await new Promise(r => setTimeout(r, 60)); // let the UI paint before the CPU-bound check
    try {
      let rep: RecordVerification;
      if (where === 'browser') {
        const { verifyRecord } = await import('@veilops/proof-engine');
        rep = verifyRecord(record);
      } else {
        const r = await fetch('/api/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(record) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'server error');
        rep = j;
      }
      setResult({ ...rep, where });
      for (let i = 1; i <= rep.checks.length; i++) { await new Promise(r => setTimeout(r, 110)); setShown(i); play('tick'); }
      play(rep.valid ? 'confirm' : 'fail');
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(null); }
  };

  const tamper = (kind: 'limit' | 'asset' | 'time') => {
    if (!record) return;
    setResult(null); play('data');
    if (kind === 'limit') setRecord({ ...record, policy: { ...record.policy, maxAmount: Math.max(1, Math.floor(record.policy.maxAmount / 2)) } });
    if (kind === 'asset') setRecord({ ...record, asset: record.asset === 'USDC' ? 'SOL' : 'USDC' });
    if (kind === 'time') setRecord({ ...record, createdAt: new Date(Date.parse(record.createdAt) - 86400000).toISOString() });
  };
  const edited = useMemo(() => !!record && !!original && JSON.stringify(record) !== JSON.stringify(original), [record, original]);

  const loadPaste = () => {
    try {
      const j = JSON.parse(paste);
      const rec: PublicRecord = j.record ?? j;
      if (typeof rec.proof !== 'string') throw new Error();
      setRecord(rec); setOriginal(rec); setNote('Pasted record.'); setResult(null); setPasteOpen(false); setError(null);
    } catch { setError('That is not a VEILOPS public record (JSON).'); }
  };

  return (
    <div className="border border-line">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-ink-2/50 p-3">
        <label className="sr-only" htmlFor="rec-select">Example record</label>
        <select id="rec-select" className="field max-w-full flex-1 sm:max-w-md" value={original?.operationId ?? ''} onChange={e => { void load(e.target.value); play('click'); }}>
          {list.map(r => <option key={r.operationId} value={r.operationId}>{r.operationId} · {r.category} · {r.asset} · {r.status}</option>)}
        </select>
        <button className="btn-ghost !py-2.5" onClick={random}><Shuffle size={13} /> Load example</button>
        <button className="btn-ghost !py-2.5" onClick={() => setPasteOpen(o => !o)}>Paste JSON</button>
        <span className="ml-auto"><StatusBadge status="sample">sample data</StatusBadge></span>
      </div>
      {pasteOpen && (
        <div className="border-b border-line p-3">
          <textarea className="field h-32 resize-y" placeholder='{"version":"veilops/0.1", ...}' value={paste} onChange={e => setPaste(e.target.value)} aria-label="Record JSON" />
          <button className="btn-primary mt-2 !py-2" onClick={loadPaste}>Load record</button>
        </div>
      )}

      <div className={`grid gap-px bg-line ${compact ? '' : 'lg:grid-cols-[1.1fr_1fr]'}`}>
        {/* inputs */}
        <div className="bg-ink p-5 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="label">Public inputs</div>
            {edited && <button onClick={() => { setRecord(original); setResult(null); }} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber"><RotateCcw size={11} /> edited · restore</button>}
          </div>
          {record ? (
            <div>
              <Kv k="Operation" v={record.operationId} />
              <Kv k="Proof ID" v={record.proofId || '—'} />
              <Kv k="Timestamp" v={fmtTime(record.createdAt)} />
              <Kv k="Category / asset" v={`${record.category} · ${record.asset}`} />
              <Kv k="Mode" v={record.mode} />
              <Kv k="Policy" v={<>{short(record.policy.id, 12, 4)} · max <span className={original && record.policy.maxAmount !== original.policy.maxAmount ? 'text-amber' : ''}>{fmtAmount(record.policy.maxAmount, record.asset)}</span> · n={record.policy.rangeBits}</>} />
              <Kv k="Commitment" v={short(record.amountCommitment, 18, 10)} />
              <Kv k="Recipient" v={record.recipient ?? <span className="text-mute">sealed</span>} />
              <Kv k="Proof" v={`${record.proofSystem} · ${kb(record.proof)}`} />
              <Kv k="Attested by" v={short(record.attestation.publicKey, 12, 8)} />
              <div className="mt-6">
                <div className="label mb-2 flex items-center gap-2"><Pencil size={11} /> Try to cheat</div>
                <div className="flex flex-wrap gap-2">
                  <button className="border border-line px-3 py-1.5 font-mono text-[11px] text-paper/80 hover:border-amber hover:text-amber" onClick={() => tamper('limit')}>Claim a stricter limit</button>
                  <button className="border border-line px-3 py-1.5 font-mono text-[11px] text-paper/80 hover:border-amber hover:text-amber" onClick={() => tamper('asset')}>Swap the asset</button>
                  <button className="border border-line px-3 py-1.5 font-mono text-[11px] text-paper/80 hover:border-amber hover:text-amber" onClick={() => tamper('time')}>Backdate it</button>
                </div>
              </div>
              {note && <p className="mt-5 font-mono text-[11px] leading-relaxed text-mute">{note}</p>}
            </div>
          ) : <div className="font-mono text-[12px] text-mute">{error ?? 'Loading…'}</div>}
        </div>

        {/* verification */}
        <div className="flex flex-col bg-ink p-5 sm:p-8">
          <div className="label mb-4">Verification</div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" disabled={!record || !!busy} onClick={() => run('browser')}><Monitor size={13} /> {busy === 'browser' ? 'Verifying…' : 'Verify in browser'}</button>
            <button className="btn-ghost" disabled={!record || !!busy} onClick={() => run('server')}><Server size={13} /> {busy === 'server' ? 'Verifying…' : 'Verify on server'}</button>
          </div>
          <div className="mt-6 flex-1 space-y-px">
            {(result?.checks ?? []).slice(0, shown).map(c => (
              <motion.div key={c.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: EASE }}
                className="grid grid-cols-[1.25rem_7rem_1fr] items-baseline gap-2 border-b border-line/60 py-2 font-mono text-[12px]">
                <span className={c.passed ? 'text-jade' : 'text-alert'}>{c.passed ? '✓' : '✕'}</span>
                <span className="text-paper/90">{c.name}</span>
                <span className="text-mute">{c.detail}</span>
              </motion.div>
            ))}
            {!result && !busy && <p className="font-mono text-[12px] leading-relaxed text-mute">Runs the full veilops-range-v1 verifier (both range proofs, the proof-id hash and the Ed25519 attestation). No trust in this website is needed. The same code ships in @veilops/proof-engine.</p>}
          </div>
          <AnimatePresence>
            {result && shown >= result.checks.length && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mt-6 border-t border-line pt-5">
                <div className={`text-4xl font-medium tracking-[-0.03em] sm:text-5xl ${result.valid ? 'text-paper' : 'text-alert'}`}>
                  {result.valid ? <>VALID <span className="text-jade">/</span> VERIFIED</> : 'INVALID'}
                </div>
                <div className="mt-3 font-mono text-[11px] text-mute">verified in your {result.where} · {result.verifyMs} ms · amount never revealed</div>
              </motion.div>
            )}
          </AnimatePresence>
          {error && record && <p className="mt-4 font-mono text-[12px] text-alert">{error}</p>}
          <div className="mt-8 border-t border-line pt-4 font-mono text-[10.5px] leading-relaxed text-mute">
            <span className="text-paper/80">Implementation status:</span> real cryptographic verification · proof system experimental and unaudited · records are sample data signed by a throwaway sample-operator key · no blockchain involved.
          </div>
        </div>
      </div>
    </div>
  );
}
