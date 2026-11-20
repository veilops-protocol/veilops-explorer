'use client';
/**
 * Opening sequence (≈7s, skippable, shown once per browser, skipped under reduced motion):
 * 1 wordmark · 2 encrypted fragments · 3 a processing line crosses the screen ·
 * 4 the line resolves into a proof lattice (bit commitments) · 5 the headline · 6 the site.
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wordmark } from './Mark';
import { useSound } from './sound';
import { EASE } from './ui';

const KEY = 'veilops.intro.v1';
const HEX = '0123456789abcdef';
const rnd = (n: number) => Array.from({ length: n }, () => HEX[Math.floor(Math.random() * 16)]).join('');

export function Intro() {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState(0);
  const { play, on, enable } = useSound();

  const finish = useCallback(() => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
    setShow(false);
    document.documentElement.style.overflow = '';
  }, []);

  useEffect(() => {
    let seen = false;
    try { seen = !!localStorage.getItem(KEY); } catch { /* ignore */ }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduce) { setShow(false); return; }
    document.documentElement.style.overflow = 'hidden';
    const T = [300, 1200, 2500, 3500, 4600, 5600, 7300];
    const timers = T.map((t, i) => setTimeout(() => (i === T.length - 1 ? finish() : setPhase(i + 1)), t));
    const key = (e: KeyboardEvent) => { if (['Escape', 'Enter', ' '].includes(e.key)) finish(); };
    window.addEventListener('keydown', key);
    return () => { timers.forEach(clearTimeout); window.removeEventListener('keydown', key); document.documentElement.style.overflow = ''; };
  }, [finish]);

  useEffect(() => {
    if (phase === 1) play('intro');
    if (phase === 2) play('seal');
    if (phase === 3) play('scan');
    if (phase === 4) play('pulse');
    if (phase === 6) play('confirm');
  }, [phase, play]);

  const frags = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100, t: rnd(4 + Math.floor(Math.random() * 10)), d: Math.random() * 1.2, o: 0.15 + Math.random() * 0.45, k: i,
  })), []);
  const bits = useMemo(() => Array.from({ length: 32 }, () => Math.random() > 0.5), []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="intro" className="fixed inset-0 z-[70] overflow-hidden bg-ink" exit={{ opacity: 0 }} transition={{ duration: 1, ease: EASE }}
          role="dialog" aria-label="VEILOPS introduction" aria-live="polite">
          <noscript><style>{'[aria-label="VEILOPS introduction"]{display:none}'}</style></noscript>

          {/* 2 — encrypted fragments */}
          <div className="absolute inset-0" aria-hidden>
            {phase >= 2 && frags.map(f => (
              <motion.span key={f.k} className="absolute font-mono text-[10px] text-paper" style={{ left: `${f.x}%`, top: `${f.y}%` }}
                initial={{ opacity: 0 }} animate={{ opacity: phase >= 5 ? f.o * 0.25 : [0, f.o, f.o * 0.4, f.o] }}
                transition={{ duration: 1.6, delay: f.d * (phase === 2 ? 1 : 0), ease: 'easeOut' }}>{f.t}</motion.span>
            ))}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            {/* 1 — wordmark */}
            <motion.div className="text-paper" initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: phase >= 1 ? (phase >= 5 ? 0 : 1) : 0, y: phase >= 3 ? -90 : 0, scale: phase >= 3 ? 0.9 : 1 }}
              transition={{ duration: 1.2, ease: EASE }}>
              <Wordmark />
            </motion.div>

            {/* 3 — processing line, 4 — resolves into a lattice of bit commitments */}
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-24 -translate-y-1/2" aria-hidden>
              <motion.div className="absolute left-0 top-1/2 h-px w-full origin-left bg-paper"
                initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: phase >= 3 ? 1 : 0, opacity: phase >= 4 ? 0 : 1 }}
                transition={{ scaleX: { duration: 1.1, ease: [0.7, 0, 0.2, 1] }, opacity: { duration: 0.5 } }} />
              {phase >= 3 && <motion.div className="absolute top-1/2 h-[3px] w-24 -translate-y-1/2 bg-gradient-to-r from-transparent to-jade"
                initial={{ left: '-10%' }} animate={{ left: '105%' }} transition={{ duration: 1.1, ease: [0.7, 0, 0.2, 1] }} />}
              {phase >= 4 && (
                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-end gap-[5px] sm:gap-2">
                  {bits.map((b, i) => (
                    <motion.span key={i} className={`block w-[3px] sm:w-[4px] ${phase >= 5 && i % 7 === 3 ? 'bg-jade' : 'bg-paper'}`}
                      initial={{ height: 1, opacity: 0.2 }}
                      animate={{ height: phase >= 5 ? 1 : b ? 34 : 12, opacity: phase >= 5 ? 0.25 : 1 }}
                      transition={{ duration: 0.7, delay: phase >= 5 ? 0 : i * 0.018, ease: EASE }} />
                  ))}
                </div>
              )}
              {phase === 4 && <motion.div className="absolute left-1/2 top-full -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-jade"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>proof · 0 ≤ v ≤ limit · valid</motion.div>}
            </div>

            {/* 5 — headline */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
              <motion.h2 className="h-display mx-auto max-w-5xl [text-wrap:balance] text-[2.3rem] sm:text-6xl lg:text-7xl" initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={phase >= 5 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}} transition={{ duration: 1.3, ease: EASE }}>
                Privacy is not the absence of proof.
              </motion.h2>
              <motion.p className="h-display mx-auto mt-3 max-w-5xl text-[2.3rem] text-mute sm:text-6xl lg:text-7xl" initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={phase >= 6 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}} transition={{ duration: 1.3, ease: EASE }}>
                It&rsquo;s proof without exposure.
              </motion.p>
            </div>
          </div>

          <button onClick={finish} className="absolute bottom-6 right-6 border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-mute hover:border-paper hover:text-paper"
            autoFocus>Skip intro ↵</button>
          <div className="absolute bottom-6 left-6 flex items-center gap-4">
            <button onClick={() => { enable(); setTimeout(() => play('intro'), 120); }} disabled={on}
              className={`border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${on ? 'border-jade/40 text-jade' : 'border-line text-mute hover:border-paper hover:text-paper'}`}>
              {on ? '● sound on' : '○ enter with sound'}
            </button>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-mute/70 sm:inline">headphones recommended</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
