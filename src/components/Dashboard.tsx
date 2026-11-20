'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, ListOrdered, Vault, ShieldCheck, Search, Code2, Settings, ArrowLeft } from 'lucide-react';
import type { Summary } from '@/lib/samples';
import { loadLocal, clearLocal, type LocalEntry } from '@/lib/local';
import { ago, fmtAmount, fmtTime, short } from '@/lib/format';
import { COMPONENTS } from '@/lib/site';
import { Wordmark } from './Mark';
import { StatusBadge, Kv } from './ui';
import { OperationDemo } from './OperationDemo';
import { VerifyPlayground } from './VerifyPlayground';
import { ExplorerTable } from './ExplorerTable';
import { SoundControl } from './Nav';
import { useSound } from './sound';

type Policy = { id: string; name: string; maxAmount: number; rangeBits: number; allowedCategories: string[]; minimumMode: string };
const TABS = [
  ['overview', 'Overview', LayoutGrid], ['operations', 'Operations', ListOrdered], ['treasury', 'Private Treasury', Vault],
  ['proofs', 'Proof Center', ShieldCheck], ['explorer', 'Explorer', Search], ['developer', 'Developer', Code2], ['settings', 'Settings', Settings],
] as const;
type Tab = (typeof TABS)[number][0];

type Row = { operationId: string; proofId: string; createdAt: string; category: string; asset: string; status: 'verified' | 'failed' | 'pending'; maxAmount: number; local: boolean };

