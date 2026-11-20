'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV, githubUrl, SITE } from '@/lib/site';
import { Wordmark } from './Mark';
import { useSound } from './sound';
import { EASE } from './ui';

function Bars({ on }: { on: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0.5, 1, 0.7, 0.35].map((h, i) => (
        <motion.span key={i} className="w-[2px] bg-current" style={{ height: '100%', originY: 1 }}
          animate={on ? { scaleY: [h, 1, h * 0.6, h] } : { scaleY: 0.25 }}
          transition={on ? { duration: 1.2 + i * 0.17, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }} />
      ))}
    </span>
  );
}

function Slider({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <label className={`block ${disabled ? 'opacity-40' : ''}`}>
      <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-mute"><span>{label}</span><span>{Math.round(value * 100)}</span></div>
      <input type="range" min={0} max={1} step={0.05} value={value} disabled={disabled} onChange={e => onChange(Number(e.target.value))}
        className="h-px w-full cursor-pointer appearance-none bg-line accent-[#72D6A1]" aria-label={`${label} volume`} />
    </label>
  );
}

export function SoundControl() {
  const s = useSound();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center">
        <button onClick={s.toggle} className="flex items-center gap-2 px-2 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-paper/80 hover:text-paper" aria-pressed={s.on} aria-label={s.on ? 'Turn sound off' : 'Turn sound on'}>
          <Bars on={s.on} /> <span>Sound {s.on ? 'on' : 'off'}</span>
        </button>
        <button onClick={() => setOpen(o => !o)} className="px-1.5 py-2 font-mono text-[11px] text-mute hover:text-paper" aria-expanded={open} aria-label="Sound settings">⋯</button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }}
            className="absolute right-0 top-full z-50 mt-2 w-64 space-y-4 border border-line bg-ink-2/95 p-4 backdrop-blur" role="dialog" aria-label="Sound settings">
            <div className="flex items-center justify-between">
              <span className="label">Synthesized audio</span>
              <button onClick={s.toggle} className={`font-mono text-[10px] uppercase tracking-[0.16em] ${s.on ? 'text-jade' : 'text-mute'}`}>{s.on ? '● on' : '○ off'}</button>
            </div>
            <Slider label="Master" value={s.master} onChange={v => s.set({ master: v })} disabled={!s.on} />
            <Slider label="Effects" value={s.sfx} onChange={v => { s.set({ sfx: v }); s.play('tick'); }} disabled={!s.on} />
            <Slider label="Ambient" value={s.ambient} onChange={v => s.set({ ambient: v })} disabled={!s.on} />
            <p className="text-[11px] leading-relaxed text-mute">Generated live with the Web Audio API. Off by default; nothing plays until you turn it on.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Nav() {
  const path = usePathname();
  const { play } = useSound();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setMenu(false), [path]);
  if (path?.startsWith('/app')) return null;

  const link = (href: string, label: string) => {
    const ext = href === '/github' && SITE.githubPublished;
    const active = path === href || (href !== '/' && !href.startsWith('/#') && path?.startsWith(href));
    return ext
      ? <a key={href} href={githubUrl()} target="_blank" rel="noreferrer" onClick={() => play('click')} className="text-paper/70 transition-colors hover:text-paper">{label}</a>
      : <Link key={href} href={href} onClick={() => play('click')} className={`transition-colors hover:text-paper ${active ? 'text-paper' : 'text-paper/60'}`}>{label}</Link>;
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${scrolled || menu ? 'border-b border-line/70 bg-ink/80 backdrop-blur-md' : 'border-b border-transparent'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink">Skip to content</a>
      <nav className="page flex h-16 items-center justify-between" aria-label="Primary">
        <Link href="/" onClick={() => play('click')} aria-label="VEILOPS home" className="text-paper"><Wordmark /></Link>
        <div className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.16em] lg:flex">{NAV.map(n => link(n.href, n.label))}</div>
        <div className="flex items-center gap-2">
          <SoundControl />
          <Link href="/app" onClick={() => play('click')} className="ml-2 hidden border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/80 hover:border-paper hover:text-paper sm:inline-block">Open app</Link>
          <button className="p-2 text-paper lg:hidden" onClick={() => { setMenu(m => !m); play('click'); }} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}>
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {menu && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden lg:hidden">
            <div className="page flex flex-col gap-5 pb-8 pt-4 font-mono text-[13px] uppercase tracking-[0.16em]">
              {NAV.map(n => link(n.href, n.label))}
              {link('/verify', 'Verify')}{link('/app', 'Open app')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
