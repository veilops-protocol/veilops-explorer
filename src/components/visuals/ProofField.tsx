'use client';
/**
 * Hero visual. A field of sealed values (hex glyphs). A verifier line sweeps across; where it passes,
 * each value collapses into a single bit-commitment tick — the information stays hidden, the structure
 * becomes checkable. The pointer acts as a lens: values near it flicker but never resolve to plaintext.
 */
import { useEffect, useRef } from 'react';

const HEX = '0123456789abcdef';

export function ProofField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    let cells: { x: number; y: number; g: string; p: number; v: number }[] = [];
    const mouse = { x: -999, y: -999 };
    const S = 26;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv.getBoundingClientRect(); w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = [];
      for (let y = S; y < h - S / 2; y += S) for (let x = S; x < w - S / 2; x += S)
        cells.push({ x, y, g: HEX[(Math.random() * 16) | 0]!, p: Math.random(), v: Math.random() });
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const period = 9000;
      const sweep = reduce ? w * 0.62 : ((t % period) / period) * (w + 400) - 200;
      for (const c of cells) {
        const dx = c.x - sweep;
        const md = Math.hypot(c.x - mouse.x, c.y - mouse.y);
        const lens = Math.max(0, 1 - md / 140);
        // radial falloff so the field dissolves at the edges
        const ex = Math.min(c.x, w - c.x) / (w * 0.22), ey = Math.min(c.y, h - c.y) / (h * 0.25);
        const edge = Math.min(1, ex, ey);
        if (dx < 0 && dx > -w * 0.55) {
          // verified region: collapse to ticks, height = hidden bit
          const fade = 1 - Math.min(1, -dx / (w * 0.55));
          const bit = c.v > 0.5 ? 9 : 3;
          ctx.fillStyle = `rgba(243,243,239,${(0.12 + 0.35 * fade) * edge})`;
          ctx.fillRect(c.x - 0.75, c.y + 5 - bit, 1.5, bit);
        } else {
          if (!reduce && Math.random() < 0.004 + lens * 0.12) c.g = HEX[(Math.random() * 16) | 0]!;
          const a = (0.08 + c.p * 0.16 + lens * 0.55) * edge;
          ctx.fillStyle = `rgba(243,243,239,${a})`;
          ctx.fillText(c.g, c.x, c.y);
        }
      }
      // the verifier line
      if (sweep > 0 && sweep < w) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(114,214,161,0)'); g.addColorStop(0.5, 'rgba(114,214,161,.55)'); g.addColorStop(1, 'rgba(114,214,161,0)');
        ctx.fillStyle = g; ctx.fillRect(sweep, 0, 1, h);
      }
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; if (visible && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } });
    io.observe(cv);
    const mv = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const lv = () => { mouse.x = mouse.y = -999; };
    window.addEventListener('pointermove', mv, { passive: true }); cv.addEventListener('pointerleave', lv);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', mv); };
  }, []);
  return <canvas ref={ref} className={className} aria-hidden />;
}
