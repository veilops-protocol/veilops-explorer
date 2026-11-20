import type { Metadata } from 'next';
import { PageHero, SectionHead } from '@/components/ui';
import { VerifyPlayground } from '@/components/VerifyPlayground';
import { OperationDemo } from '@/components/OperationDemo';

export const metadata: Metadata = { title: 'Verify', description: 'Interactive VEILOPS verification playground: create a confidential operation, generate a real range proof, and verify any record in your browser.' };

export default function Verify() {
  return (
    <>
      <PageHero label="Verification playground" title={<>Don’t take our word for it.</>}>
        Two instruments. On the left, create an operation and watch it move through all five stages with real cryptography in your browser. Below,
        load any published record and verify it yourself, or try to tamper with it.
      </PageHero>
      <section className="page">
        <SectionHead index="A" label="Protocol demonstration" title="Process an operation." />
        <div className="mt-12"><OperationDemo /></div>
      </section>
      <section className="page pt-28">
        <SectionHead index="B" label="Verifier" title="Check a record." />
        <div className="mt-12"><VerifyPlayground /></div>
      </section>
    </>
  );
}
