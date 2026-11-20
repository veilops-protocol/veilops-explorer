'use client';
/**
 * Interactive protocol demonstration. Everything runs in this browser with the real SDK:
 * AES-256-GCM envelope, policy evaluation, veilops-range-v1 proof, Ed25519 attestation, verification.
 * Keys live in memory for this page only and are discarded on reload. Only the public record is saved locally.
 */
import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Eye, KeyRound, ArrowRight } from 'lucide-react';
import type { OperationCategory, ConfidentialityMode, PublicRecord } from '@veilops/shared';
import type { Envelope, KeyPair } from '@veilops/encryption';
import type { PolicyResult } from '@veilops/policy-engine';
import { useSound } from './sound';
import { EASE, Kv, StatusBadge } from './ui';
import { fmtAmount, fmtTime, kb, short } from '@/lib/format';
import { saveLocal } from '@/lib/local';

const STAGE_LABEL: Record<string, [string, string]> = {
  created: ['Operation created', 'A random operation id is assigned; nothing has left this page.'],
  encrypted: ['Sensitive values encrypted', 'Name, recipient, amount and memo sealed with AES-256-GCM; data key wrapped with X25519 + HKDF.'],
  policy: ['Policy conditions evaluated', 'Category, asset, mode and the amount limit checked on the plaintext, locally.'],
  proof: ['Proof generated', 'veilops-range-v1: Pedersen commitment + range proofs showing 0 ≤ amount ≤ limit.'],
  verified: ['Verification result', 'The public record is re-verified from scratch, exactly as any third party would.'],
};
const ORDER = ['created', 'encrypted', 'policy', 'proof', 'verified'];

type Stage = { stage: string; at: string; ms: number; detail: string; ok: boolean };
type Done = { record: PublicRecord; envelope: Envelope; owner: KeyPair; policy: PolicyResult; valid: boolean; opening: { value: string; blinding: string } };

const toUnits = (s: string) => Math.round(Number(s.replace(/[, ]/g, '')) * 100);
const bitsFor = (limit: number) => Math.min(48, Math.max(16, Math.ceil(Math.log2(limit + 1))));

