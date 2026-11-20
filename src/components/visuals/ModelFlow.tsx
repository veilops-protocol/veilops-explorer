'use client';
/**
 * Section 3 — "Hide what matters. Prove what counts."
 * An operation enters, its sensitive values are encrypted, a proof is generated, a verifier checks it.
 * The ciphertext and commitment shown are computed live in the browser (AES-256-GCM, Pedersen/ristretto255).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play } from 'lucide-react';
import { useSound } from '../sound';
import { EASE } from '../ui';

const STAGES = ['Operation', 'Encrypt', 'Prove', 'Verify', 'Outcome'];
const SAMPLE = { amount: '48,250.00 USDC', recipient: 'contributor-0x91', limit: '60,000.00 USDC', memo: 'October contributor payout' };

export function ModelFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-25% 0px' });
  const [stage, setStage] = useState(-1);
  const [cipher, setCipher] = useState<{ ct: string; commit: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { play } = useSound();

  const compute = useCallback(async () => {
    const [{ seal, generateViewingKeyPair }, { commit, randomScalar, pointHex }] = await Promise.all([import('@veilops/encryption'), import('@veilops/proof-engine')]);
    const kp = generateViewingKeyPair();
    const env = await seal(JSON.stringify(SAMPLE), [kp.publicKey], 'veilops/demo');
    setCipher({ ct: env.ciphertext, commit: pointHex(commit(4825000n, randomScalar())) });
  }, []);

  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setStage(0); setCipher(null); void compute();
    const seq: [number, number, Parameters<typeof play>[0]][] = [[1, 1500, 'seal'], [2, 3100, 'pulse'], [3, 4700, 'scan'], [4, 6100, 'confirm']];
    timers.current = seq.map(([s, t, cue]) => setTimeout(() => { setStage(s); play(cue); }, t));
  }, [compute, play]);

  useEffect(() => { if (inView) run(); return () => timers.current.forEach(clearTimeout); }, [inView, run]);

  const enc = stage >= 1;
  return (
    <div ref={ref} className="border border-line bg-ink-2/40">
      {/* stage rail */}
      <div className="grid grid-cols-5 border-b border-line">
        {STAGES.map((s, i) => (
          <button key={s} onClick={() => { timers.current.forEach(clearTimeout); setStage(i); if (!cipher) void compute(); play('click'); }}
            className={`relative px-2 py-4 text-left font-mono text-[10px] uppercase tracking-[0.16em] transition-colors sm:px-5 sm:text-[11px] ${i <= stage ? 'text-paper' : 'text-mute/60'} ${i ? 'border-l border-line' : ''}`}>
            <span className="text-mute">0{i + 1}</span> <span className="hidden sm:inline">{s}</span>
            <motion.span className="absolute bottom-0 left-0 h-px bg-jade" initial={false} animate={{ width: i <= stage ? '100%' : '0%' }} transition={{ duration: 0.9, ease: EASE }} />
          </button>
        ))}
      </div>

      <div className="grid gap-px bg-line lg:grid-cols-[1.15fr_1fr]">
        {/* the operation */}
        <div className="bg-ink p-6 sm:p-10">
          <div className="label mb-6">Operation · op_7c1e…a04f</div>
          {([['Amount', SAMPLE.amount, 'secret'], ['Recipient', SAMPLE.recipient, 'secret'], ['Memo', SAMPLE.memo, 'secret'], ['Policy limit', SAMPLE.limit, 'public'], ['Category', 'payroll', 'public']] as const).map(([k, v, vis], i) => (
            <div key={k} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 border-b border-line/60 py-3">
              <span className="label">{k}</span>
              <div className="relative h-6 overflow-hidden font-mono text-[13px]">
                <AnimatePresence mode="wait" initial={false}>
                  {vis === 'secret' && enc ? (
                    <motion.span key="c" className="absolute inset-0 truncate text-mute" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}>
                      {cipher ? cipher.ct.slice(i * 18, i * 18 + 34) : '········'}
                    </motion.span>
                  ) : (
                    <motion.span key="p" className={`absolute inset-0 truncate ${vis === 'public' ? 'text-paper' : 'text-paper'}`} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>{v}</motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button onClick={() => { run(); play('click'); }} className="btn-ghost">{stage >= 4 ? <RotateCcw size={13} /> : <Play size={13} />} {stage >= 4 ? 'Replay' : 'Run'}</button>
            <span className="font-mono text-[11px] text-mute">Live: real AES-256-GCM ciphertext and Pedersen commitment, computed in your browser.</span>
          </div>
        </div>

        {/* proof + verifier */}
        <div className="relative min-h-[360px] bg-ink p-6 sm:p-10">
          <div className="label mb-6">Commitment &amp; proof</div>
          <div className="font-mono text-[12px] text-mute">
            C = v·G + r·H
            <div className="mt-2 min-h-[2.6em] break-all text-paper/80">{stage >= 1 && cipher ? cipher.commit : '—'}</div>
          </div>
          <div className="mt-8 flex h-16 items-end gap-[3px]" aria-hidden>
            {Array.from({ length: 48 }).map((_, i) => (
              <motion.span key={i} className={`w-full ${stage >= 3 ? 'bg-jade/80' : 'bg-paper/70'}`} initial={false}
                animate={{ height: stage >= 2 ? `${18 + ((i * 37) % 60)}%` : '2%', opacity: stage >= 2 ? 1 : 0.2 }}
                transition={{ duration: 0.6, delay: stage === 2 ? i * 0.015 : 0, ease: EASE }} />
            ))}
          </div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{stage >= 2 ? '2 × 24 bit-commitments with OR-proofs' : 'awaiting proof'}</div>

          <div className="mt-10 grid grid-cols-2 gap-px bg-line">
            {[['0 ≤ v', stage >= 3], ['v ≤ limit', stage >= 3], ['proof id bound', stage >= 3], ['operator signature', stage >= 3]].map(([k, ok]) => (
              <div key={k as string} className="flex items-center justify-between bg-ink px-3 py-2.5 font-mono text-[11px]">
                <span className="text-mute">{k as string}</span>
                <span className={ok ? 'text-jade' : 'text-mute/50'}>{ok ? '✓' : '·'}</span>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {stage >= 4 && (
              <motion.div className="mt-8 flex items-baseline justify-between border-t border-line pt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: EASE }}>
                <span className="text-4xl font-medium tracking-[-0.03em] text-paper sm:text-5xl">VALID <span className="text-jade">/</span> VERIFIED</span>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-mute sm:block">values concealed</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