export function Dashboard({ sample, policies }: { sample: Summary[]; policies: Policy[] }) {
  const { play } = useSound();
  const [tab, setTab] = useState<Tab>('overview');
  const [local, setLocal] = useState<LocalEntry[]>([]);
  useEffect(() => {
    const fromHash = window.location.hash.slice(1) as Tab;
    if (TABS.some(t => t[0] === fromHash)) setTab(fromHash);
    const read = () => setLocal(loadLocal());
    read(); window.addEventListener('veilops-local', read);
    return () => window.removeEventListener('veilops-local', read);
  }, []);
  const go = (t: Tab) => { setTab(t); play('click'); history.replaceState(null, '', `#${t}`); window.scrollTo({ top: 0 }); };

  const rows: Row[] = useMemo(() => [
    ...local.map(e => ({ operationId: e.record.operationId, proofId: e.record.proofId, createdAt: e.record.createdAt, category: e.record.category, asset: e.record.asset, status: e.status, maxAmount: e.record.policy.maxAmount, local: true })),
    ...sample.map(s => ({ operationId: s.operationId, proofId: s.proofId, createdAt: s.createdAt, category: s.category, asset: s.asset, status: s.status, maxAmount: s.policy.maxAmount, local: false })),
  ], [local, sample]);
  const count = (s: Row['status']) => rows.filter(r => r.status === s).length;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-ink md:flex">
        <Link href="/" className="flex h-16 items-center border-b border-line px-5 text-paper"><Wordmark /></Link>
        <nav className="flex-1 space-y-px p-3" aria-label="Dashboard">
          {TABS.map(([k, label, Icon]) => (
            <button key={k} onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[14px] transition-colors ${tab === k ? 'bg-ink-2 text-paper' : 'text-mute hover:text-paper'}`}>
              <Icon size={15} strokeWidth={1.5} /> {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-line p-4 font-mono text-[10px] leading-relaxed text-mute">Demonstration environment. No wallet, no network, no backend writes. Sample data + records created in this browser.</div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-ink/85 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-mute hover:text-paper md:hidden" aria-label="Home"><ArrowLeft size={16} /></Link>
            <h1 className="text-[15px] text-paper">{TABS.find(t => t[0] === tab)![1]}</h1>
            <StatusBadge status="simulated">demo environment</StatusBadge>
          </div>
          <SoundControl />
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 md:hidden">
          {TABS.map(([k, label]) => <button key={k} onClick={() => go(k)} className={`shrink-0 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] ${tab === k ? 'bg-paper text-ink' : 'text-mute'}`}>{label}</button>)}
        </div>

        <div className="p-5 sm:p-8">
          {tab === 'overview' && (
            <div className="space-y-8">
              <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
                {[['Total demonstration operations', rows.length], ['Verified demonstration proofs', count('verified')], ['Pending operations', count('pending')], ['Failed operations', count('failed')]].map(([k, v]) => (
                  <div key={k as string} className="bg-ink p-6"><div className="label">{k}</div><div className="mt-3 text-5xl font-medium tracking-[-0.04em] text-paper">{v}</div></div>
                ))}
              </div>
              <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
                <div className="border border-line">
                  <div className="flex items-center justify-between border-b border-line px-5 py-3"><span className="label">Recent activity</span><button onClick={() => go('operations')} className="font-mono text-[11px] text-mute hover:text-paper">all →</button></div>
                  {rows.slice(0, 8).map(r => (
                    <Link key={r.operationId} href={`/explorer/${r.operationId}`} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line/50 px-5 py-3 font-mono text-[12px] last:border-0 hover:bg-ink-2">
                      <span className="min-w-0 truncate"><span className="text-paper">{short(r.operationId, 9, 5)}</span> <span className="text-mute">· {r.category} · {r.asset} · {ago(r.createdAt)}</span>{r.local && <span className="ml-2 text-jade">yours</span>}</span>
                      <StatusBadge status={r.status} />
                    </Link>
                  ))}
                </div>
                <div className="border border-line p-5">
                  <div className="label mb-4">Implementation status</div>
                  {COMPONENTS.slice(0, 7).map(c => <div key={c.key} className="flex items-center justify-between border-b border-line/50 py-2.5 text-[13px] last:border-0"><span className="text-paper/85">{c.name}</span><StatusBadge status={c.status} /></div>)}
                </div>
              </div>
              <button onClick={() => go('treasury')} className="btn-primary">Create an operation →</button>
            </div>
          )}

          {tab === 'operations' && (
            <div className="overflow-x-auto border border-line">
              <table className="w-full min-w-[760px] font-mono text-[12px]">
                <thead><tr className="border-b border-line text-left text-mute">{['Operation', 'Proof', 'Created', 'Category', 'Asset', 'Limit', 'Source', 'Status'].map(h => <th key={h} className="px-4 py-3 font-normal uppercase tracking-[0.12em]">{h}</th>)}</tr></thead>
                <tbody>{rows.map(r => (
                  <tr key={r.operationId} className="border-b border-line/50 hover:bg-ink-2">
                    <td className="px-4 py-2.5"><Link className="text-paper underline decoration-line underline-offset-4" href={`/explorer/${r.operationId}`}>{short(r.operationId, 9, 5)}</Link></td>
                    <td className="px-4 py-2.5 text-paper/70">{short(r.proofId, 9, 5)}</td><td className="px-4 py-2.5 text-mute">{fmtTime(r.createdAt).slice(0, 16)}</td>
                    <td className="px-4 py-2.5">{r.category}</td><td className="px-4 py-2.5">{r.asset}</td><td className="px-4 py-2.5">{fmtAmount(r.maxAmount, '')}</td>
                    <td className="px-4 py-2.5 text-mute">{r.local ? 'this browser' : 'sample'}</td><td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}

          {tab === 'treasury' && (
            <div className="space-y-10">
              <OperationDemo />
              <div>
                <div className="label mb-4">Configured policies (sample treasury)</div>
                <div className="grid gap-px border border-line bg-line md:grid-cols-2">
                  {policies.map(p => (
                    <div key={p.id} className="bg-ink p-5">
                      <div className="flex items-center justify-between"><span className="text-[16px] text-paper">{p.name}</span><span className="font-mono text-[10px] text-mute">{p.id}</span></div>
                      <Kv k="Max amount" v={fmtAmount(p.maxAmount, '')} /><Kv k="Categories" v={p.allowedCategories.join(', ')} /><Kv k="Minimum mode" v={p.minimumMode} /><Kv k="Range bits" v={p.rangeBits} />
                    </div>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[11px] text-mute">In the form above, the policy is built from your “Policy limit” field. Policies are content-addressed: change any rule and the id changes.</p>
              </div>
              <div>
                <div className="label mb-4">Operation history (this browser)</div>
                {local.length === 0 ? <p className="font-mono text-[12px] text-mute">No operations yet. Process one above.</p> : (
                  <div className="border border-line">{local.map(e => (
                    <Link key={e.record.operationId} href={`/explorer/${e.record.operationId}`} className="flex items-center justify-between border-b border-line/50 px-4 py-3 font-mono text-[12px] last:border-0 hover:bg-ink-2">
                      <span><span className="text-paper">{e.record.operationId}</span> <span className="text-mute">· {e.record.category} · {e.record.asset} · {fmtTime(e.record.createdAt)}</span></span><StatusBadge status={e.status} />
                    </Link>))}</div>
                )}
              </div>
            </div>
          )}

          {tab === 'proofs' && <VerifyPlayground />}
          {tab === 'explorer' && <ExplorerTable rows={sample} />}

          {tab === 'developer' && (
            <div className="grid gap-8 xl:grid-cols-2">
              <div className="border border-line p-6">
                <div className="label mb-4">SDK example</div>
                <pre className="overflow-x-auto font-mono text-[12px] leading-[1.75] text-paper/85">{`npm install   # in the veilops monorepo

import { createClient, encryption } from '@veilops/sdk';
import { definePolicy } from '@veilops/policy-engine';

const auditor = encryption.generateViewingKeyPair();
const veil = createClient({ viewers: [auditor.publicKey] });

const res = await veil.process(input, definePolicy({
  name: 'vendors', maxAmount: 150_000_00,
}), { onStage: e => console.log(e.stage, e.detail) });

res.record          // publish this
res.envelope        // store privately
veil.verify(res.record).valid`}</pre>
              </div>
              <div className="border border-line p-6">
                <div className="label mb-4">HTTP API (this deployment)</div>
                {[['GET', '/api/health', 'protocol + proof system versions'], ['GET', '/api/records', 'sample index, no proof blobs'], ['GET', '/api/records/:id', 'full signed record by operation or proof id'], ['POST', '/api/verify', 'verify a PublicRecord JSON body (≤256 KB), stateless']].map(([m, p, d]) => (
                  <div key={p} className="grid grid-cols-[3.5rem_10rem_1fr] gap-3 border-b border-line/50 py-2.5 font-mono text-[12px] last:border-0"><span className="text-jade">{m}</span><a href={p.includes(':') ? undefined : p} className="text-paper" target="_blank" rel="noreferrer">{p}</a><span className="text-mute">{d}</span></div>
                ))}
                <pre className="mt-5 overflow-x-auto bg-ink-2 p-4 font-mono text-[11.5px] text-paper/80">{`curl -s https://veilops.tech/api/records | jq '.records[0]'
curl -s -X POST https://veilops.tech/api/verify \\
  -H 'content-type: application/json' --data @record.json`}</pre>
              </div>
              <div className="border border-line p-6 xl:col-span-2">
                <div className="label mb-4">Integration status</div>
                {COMPONENTS.map(c => <div key={c.key} className="grid gap-2 border-b border-line/50 py-3 md:grid-cols-[16rem_9rem_1fr] md:items-baseline last:border-0"><span className="text-paper">{c.name}</span><span><StatusBadge status={c.status} /></span><span className="text-[13px] text-mute">{c.note}</span></div>)}
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="max-w-2xl space-y-8">
              <div className="border border-line p-6"><div className="label mb-4">Sound</div><SoundControl /><p className="mt-3 text-[13px] text-mute">All audio is synthesized locally and off by default.</p></div>
              <div className="border border-line p-6">
                <div className="label mb-3">Local data</div>
                <p className="text-[14px] text-mute">This browser stores {local.length} public record(s) you created: no plaintext, no keys. Viewing keys and owner keys exist only in memory while the page is open.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-ghost" onClick={() => { clearLocal(); play('click'); }}>Delete local records</button>
                  <button className="btn-ghost" onClick={() => { try { localStorage.removeItem('veilops.intro.v1'); } catch { /* ignore */ } play('click'); }}>Show intro again next visit</button>
                </div>
              </div>
              <div className="border border-line p-6"><div className="label mb-3">Wallet</div><p className="text-[14px] text-mute">Wallet connection is intentionally absent. It will appear when there is a real on-chain action to sign (Phase 03).</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
