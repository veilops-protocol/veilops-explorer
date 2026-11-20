import type { Metadata } from 'next';
import { PageHero, Reveal, StatusBadge } from '@/components/ui';
import { ROADMAP } from '@/lib/roadmap';

export const metadata: Metadata = { title: 'Roadmap', description: 'VEILOPS development roadmap with honest statuses, from foundation to security review.' };

export default function Roadmap() {
  return (
    <>
      <PageHero label="Roadmap" title={<>From proof of concept to proof in production.</>}>
        Five phases. Item statuses reflect code that exists in the repository today, not plans dressed up as progress. There are no dates we cannot defend.
      </PageHero>
      <section className="page">
        {ROADMAP.map((p, i) => (
          <Reveal key={p.phase} delay={i * 0.04}>
            <article className="grid gap-8 border-t border-line py-14 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="font-mono text-[12px] text-mute">PHASE {p.phase}</div>
                <h2 className="mt-3 text-4xl font-medium tracking-[-0.035em] text-paper">{p.title}</h2>
                <div className="mt-4"><StatusBadge status={p.badge}>{p.label}</StatusBadge></div>
                <p className="mt-5 text-[15px] leading-relaxed text-mute">{p.summary}</p>
              </div>
              <ul className="lg:col-span-8">
                {p.items.map(([t, s]) => (
                  <li key={t} className="flex items-baseline justify-between gap-6 border-b border-line/60 py-3.5">
                    <span className={`text-[15px] ${s === 'done' ? 'text-paper' : 'text-paper/70'}`}>{t}</span>
                    <span className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] ${s === 'done' ? 'text-jade' : s === 'in progress' ? 'text-amber' : 'text-mute'}`}>{s}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </section>
    </>
  );
}