export function OperationDemo({ onDone }: { onDone?: () => void }) {
  const { play } = useSound();
  const [f, setF] = useState({ name: 'November contributor payout', category: 'payroll' as OperationCategory, recipient: 'contributor-0x91', amount: '4,825.00', asset: 'USDC', limit: '6,000.00', mode: 'amount-and-recipient' as ConfidentialityMode, memo: 'Design work, sprint 14' });
  const [stages, setStages] = useState<Stage[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [violation, setViolation] = useState<PolicyResult | null>(null);
  const [plain, setPlain] = useState<string | null>(null);
  const [auditor, setAuditor] = useState<{ ok: boolean; text: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = toUnits(f.amount), limit = toUnits(f.limit);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(limit) || limit <= 0) { setErr('Enter a valid amount and policy limit.'); return; }
    if (limit >= 2 ** 48) { setErr('Policy limit too large for this demo (max 2^48 minor units).'); return; }
    setErr(null); setStages([]); setDone(null); setViolation(null); setPlain(null); setAuditor(null); setRunning(true); play('click');
    try {
      const [{ createClient, PolicyViolation }, { definePolicy }, enc] = await Promise.all([import('@veilops/sdk'), import('@veilops/policy-engine'), import('@veilops/encryption')]);
      const owner = enc.generateViewingKeyPair();
      const veil = createClient({ owner });
      const policy = definePolicy({ name: 'demo', maxAmount: limit, rangeBits: bitsFor(limit), allowedAssets: ['USDC', 'SOL', 'USDT', 'PYUSD'] });
      const cues: Record<string, Parameters<typeof play>[0]> = { created: 'click', encrypted: 'seal', policy: 'scan', proof: 'pulse', verified: 'confirm' };
      try {
        const res = await veil.process(
          { name: f.name, category: f.category, recipient: f.recipient, amount, asset: f.asset, policyLimit: limit, mode: f.mode, memo: f.memo },
          policy,
          { onStage: async ev => { setStages(s => [...s, ev]); play(ev.ok ? cues[ev.stage]! : 'fail'); await new Promise(r => setTimeout(r, ev.stage === 'policy' ? 380 : 520)); } },
        );
        setDone({ record: res.record, envelope: res.envelope, owner, policy: res.policy, valid: res.verification.valid, opening: res.opening });
        saveLocal({ record: res.record, status: res.verification.valid ? 'verified' : 'failed', stages: res.stages });
        onDone?.();
      } catch (x) {
        if (x instanceof PolicyViolation) { setViolation(x.result); }
        else throw x;
      }
    } catch (x) {
      setErr((x as Error).message);
    } finally { setRunning(false); }
  };

  const decrypt = async () => {
    if (!done) return;
    const { openText } = await import('@veilops/encryption');
    setPlain(await openText(done.envelope, done.owner.secretKey)); play('reveal');
  };
  const disclose = async () => {
    if (!done) return;
    const [{ grantAccess, generateViewingKeyPair, openText }, { verifyOpening, scalarFromHex }] = await Promise.all([import('@veilops/encryption'), import('@veilops/proof-engine')]);
    const aud = generateViewingKeyPair();
    const env2 = await grantAccess(done.envelope, done.owner.secretKey, aud.publicKey);
    const text = await openText(env2, aud.secretKey);
    const amount = JSON.parse(text).amount as number;
    const ok = verifyOpening(done.record.amountCommitment, BigInt(amount), scalarFromHex(done.opening.blinding));
    setAuditor({ ok, text: `${fmtAmount(amount, done.record.asset)} · commitment opening ${ok ? 'matches' : 'does NOT match'} the public record` });
    play(ok ? 'reveal' : 'fail');
  };

  const sensitive = (k: string) => (k === 'amount' || k === 'name' || k === 'memo' || (k === 'recipient' && f.mode !== 'amount-only'));
  const field = (k: keyof typeof f, label: string, el: React.ReactNode) => (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
        {label}{sensitive(k) ? <span className="flex items-center gap-1 text-paper/60"><Lock size={10} /> sealed</span> : <span>public</span>}
      </span>
      {el}
    </label>
  );

  return (
    <div className="grid gap-px border border-line bg-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <form ref={formRef} onSubmit={submit} className="space-y-4 bg-ink p-5 sm:p-8" aria-label="Create a sample financial operation">
        <div className="flex items-center justify-between"><div className="label">New operation</div><StatusBadge status="implemented">runs locally</StatusBadge></div>
        {field('name', 'Operation name', <input className="field" value={f.name} onChange={set('name')} maxLength={80} required />)}
        <div className="grid grid-cols-2 gap-3">
          {field('category', 'Category', <select className="field" value={f.category} onChange={set('category')}>{['treasury', 'payroll', 'vendor', 'grant', 'operations'].map(c => <option key={c}>{c}</option>)}</select>)}
          {field('asset', 'Asset', <select className="field" value={f.asset} onChange={set('asset')}>{['USDC', 'SOL', 'USDT', 'PYUSD', 'DOGE'].map(c => <option key={c}>{c}</option>)}</select>)}
        </div>
        {field('recipient', 'Recipient identifier', <input className="field" value={f.recipient} onChange={set('recipient')} maxLength={64} required />)}
        <div className="grid grid-cols-2 gap-3">
          {field('amount', 'Amount', <input className="field" inputMode="decimal" value={f.amount} onChange={set('amount')} required />)}
          {field('limit', 'Policy limit', <input className="field" inputMode="decimal" value={f.limit} onChange={set('limit')} required />)}
        </div>
        {field('mode', 'Confidentiality mode', <select className="field" value={f.mode} onChange={set('mode')}>
          <option value="amount-only">amount-only (recipient public)</option><option value="amount-and-recipient">amount-and-recipient</option><option value="full">full</option></select>)}
        {field('memo', 'Memo', <input className="field" value={f.memo} onChange={set('memo')} maxLength={120} />)}
        <button type="submit" className="btn-primary w-full justify-center" disabled={running}>{running ? 'Processing…' : 'Process operation'} <ArrowRight size={14} /></button>
        {err && <p className="font-mono text-[12px] text-alert">{err}</p>}
        <p className="font-mono text-[10.5px] leading-relaxed text-mute">Use made-up values. Keys are generated in memory and discarded when you leave. Only the public record (no plaintext) is saved in this browser. Try an amount above the limit, or the DOGE asset.</p>
      </form>

      <div className="bg-ink p-5 sm:p-8">
        <div className="label mb-6">Lifecycle</div>
        <ol className="relative space-y-0" aria-live="polite">
          {ORDER.map((s, i) => {
            const ev = stages.find(x => x.stage === s);
            const failedHere = !!violation && s === 'policy';
            const state = ev ? (ev.ok ? 'done' : 'fail') : failedHere ? 'fail' : running && stages.length === i ? 'active' : 'idle';
            return (
              <li key={s} className="grid grid-cols-[1.5rem_1fr] gap-4 pb-6 last:pb-0">
                <div className="relative flex justify-center">
                  <span className={`relative z-10 mt-1 h-2.5 w-2.5 border ${state === 'done' ? 'border-jade bg-jade' : state === 'fail' ? 'border-alert bg-alert' : state === 'active' ? 'animate-pulse border-paper' : 'border-line'}`} />
                  {i < ORDER.length - 1 && <span className={`absolute top-4 h-[calc(100%-0.5rem)] w-px ${ev ? 'bg-jade/40' : 'bg-line'}`} />}
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className={`text-[15px] ${state === 'idle' ? 'text-mute' : 'text-paper'}`}>Stage {i + 1}. {STAGE_LABEL[s]![0]}</span>
                    {ev && <span className="font-mono text-[10px] text-mute">{fmtTime(ev.at).slice(11)}</span>}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-mute">{ev ? ev.detail : STAGE_LABEL[s]![1]}</p>
                  {failedHere && violation && <p className="mt-1 font-mono text-[12px] text-alert">Rejected: {violation.checks.filter(c => !c.passed).map(c => c.rule).join(', ')}. No proof is produced for a policy violation.</p>}
                </div>
              </li>
            );
          })}
        </ol>

        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="mt-8 border-t border-line pt-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="label">Public record</div>
                <StatusBadge status={done.valid ? 'verified' : 'failed'} />
              </div>
              <Kv k="Operation ID" v={done.record.operationId} />
              <Kv k="Proof ID" v={done.record.proofId} />
              <Kv k="Timestamp" v={fmtTime(done.record.createdAt)} />
              <Kv k="Public metadata" v={`${done.record.category} · ${done.record.asset} · ${done.record.mode} · limit ${fmtAmount(done.record.policy.maxAmount, done.record.asset)}`} />
              <Kv k="Recipient" v={done.record.recipient ?? <span className="flex items-center gap-1.5 text-mute"><Lock size={11} /> confidential</span>} />
              <Kv k="Amount" v={<span className="flex items-center gap-1.5 text-mute"><Lock size={11} /> confidential · commitment {short(done.record.amountCommitment, 10, 6)}</span>} />
              <Kv k="Proof size" v={kb(done.record.proof)} />
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="btn-ghost !py-2" onClick={decrypt}><Eye size={13} /> Open as owner</button>
                <button className="btn-ghost !py-2" onClick={disclose}><KeyRound size={13} /> Disclose to an auditor</button>
                <Link className="btn-ghost !py-2" href={`/explorer/${done.record.operationId}`}>View in explorer <ArrowRight size={13} /></Link>
              </div>
              {plain && <pre className="mt-4 overflow-x-auto border border-line bg-ink-2 p-3 font-mono text-[11.5px] text-paper/85">{JSON.stringify(JSON.parse(plain), null, 2)}</pre>}
              {auditor && <p className={`mt-3 font-mono text-[12px] ${auditor.ok ? 'text-jade' : 'text-alert'}`}>Auditor (new X25519 key, access granted without re-encryption): {auditor.text}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
