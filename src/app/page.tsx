import Link from 'next/link';
import { Intro } from '@/components/Intro';
import { Hero } from '@/components/Hero';
import { Reveal, SectionHead, LinkButton, StatusBadge, Label } from '@/components/ui';
import { ModelFlow } from '@/components/visuals/ModelFlow';
import { Compare } from '@/components/visuals/Compare';
import { Modules } from '@/components/visuals/Modules';
import { Architecture } from '@/components/visuals/Architecture';
import { VerifyPlayground } from '@/components/VerifyPlayground';
import { ROADMAP } from '@/lib/roadmap';
import { SITE } from '@/lib/site';

const PROBLEMS = [
  ['Treasury', 'Public payment records can expose spending patterns.', 'Every rebalance, runway decision and counterparty becomes a public time series that competitors and attackers can read.'],
  ['Payroll', 'Contributor payments can reveal compensation information.', 'Paying a team on a public ledger publishes each person’s salary, start date and raises, permanently.'],
  ['Operations', 'Business relationships and transaction patterns can become visible.', 'Vendor lists, deal sizes and payment timing reveal strategy long before an announcement does.'],
];

export default function Home() {
  return (
    <>
      <Intro />
      <Hero />

      {/* 02 — the problem */}
      <section className="page py-28 sm:py-40" aria-labelledby="problem">
        <SectionHead index="02" label="The problem" title={<span id="problem">Transparency<br />has a cost.</span>}>
          Public ledgers made settlement verifiable by making everything visible. For individuals that is uncomfortable. For organizations it is often
          unacceptable: the same openness that lets anyone audit a transfer also lets anyone read the business behind it.
        </SectionHead>
        <div className="mt-20 border-t border-line">
          {PROBLEMS.map(([k, h, b], i) => (
            <Reveal key={k} delay={i * 0.05}>
              <div className="grid gap-4 border-b border-line py-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-3"><span className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">0{i + 1} · {k}</span></div>
                <h3 className="text-2xl font-medium leading-snug tracking-[-0.02em] text-paper sm:text-3xl lg:col-span-5">{h}</h3>
                <p className="text-[15px] leading-relaxed text-mute lg:col-span-4">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 03 — the model */}
      <section id="how" className="scroll-mt-20 border-t border-line py-28 sm:py-40" aria-labelledby="model">
        <div className="page">
          <SectionHead index="03" label="The VEILOPS model" title={<span id="model">Hide what matters.<br /><span className="text-mute">Prove what counts.</span></span>}>
            An operation enters. Its sensitive values are sealed. A proof is produced that the hidden amount satisfies the policy. Anyone can check that proof,
            and nobody learns the amount.
          </SectionHead>
          <Reveal className="mt-16"><ModelFlow /></Reveal>
        </div>
      </section>

      {/* 04 — what is visible */}
      <section className="page py-28 sm:py-40" aria-labelledby="visible">
        <SectionHead index="04" label="What is visible?" title={<span id="visible">Selective, not<br />invisible.</span>}>
          Privacy claims are only useful when they are precise. Here is exactly what an outside observer sees in each model.
        </SectionHead>
        <Reveal className="mt-16"><Compare /></Reveal>
      </section>

      {/* 05 — modules */}
      <section className="border-t border-line pt-28 sm:pt-40" aria-labelledby="modules">
        <div className="page">
          <SectionHead index="05" label="Protocol modules" title={<span id="modules">Five modules,<br />one discipline.</span>}>
            Each module is labelled with what it actually is today: implemented, experimental, simulated or planned.
          </SectionHead>
          <div className="mt-16"><Modules /></div>
        </div>
      </section>

      {/* 06 — architecture */}
      <section className="page py-28 sm:py-40" aria-labelledby="arch">
        <SectionHead index="06" label="Architecture" title={<span id="arch">Confidential by design.<br /><span className="text-mute">Verifiable by construction.</span></span>}>
          Seven layers from your application down to Solana. Select a layer for its technical detail.
        </SectionHead>
        <div className="mt-16"><Architecture /></div>
      </section>

      {/* 07 — verify */}
      <section id="verify" className="scroll-mt-20 border-t border-line py-28 sm:py-40" aria-labelledby="verify-h">
        <div className="page">
          <SectionHead index="07" label="Verify it yourself" title={<span id="verify-h">Don’t take<br />our word for it.</span>}>
            Load a published record and run the verifier in your own browser. Then try to cheat: change the limit, the asset or the date, and watch the
            proof refuse to cooperate.
          </SectionHead>
          <Reveal className="mt-16"><VerifyPlayground /></Reveal>
        </div>
      </section>

      {/* 08 — developers */}
      <section className="page py-28 sm:py-40" aria-labelledby="dev">
        <SectionHead index="08" label="Developer ecosystem" title={<span id="dev">Build on privacy.</span>} />
        <div className="mt-16 grid gap-px border border-line bg-line lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="bg-ink p-6 sm:p-10">
            <Label>@veilops/sdk · TypeScript</Label>
            <pre className="mt-6 overflow-x-auto font-mono text-[12.5px] leading-[1.8] text-paper/85">{`import { createClient } from '@veilops/sdk';
import { definePolicy } from '@veilops/policy-engine';

const veil = createClient({ viewers: [auditorPublicKey] });
const policy = definePolicy({ name: 'payroll', maxAmount: 25_000_00 });

const { record, envelope } = await veil.process({
  name: 'Nov payout', category: 'payroll', recipient: 'alice.sol',
  amount: 4_825_00, asset: 'USDC', policyLimit: 25_000_00,
  mode: 'amount-and-recipient',
}, policy);

veil.verify(record).valid; // true, and the amount is not in the record`}</pre>
          </Reveal>
          <div className="grid gap-px bg-line">
            {[['/docs', 'Developer documentation', 'Install, quick start, API reference, record format.'], ['/protocol', 'Protocol architecture', 'Layers, lifecycle and trust assumptions.'],
              ['/technology', 'Cryptography', 'Commitments, OR-proofs, Fiat–Shamir, limitations.'], ['/github', 'GitHub repositories', `${SITE.githubOrg}: monorepo, SDK, proof engine, explorer, docs.`],
              ['/docs#examples', 'Example integrations', 'Basic operation, selective disclosure, server verification.']].map(([href, t, d]) => (
              <Link key={href} href={href} className="group flex items-start justify-between gap-6 bg-ink p-6 transition-colors hover:bg-ink-2">
                <span><span className="block text-[17px] text-paper">{t}</span><span className="mt-1 block text-[13px] text-mute">{d}</span></span>
                <span className="font-mono text-mute transition-transform group-hover:translate-x-1 group-hover:text-paper">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 09 — roadmap */}
      <section className="border-t border-line py-28 sm:py-40" aria-labelledby="road">
        <div className="page">
          <SectionHead index="09" label="Roadmap" title={<span id="road">Honest milestones.</span>}>Statuses describe the code in this repository, not intentions.</SectionHead>
          <div className="mt-16 border-t border-line">
            {ROADMAP.map((p, i) => (
              <Reveal key={p.phase} delay={i * 0.04}>
                <div className="grid gap-4 border-b border-line py-8 lg:grid-cols-12 lg:items-baseline">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute lg:col-span-2">Phase {p.phase}</span>
                  <h3 className="text-2xl font-medium tracking-[-0.02em] text-paper lg:col-span-4">{p.title}</h3>
                  <p className="text-[14px] leading-relaxed text-mute lg:col-span-4">{p.summary}</p>
                  <div className="lg:col-span-2 lg:text-right"><StatusBadge status={p.badge}>{p.label}</StatusBadge></div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8"><LinkButton href="/roadmap" variant="ghost">Full roadmap</LinkButton></div>
        </div>
      </section>

      {/* 10 — final */}
      <section className="page pb-10 pt-28 sm:pt-44" aria-labelledby="final">
        <Reveal><h2 id="final" className="h-display max-w-[16ch] text-[3rem] sm:text-[5.5rem] lg:text-[7.5rem]">The information stays private. <span className="text-mute">The proof speaks.</span></h2></Reveal>
        <Reveal delay={0.1}><div className="mt-12 flex flex-wrap gap-3">
          <LinkButton href="/protocol">Explore VEILOPS</LinkButton>
          <LinkButton href="/github" variant="ghost">View GitHub</LinkButton>
        </div></Reveal>
      </section>
    </>
  );
}
