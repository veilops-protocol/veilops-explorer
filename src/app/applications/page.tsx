import type { Metadata } from 'next';
import { PageHero, Reveal, StatusBadge, LinkButton } from '@/components/ui';
import { Modules } from '@/components/visuals/Modules';

export const metadata: Metadata = { title: 'Applications', description: 'Use cases for VEILOPS: private treasury, payroll, vendor payments, grants and audits with selective disclosure.' };

const CASES: { who: string; problem: string; how: string; visible: string; status: 'implemented' | 'experimental' | 'simulated' | 'planned' }[] = [
  { who: 'DAO treasuries', problem: 'Every rebalance and runway decision is public in real time.', how: 'Treasury operations publish a commitment and a proof against the treasury policy; signers hold the envelope.', visible: 'That an operation occurred, its asset, category, time and policy limit.', status: 'experimental' },
  { who: 'Contributor payroll', problem: 'On-chain payroll publishes everyone’s compensation.', how: 'Each payment is sealed for the contributor and finance, and proven to respect the payroll band.', visible: 'Payment count and timing; never individual amounts or (in private modes) recipients.', status: 'simulated' },
  { who: 'Vendor payments', problem: 'Supplier relationships and deal sizes leak strategy.', how: 'Recipient and amount sealed; the policy limits single payments per vendor category.', visible: 'Category, asset, timing, policy.', status: 'experimental' },
  { who: 'Grant programs', problem: 'Grantees are exposed before announcements; amounts invite comparisons.', how: 'Grant disbursements prove they stay within the committee-approved cap.', visible: 'Program policy and disbursement timing.', status: 'experimental' },
  { who: 'Audits & compliance', problem: 'Auditors need everything, the public needs nothing.', how: 'grantAccess() wraps the data key for an auditor; the commitment opening proves the disclosed amount is the one that was proven.', visible: 'Nothing new. Disclosure is off-chain and scoped.', status: 'implemented' },
  { who: 'Market makers & funds', problem: 'Positions and flows can be front-run.', how: 'A future integration with confidential transfers would settle amounts privately.', visible: 'Depends on the settlement layer.', status: 'planned' },
];

export default function Applications() {
  return (
    <>
      <PageHero label="Applications" title={<>Where privacy is a requirement, not a feature.</>}>
        Organizations rarely need to hide <em>that</em> they operate, only <em>what</em>. These are the workflows VEILOPS is designed for, with an honest status for each.
      </PageHero>
      <section className="page py-12">
        <div className="border-t border-line">
          {CASES.map((c, i) => (
            <Reveal key={c.who} delay={i * 0.03}>
              <article className="grid gap-6 border-b border-line py-12 lg:grid-cols-12">
                <div className="lg:col-span-3"><h2 className="text-3xl font-medium tracking-[-0.03em] text-paper">{c.who}</h2><div className="mt-4"><StatusBadge status={c.status} /></div></div>
                <div className="lg:col-span-3"><div className="label mb-2">Problem</div><p className="text-[15px] leading-relaxed text-paper/80">{c.problem}</p></div>
                <div className="lg:col-span-3"><div className="label mb-2">With VEILOPS</div><p className="text-[15px] leading-relaxed text-paper/80">{c.how}</p></div>
                <div className="lg:col-span-3"><div className="label mb-2">Still visible</div><p className="text-[15px] leading-relaxed text-mute">{c.visible}</p></div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="page pt-24"><Modules /></section>
      <section className="page pt-20"><div className="flex flex-wrap gap-3"><LinkButton href="/app">Try the treasury workflow</LinkButton><LinkButton href="/verify" variant="ghost">Verify a proof</LinkButton></div></section>
    </>
  );
}
