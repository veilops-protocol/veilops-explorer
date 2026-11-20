'use client';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ProofField } from './visuals/ProofField';
import { EASE, LinkButton } from './ui';

export function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, reduce ? 0 : 140]);
  const o = useTransform(scrollY, [0, 600], [1, 0.25]);
  const line = (text: string, i: number, cls = '') => (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span className={`block ${cls}`} initial={reduce ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.3, ease: EASE, delay: 0.25 + i * 0.12 }}>{text}</motion.span>
    </span>
  );
  return (
    <section className="relative min-h-[100svh] overflow-hidden" aria-labelledby="hero-title">
      <motion.div className="absolute inset-0" style={{ y, opacity: o }}>
        <ProofField className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_55%,rgba(8,9,9,0.92)_0%,rgba(8,9,9,0.55)_45%,transparent_75%)]" />
      </motion.div>
      <div className="page relative flex min-h-[100svh] flex-col justify-end pb-16 pt-32 sm:pb-24">
        <motion.div className="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}>VEILOPS / Privacy infrastructure</motion.div>
        <h1 id="hero-title" className="h-display mt-8 text-[3.1rem] sm:text-[5.6rem] lg:text-[8.2rem]">
          <span className="sm:hidden">{line('Privacy is not', 0)}{line('the absence', 1)}{line('of proof.', 2)}</span>
          <span className="hidden sm:block">{line('Privacy is not the', 0)}{line('absence of proof.', 1)}</span>
          {line('It’s proof without exposure.', 2, 'text-mute text-[0.62em] mt-3 tracking-[-0.035em]')}
        </h1>
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <motion.p className="lede lg:col-span-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.1, ease: EASE }}>
            Financial operations should not require exposing everything. VEILOPS explores a new infrastructure model where sensitive information remains
            confidential while the validity of an operation can still be independently verified.
          </motion.p>
          <motion.div className="flex flex-wrap items-end gap-3 lg:col-span-6 lg:justify-end" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 1.1, ease: EASE }}>
            <LinkButton href="/protocol">Explore the Protocol</LinkButton>
            <LinkButton href="/verify" variant="ghost">Verify a Demonstration</LinkButton>
          </motion.div>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-px border-t border-line pt-5 font-mono text-[11px] text-mute sm:grid-cols-4">
          {[['proof system', 'veilops-range-v1'], ['curve', 'ristretto255'], ['payload cipher', 'AES-256-GCM'], ['status', 'phase 01 · experimental']].map(([k, v]) => (
            <div key={k} className="py-2"><div className="uppercase tracking-[0.16em] text-mute/70">{k}</div><div className="mt-1 text-paper/85">{v}</div></div>
          ))}
        </div>
      </div>
    </section>
  );
}
