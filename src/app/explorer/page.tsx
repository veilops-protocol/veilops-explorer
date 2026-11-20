import type { Metadata } from 'next';
import { PageHero, StatusBadge } from '@/components/ui';
import { ExplorerTable } from '@/components/ExplorerTable';
import { summaries, dataset } from '@/lib/samples';
import { short } from '@/lib/format';

export const metadata: Metadata = { title: 'Explorer', description: 'Public proof explorer: search VEILOPS operation and proof records and verify them in your browser. Sample data.' };

export default function Explorer() {
  const d = dataset();
  return (
    <>
      <PageHero label="Public proof explorer" title={<>Every record, independently checkable.</>}>
        Search published operation records, filter by verification result and re-run the verifier on any of them. Amounts and private recipients never appear here.
      </PageHero>
      <section className="page">
        <div className="mb-8 flex flex-wrap items-center gap-3 border border-line bg-ink-2/40 px-4 py-3 font-mono text-[11px] text-mute">
          <StatusBadge status="sample">sample data</StatusBadge>
          <span>Network: none. These records were generated with the real SDK and signed by a throwaway sample-operator key <span className="text-paper/80">{short(d.operator, 10, 6)}</span>. Two are deliberately tampered.</span>
        </div>
        <ExplorerTable rows={summaries()} />
      </section>
    </>
  );
}
