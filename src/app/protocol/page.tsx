import type { Metadata } from 'next';
import { PageHero, Reveal, SectionHead, StatusBadge, LinkButton } from '@/components/ui';
import { Architecture } from '@/components/visuals/Architecture';
import { ModelFlow } from '@/components/visuals/ModelFlow';
import { COMPONENTS } from '@/lib/site';

export const metadata: Metadata = { title: 'The Protocol', description: 'VEILOPS protocol architecture: operation lifecycle, record format, trust assumptions and implementation status.' };

const LIFECYCLE = [
  ['Created', 'The application submits an OperationInput. The SDK assigns a random operation id and timestamp.'],
  ['Encrypted', 'Name, recipient, amount and memo are sealed in an AES-256-GCM envelope bound to the operation id. The data key is wrapped for the owner and every authorized viewer.'],
  ['Policy evaluated', 'Public rules (category, asset, mode) and the confidential amount limit are checked on plaintext, locally. A violation stops the pipeline: there is no proof for a violation.'],
  ['Proof generated', 'The amount is committed (Pedersen, ristretto255) and two range proofs show 0 ≤ amount ≤ limit. The proof id is the hash of the proof.'],
  ['Verified', 'The public record is signed (Ed25519) and re-verified from scratch, exactly as an independent verifier would.'],
];

const FIELDS: [string, string, string][] = [
  ['operationId', 'public', 'Random, unique per operation; part of every Fiat–Shamir challenge.'],
  ['proofId', 'public', 'prf_ + truncated SHA-256 of the canonical proof.'],
  ['createdAt', 'public', 'ISO-8601 timestamp, covered by the attestation.'],
  ['category · asset · mode', 'public', 'Needed for public policy checks. This is metadata.'],
  ['policy { id, maxAmount, rangeBits }', 'public', 'The limit is a public input to the proof.'],
  ['amountCommitment', 'commitment', 'C = v·G + r·H. Perfectly hiding: reveals nothing about v.'],
  ['envelopeDigest', 'digest', 'SHA-256 of the envelope; the ciphertext itself is not published.'],
  ['recipient', 'mode-dependent', 'Present only in amount-only mode.'],
  ['proof', 'proof', 'veilops-range-v1 proof, base64. O(n) size.'],
  ['attestation', 'signature', 'Ed25519 public key + signature over the canonical record.'],
];

export default function Protocol() {
  return (
    <>
      <PageHero label="The protocol" title={<>A record that proves itself.</>}>
        VEILOPS turns a sensitive financial operation into two artifacts: an encrypted envelope that only authorized parties can open, and a public record
        that anyone can verify without learning the hidden values.
      </PageHero>

      <section className="page py-20">
        <SectionHead index="01" label="Lifecycle" title="Five stages, in order." />
        <ol className="mt-14 border-t border-line">
          {LIFECYCLE.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.04}>
              <li className="grid gap-3 border-b border-line py-8 lg:grid-cols-12">
                <span className="font-mono text-[11px] text-mute lg:col-span-1">0{i + 1}</span>
                <h3 className="text-2xl font-medium tracking-[-0.02em] text-paper lg:col-span-4">{t}</h3>
                <p className="text-[15px] leading-relaxed text-mute lg:col-span-7">{d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-14"><ModelFlow /></Reveal>
      </section>

      <section className="page py-20">
        <SectionHead index="02" label="Architecture" title="Seven layers." />
        <div className="mt-14"><Architecture /></div>
      </section>

      <section className="page py-20">
        <SectionHead index="03" label="Record format" title="What gets published.">Every field of a public record, and what kind of information it carries.</SectionHead>
        <div className="mt-14 overflow-x-auto border border-line">
          <table className="w-full min-w-[640px] font-mono text-[12.5px]">
            <thead><tr className="border-b border-line text-left text-mute"><th className="px-5 py-3 font-normal uppercase tracking-[0.14em]">Field</th><th className="px-5 py-3 font-normal uppercase tracking-[0.14em]">Class</th><th className="px-5 py-3 font-normal uppercase tracking-[0.14em]">Notes</th></tr></thead>
            <tbody>{FIELDS.map(([f, c, n]) => <tr key={f} className="border-b border-line/60"><td className="px-5 py-3 text-paper">{f}</td><td className="px-5 py-3 text-mute">{c}</td><td className="px-5 py-3 font-sans text-[14px] text-paper/75">{n}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section id="trust" className="page py-20">
        <SectionHead index="04" label="Trust assumptions" title="What you still have to trust." />
        <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-2">
          {[
            ['The operator’s key', 'The Ed25519 attestation says who published a record. If the operator key is compromised, an attacker can publish valid-looking records for amounts within policy, but never prove an over-limit amount.'],
            ['The policy is public', 'The limit is a public input. Anyone can see that a payroll policy caps payments at a value, though not what any payment was.'],
            ['Metadata is visible', 'Timing, category, asset, mode, policy and (in amount-only mode) recipient are public. Volume and frequency analysis remain possible.'],
            ['Cryptographic assumptions', 'Discrete log hardness on ristretto255 for binding; SHA-512 modelled as a random oracle for Fiat–Shamir. The construction is classical but this implementation is unaudited.'],
            ['Your browser', 'Encryption, proving and verification run in client-side JavaScript. A compromised device or extension can read plaintext before it is sealed.'],
            ['No chain finality yet', 'Records are not anchored on any blockchain today. Ordering and existence are only as good as the publisher’s storage.'],
          ].map(([t, d]) => <div key={t} className="bg-ink p-7"><h3 className="text-lg text-paper">{t}</h3><p className="mt-2 text-[14px] leading-relaxed text-mute">{d}</p></div>)}
        </div>
      </section>

      <section id="status" className="page py-20">
        <SectionHead index="05" label="Implementation status" title="What exists today." />
        <div className="mt-14 border-t border-line">
          {COMPONENTS.map(c => (
            <div key={c.key} className="grid gap-3 border-b border-line py-5 md:grid-cols-12 md:items-baseline">
              <span className="text-[16px] text-paper md:col-span-4">{c.name}</span>
              <span className="md:col-span-2"><StatusBadge status={c.status} /></span>
              <span className="text-[14px] text-mute md:col-span-6">{c.note}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3"><LinkButton href="/technology">Read the cryptography</LinkButton><LinkButton href="/verify" variant="ghost">Run the demo</LinkButton></div>
      </section>
    </>
  );
}
