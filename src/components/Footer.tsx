'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wordmark } from './Mark';
import { SITE, githubUrl } from '@/lib/site';

const COLS: [string, [string, string][]][] = [
  ['Protocol', [['/protocol', 'Architecture'], ['/technology', 'Technology'], ['/applications', 'Applications'], ['/roadmap', 'Roadmap']]],
  ['Use it', [['/verify', 'Verify a proof'], ['/explorer', 'Explorer'], ['/app', 'Dashboard'], ['/docs', 'Documentation']]],
  ['Source', [['/github', 'Repositories'], ['/trust', 'Trust & verification'], ['/docs#security', 'Security model'], ['/docs#trust', 'Trust assumptions'], ['/docs#status', 'Implementation status']]],
];

export function Footer() {
  const path = usePathname();
  if (path?.startsWith('/app')) return null;
  const replay = () => { try { localStorage.removeItem('veilops.intro.v1'); } catch { /* ignore */ } window.location.href = '/'; };
  return (
    <footer className="mt-32 border-t border-line">
      <div className="page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Wordmark className="text-paper" />
          <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-mute">{SITE.tagline}</p>
          <p className="mt-6 max-w-sm font-mono text-[11px] leading-relaxed text-mute/80">
            Phase 01 software. The range proof is experimental and unaudited. Explorer data is sample data. No mainnet deployment.
          </p>
        </div>
        {COLS.map(([title, links]) => (
          <div key={title} className="md:col-span-2">
            <div className="label mb-4">{title}</div>
            <ul className="space-y-2.5 text-[14px]">
              {links.map(([href, label]) => <li key={href}><Link href={href} className="text-paper/70 hover:text-paper">{label}</Link></li>)}
            </ul>
          </div>
        ))}
        <div className="md:col-span-1" />
      </div>
      <div className="page flex flex-col gap-3 border-t border-line/60 py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-mute sm:flex-row sm:items-center sm:justify-between">
        <span>veilops.tech · Apache-2.0</span>
        <span className="flex gap-6">
          <button onClick={replay} className="uppercase hover:text-paper">Replay intro</button>
          {SITE.githubPublished ? <a href={githubUrl()} className="hover:text-paper">github.com/{SITE.githubOrg}</a> : <Link href="/github" className="hover:text-paper">GitHub: publishing soon</Link>}
        </span>
      </div>
    </footer>
  );
}
