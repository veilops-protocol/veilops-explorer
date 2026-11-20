'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import type { Status } from '@/lib/site';
import { useSound } from './sound';

export const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({ children, delay = 0, y = 24, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }} transition={{ duration: 1.1, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}

export function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`label ${className}`}>{children}</div>;
}

export function SectionHead({ index, label, title, children }: { index: string; label: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-3"><Reveal><Label><span className="text-paper">{index}</span>&nbsp;&nbsp;/&nbsp;&nbsp;{label}</Label></Reveal></div>
      <div className="lg:col-span-9">
        <Reveal><h2 className="h-section">{title}</h2></Reveal>
        {children && <Reveal delay={0.1}><div className="lede mt-8">{children}</div></Reveal>}
      </div>
    </div>
  );
}

export function LinkButton({ href, children, variant = 'primary', external }: { href: string; children: React.ReactNode; variant?: 'primary' | 'ghost'; external?: boolean }) {
  const { play } = useSound();
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-ghost';
  const Icon = external ? ArrowUpRight : ArrowRight;
  if (external) return <a href={href} target="_blank" rel="noreferrer" className={cls} onClick={() => play('click')}>{children}<Icon size={14} /></a>;
  return <Link href={href} className={cls} onClick={() => play('click')}>{children}<Icon size={14} /></Link>;
}

const STATUS_STYLE: Record<Status | 'verified' | 'failed' | 'pending' | 'sample' | 'simulated', string> = {
  implemented: 'border-jade/40 text-jade',
  verified: 'border-jade/40 text-jade',
  experimental: 'border-amber/40 text-amber',
  pending: 'border-amber/40 text-amber',
  simulated: 'border-mute/50 text-mute',
  sample: 'border-mute/50 text-mute',
  planned: 'border-line text-mute',
  failed: 'border-alert/50 text-alert',
};
export function StatusBadge({ status, children }: { status: keyof typeof STATUS_STYLE; children?: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${STATUS_STYLE[status]}`}>
    <span className={`h-1 w-1 rounded-full ${status === 'verified' || status === 'implemented' ? 'bg-jade' : status === 'failed' ? 'bg-alert' : status === 'experimental' || status === 'pending' ? 'bg-amber' : 'bg-mute'}`} />
    {children ?? status}
  </span>;
}

export function PageHero({ label, title, children }: { label: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="page pb-16 pt-40 sm:pt-48">
      <Reveal><Label>{label}</Label></Reveal>
      <Reveal delay={0.05}><h1 className="h-display mt-8 max-w-[14ch] text-[3.2rem] sm:text-[5.5rem] lg:text-[7.5rem]">{title}</h1></Reveal>
      {children && <Reveal delay={0.12}><div className="lede mt-10">{children}</div></Reveal>}
    </header>
  );
}

export function Kv({ k, v, mono = true }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(8rem,11rem)_1fr] gap-4 border-b border-line/70 py-2.5 text-[13px]">
      <div className="label pt-0.5">{k}</div>
      <div className={`${mono ? 'font-mono' : ''} min-w-0 break-all text-paper/90`}>{v}</div>
    </div>
  );
}
