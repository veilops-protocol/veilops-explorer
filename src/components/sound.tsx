'use client';
/**
 * VEILOPS sound system: every sound is synthesized live with the Web Audio API. No samples, no music files.
 *
 * Character: a dark, quiet vault. A minor-key drone breathes underneath. Far-away "cipher whispers"
 * (sparse, panned, reverberant blips) suggest data being sealed somewhere you cannot see. Every so often
 * a soft verification scan sweeps across the stereo field. Interface sounds are short, close and dry
 * by comparison: you hear your own actions clearly, the system stays at a distance.
 *
 * Default is OFF. The AudioContext is only created inside the visitor's click (works on Safari/iOS).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export type Cue =
  | 'click' | 'hover' | 'type' | 'tick' | 'data' | 'seal' | 'reveal' | 'scan'
  | 'pulse' | 'confirm' | 'fail' | 'transition' | 'intro';

interface Prefs { on: boolean; master: number; sfx: number; ambient: number }
const DEFAULTS: Prefs = { on: false, master: 0.8, sfx: 0.7, ambient: 0.55 };
const KEY = 'veilops.sound.v2';

interface Ctx extends Prefs {
  set: (p: Partial<Prefs>) => void;
  toggle: () => void;
  enable: () => void;
  play: (cue: Cue) => void;
}
const SoundCtx = createContext<Ctx | null>(null);

// A natural minor / minor pentatonic palette, so nothing ever clashes with the drone (root A).
const WHISPER = [880, 1046.5, 1174.7, 1318.5, 1568, 1760, 2093];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]!;

class Engine {
  ctx: AudioContext;
  master: GainNode; sfx: GainNode; amb: GainNode; verb: GainNode;
  ambNodes: AudioScheduledSourceNode[] = [];
  ambOut: GainNode | null = null;
  timers: ReturnType<typeof setTimeout>[] = [];
  last: Record<string, number> = {};

  constructor() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    const c = this.ctx;
    this.master = c.createGain();
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3.5; comp.attack.value = 0.01; comp.release.value = 0.3;
    this.master.connect(comp).connect(c.destination);

    // Reverb: generated stereo impulse response (≈4 s dark tail) — the "vault"
    const conv = c.createConvolver();
    conv.buffer = this.impulse(4.2, 2.6);
    const verbTone = c.createBiquadFilter(); verbTone.type = 'lowpass'; verbTone.frequency.value = 5200;
    this.verb = c.createGain(); this.verb.gain.value = 0.9;
    this.verb.connect(conv).connect(verbTone).connect(this.master);

    this.sfx = c.createGain(); this.sfx.connect(this.master);
    this.amb = c.createGain(); this.amb.connect(this.master);
  }

  impulse(seconds: number, decay: number) {
    const c = this.ctx, len = Math.floor(c.sampleRate * seconds), buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) { lp = lp * 0.6 + (Math.random() * 2 - 1) * 0.4; d[i] = lp * Math.pow(1 - i / len, decay); }
    }
    return buf;
  }

  levels(p: Prefs) {
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(p.on ? p.master : 0, t, 0.1);
    this.sfx.gain.setTargetAtTime(p.sfx, t, 0.05);
    this.amb.gain.setTargetAtTime(p.ambient, t, 0.5);
  }

  noise(seconds: number) {
    const c = this.ctx, buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * seconds)), c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf; return s;
  }

  /** Route a node to a bus with optional pan and reverb send. */
  out(node: AudioNode, bus: GainNode, pan = 0, send = 0) {
    const c = this.ctx;
    const p = c.createStereoPanner(); p.pan.value = pan;
    node.connect(p); p.connect(bus);
    if (send > 0) { const s = c.createGain(); s.gain.value = send; p.connect(s).connect(this.verb); }
  }

  tone(o: { f: number; t: number; dur: number; peak: number; type?: OscillatorType; to?: number; pan?: number; send?: number; bus?: GainNode; attack?: number }) {
    const c = this.ctx, osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type ?? 'sine'; osc.frequency.setValueAtTime(o.f, o.t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, o.t + o.dur);
    const a = o.attack ?? 0.005;
    g.gain.setValueAtTime(0.0001, o.t);
    g.gain.exponentialRampToValueAtTime(o.peak, o.t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, o.t + a + o.dur);
    osc.connect(g); this.out(g, o.bus ?? this.sfx, o.pan ?? 0, o.send ?? 0);
    osc.start(o.t); osc.stop(o.t + a + o.dur + 0.05);
  }

  hiss(o: { t: number; dur: number; peak: number; f0: number; f1: number; q?: number; pan0?: number; pan1?: number; send?: number; bus?: GainNode; type?: BiquadFilterType }) {
    const c = this.ctx, n = this.noise(o.dur + 0.1), f = c.createBiquadFilter(), g = c.createGain(), p = c.createStereoPanner();
    f.type = o.type ?? 'bandpass'; f.Q.value = o.q ?? 1.2;
    f.frequency.setValueAtTime(o.f0, o.t); f.frequency.exponentialRampToValueAtTime(o.f1, o.t + o.dur);
    g.gain.setValueAtTime(0.0001, o.t); g.gain.exponentialRampToValueAtTime(o.peak, o.t + o.dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
    p.pan.setValueAtTime(o.pan0 ?? 0, o.t); p.pan.linearRampToValueAtTime(o.pan1 ?? o.pan0 ?? 0, o.t + o.dur);
    n.connect(f).connect(g).connect(p); p.connect(o.bus ?? this.sfx);
    if (o.send) { const s = c.createGain(); s.gain.value = o.send; p.connect(s).connect(this.verb); }
    n.start(o.t); n.stop(o.t + o.dur + 0.1);
  }

  /* ---------------- ambient: the vault ---------------- */
  startAmbient() {
    if (this.ambOut) return;
    const c = this.ctx, out = c.createGain();
    out.gain.value = 0.0001; out.gain.setTargetAtTime(1, c.currentTime, 3);
    out.connect(this.amb);
    const send = c.createGain(); send.gain.value = 0.35; out.connect(send).connect(this.verb);
    this.ambOut = out;

    // Drone: A minor (A1 · A2 detuned pair · E3 · C4 · A4 whisper), through a slowly moving low-pass
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 0.7; lp.connect(out);
    const lfo = c.createOscillator(); lfo.frequency.value = 0.035;
    const lfoG = c.createGain(); lfoG.gain.value = 420; lfo.connect(lfoG).connect(lp.frequency); lfo.start();
    this.ambNodes.push(lfo);
    const voices: [number, OscillatorType, number, number][] = [
      [55, 'sine', 0.2, 0], [110, 'sine', 0.11, -0.3], [110.35, 'sine', 0.09, 0.3], [164.81, 'triangle', 0.045, -0.15],
      [261.63, 'sine', 0.03, 0.4], [440.2, 'sine', 0.008, -0.5],
    ];
    voices.forEach(([f, type, level, pan], i) => {
      const o = c.createOscillator(); o.type = type; o.frequency.value = f;
      const g = c.createGain(); g.gain.value = level;
      const br = c.createOscillator(); br.frequency.value = 0.04 + i * 0.017; // each voice breathes at its own rate
      const brG = c.createGain(); brG.gain.value = level * 0.7; br.connect(brG).connect(g.gain);
      const p = c.createStereoPanner(); p.pan.value = pan;
      o.connect(g).connect(p).connect(lp); o.start(); br.start();
      this.ambNodes.push(o, br);
    });

    // Air: soft filtered noise, like ventilation in a sealed room
    const air = this.noise(6); air.loop = true;
    const af = c.createBiquadFilter(); af.type = 'bandpass'; af.frequency.value = 520; af.Q.value = 0.5;
    const afl = c.createOscillator(); afl.frequency.value = 0.021; const aflG = c.createGain(); aflG.gain.value = 260; afl.connect(aflG).connect(af.frequency); afl.start();
    const ag = c.createGain(); ag.gain.value = 0.035;
    air.connect(af).connect(ag).connect(out); air.start();
    this.ambNodes.push(air, afl);

    // Recurring events
    const loop = (fn: () => void, min: number, max: number) => {
      const tick = () => { if (!this.ambOut) return; fn(); this.timers.push(setTimeout(tick, rand(min, max))); };
      this.timers.push(setTimeout(tick, rand(min, max) * 0.5));
    };
    loop(() => this.whisper(), 2600, 6500);
    loop(() => this.scan(true), 15000, 26000);
    loop(() => this.heartbeat(), 22000, 40000);
  }

  /** Far-away cipher whispers: a few soft pentatonic blips, panned and drowned in reverb. */
  whisper() {
    if (!this.ambOut) return;
    const t = this.ctx.currentTime + 0.05, n = 3 + Math.floor(Math.random() * 6), pan = rand(-0.9, 0.9);
    for (let i = 0; i < n; i++) {
      this.tone({ f: pick(WHISPER) * (Math.random() < 0.2 ? 2 : 1), t: t + i * rand(0.05, 0.11), dur: rand(0.04, 0.09), peak: rand(0.008, 0.02), pan: pan + rand(-0.15, 0.15), send: 1.4, bus: this.amb });
    }
  }

  /** A verification scan crossing the stereo field. */
  scan(ambient = false) {
    const t = this.ctx.currentTime + 0.02, dir = Math.random() < 0.5 ? 1 : -1;
    this.hiss({ t, dur: ambient ? 2.6 : 1.4, peak: ambient ? 0.025 : 0.06, f0: 900, f1: 3800, q: 4, pan0: -0.9 * dir, pan1: 0.9 * dir, send: 0.6, bus: ambient ? this.amb : this.sfx });
    this.tone({ f: 1760, t: t + (ambient ? 1.3 : 0.7), dur: 0.12, peak: ambient ? 0.008 : 0.025, pan: 0.6 * dir, send: 1, bus: ambient ? this.amb : this.sfx });
  }

  /** The proof pulse, felt more than heard. */
  heartbeat() {
    const t = this.ctx.currentTime + 0.05;
    this.tone({ f: 70, to: 46, t, dur: 0.35, peak: 0.12, bus: this.amb, send: 0.2 });
    this.tone({ f: 66, to: 44, t: t + 0.28, dur: 0.4, peak: 0.08, bus: this.amb, send: 0.2 });
  }

  stopAmbient() {
    const out = this.ambOut;
    if (!out) return;
    this.ambOut = null;
    this.timers.forEach(clearTimeout); this.timers = [];
    out.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.7);
    const nodes = this.ambNodes; this.ambNodes = [];
    setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch { /* stopped */ } }); out.disconnect(); }, 3000);
  }

  /* ---------------- interface cues ---------------- */
  play(cue: Cue) {
    const c = this.ctx, t = c.currentTime + 0.005;
    const gap: Partial<Record<Cue, number>> = { hover: 0.06, type: 0.035, tick: 0.05, data: 0.08, transition: 1.2, scan: 0.8 };
    if ((this.last[cue] ?? -1) > t - (gap[cue] ?? 0.1)) return;
    this.last[cue] = t;
    switch (cue) {
      case 'hover': // barely-there glint
        this.tone({ f: rand(2600, 3000), t, dur: 0.035, peak: 0.012, send: 0.3 }); break;
      case 'type': // a muffled key on a sealed terminal
        this.hiss({ t, dur: 0.03, peak: 0.07, f0: rand(3500, 5500), f1: 2500, q: 3 });
        this.tone({ f: rand(300, 380), t, dur: 0.025, peak: 0.02 }); break;
      case 'click': // mechanical latch: high transient + small body
        this.hiss({ t, dur: 0.035, peak: 0.25, f0: 4200, f1: 2600, q: 2.5 });
        this.tone({ f: 420, to: 160, t, dur: 0.05, peak: 0.12, send: 0.15 }); break;
      case 'tick':
        this.tone({ f: rand(2200, 2800), t, dur: 0.03, peak: 0.05, type: 'triangle', send: 0.2 }); break;
      case 'data': // a flurry of close digits
        for (let i = 0; i < 6; i++) this.tone({ f: pick(WHISPER) * 2, t: t + i * 0.026, dur: 0.02, peak: 0.03, type: 'square', pan: rand(-0.4, 0.4), send: 0.4 });
        break;
      case 'seal': // encryption: breath drawn inward, then the lock
        this.hiss({ t, dur: 0.42, peak: 0.09, f0: 7000, f1: 700, q: 0.9, send: 0.5 });
        this.tone({ f: 220, t: t + 0.38, dur: 0.12, peak: 0.12, type: 'triangle', send: 0.3 });
        this.tone({ f: 164.81, t: t + 0.43, dur: 0.22, peak: 0.1, send: 0.4 }); break;
      case 'reveal': // selective disclosure: a narrow shimmer opening upward
        [440, 523.25, 659.25, 880].forEach((f, i) => this.tone({ f, t: t + i * 0.07, dur: 0.5, peak: 0.05, pan: -0.3 + i * 0.2, send: 1.1 }));
        this.hiss({ t, dur: 0.6, peak: 0.03, f0: 2000, f1: 8000, q: 2, send: 0.8 }); break;
      case 'scan': this.scan(false); break;
      case 'pulse': // proof generated
        this.tone({ f: 92, to: 55, t, dur: 0.55, peak: 0.3, send: 0.3 });
        this.tone({ f: 184, to: 110, t, dur: 0.35, peak: 0.12, type: 'triangle', send: 0.4 });
        this.tone({ f: 659.25, t: t + 0.05, dur: 0.4, peak: 0.025, send: 1.2 }); break;
      case 'confirm': // verified: clean fifth, a long tail
        this.tone({ f: 659.25, t, dur: 0.45, peak: 0.1, send: 0.7 });
        this.tone({ f: 987.77, t: t + 0.09, dur: 0.7, peak: 0.085, send: 0.9 });
        this.tone({ f: 1318.5, t: t + 0.09, dur: 0.5, peak: 0.02, send: 1.2 }); break;
      case 'fail': // a tritone that refuses to resolve
        this.tone({ f: 311.13, t, dur: 0.3, peak: 0.1, type: 'triangle', send: 0.4 });
        this.tone({ f: 220, t: t + 0.12, dur: 0.45, peak: 0.1, type: 'triangle', to: 207, send: 0.5 }); break;
      case 'transition': // moving between rooms
        this.hiss({ t, dur: 1.5, peak: 0.035, f0: 280, f1: 1800, q: 1.2, pan0: -0.4, pan1: 0.4, send: 0.7 });
        this.tone({ f: 110, t: t + 0.2, dur: 1.4, peak: 0.04, attack: 0.5, send: 0.6 }); break;
      case 'intro': // the door of the vault
        this.tone({ f: 41.2, t, dur: 4.2, peak: 0.3, attack: 1.2 });
        this.tone({ f: 110, t: t + 0.3, dur: 3.6, peak: 0.08, type: 'triangle', attack: 1.4, send: 0.6 });
        this.tone({ f: 164.81, t: t + 0.8, dur: 3.2, peak: 0.04, attack: 1.4, send: 0.9 });
        this.tone({ f: 261.63, t: t + 1.2, dur: 3, peak: 0.025, attack: 1.4, send: 1.1 });
        this.hiss({ t, dur: 3.8, peak: 0.03, f0: 200, f1: 2400, q: 0.8, send: 0.8 }); break;
    }
  }
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const engine = useRef<Engine | null>(null);
  const current = useRef(prefs);
  current.current = prefs;
  const path = usePathname();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      // Volumes persist. Sound itself always starts OFF and needs a click: no autoplay, ever.
      if (saved) setPrefs({ ...DEFAULTS, ...saved, on: false });
    } catch { /* storage unavailable */ }
  }, []);

  const apply = useCallback((p: Prefs) => {
    try { localStorage.setItem(KEY, JSON.stringify({ master: p.master, sfx: p.sfx, ambient: p.ambient })); } catch { /* ignore */ }
    if (p.on && !engine.current) { try { engine.current = new Engine(); } catch { return; } }
    const e = engine.current;
    if (!e) return;
    if (e.ctx.state === 'suspended') void e.ctx.resume();
    e.levels(p);
    if (p.on && p.ambient > 0) e.startAmbient(); else e.stopAmbient();
  }, []);

  // Side effects run directly inside the user's click (Safari/iOS requirement), never inside a state updater.
  const set = useCallback((patch: Partial<Prefs>) => { const n = { ...current.current, ...patch }; current.current = n; apply(n); setPrefs(n); }, [apply]);
  const toggle = useCallback(() => {
    const n = { ...current.current, on: !current.current.on }; current.current = n;
    apply(n); setPrefs(n);
    if (n.on) setTimeout(() => engine.current?.play('reveal'), 80);
  }, [apply]);
  const enable = useCallback(() => { if (!current.current.on) toggle(); }, [toggle]);
  const play = useCallback((cue: Cue) => { if (current.current.on && engine.current) engine.current.play(cue); }, []);

  // Ambient interface layer: hover glints, keystrokes in fields, a soft transition when a new section enters.
  useEffect(() => {
    if (!prefs.on) return;
    let lastEl: Element | null = null;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest?.('a, button, select, [role="button"], input[type="range"]') ?? null;
      if (el && el !== lastEl) play('hover');
      lastEl = el;
    };
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || e.metaKey || e.ctrlKey) return;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') play('type');
    };
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(entries => {
      for (const en of entries) if (en.isIntersecting && !seen.has(en.target)) { seen.add(en.target); play('transition'); }
    }, { rootMargin: '-35% 0px -35% 0px' });
    const t = setTimeout(() => document.querySelectorAll('main section').forEach((s, i) => { if (i > 0) io.observe(s); }), 400);
    document.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('keydown', key);
    return () => { clearTimeout(t); io.disconnect(); document.removeEventListener('pointerover', over); document.removeEventListener('keydown', key); };
  }, [prefs.on, path, play]);

  const value = useMemo(() => ({ ...prefs, set, toggle, enable, play }), [prefs, set, toggle, enable, play]);
  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}

export function useSound(): Ctx {
  const c = useContext(SoundCtx);
  if (!c) return { ...DEFAULTS, set: () => {}, toggle: () => {}, enable: () => {}, play: () => {} };
  return c;
}
