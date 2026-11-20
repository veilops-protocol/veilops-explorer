import type { Metadata } from 'next';
import { PageHero, Reveal, SectionHead, StatusBadge } from '@/components/ui';

export const metadata: Metadata = { title: 'Technology', description: 'Cryptographic design of VEILOPS: Pedersen commitments on ristretto255, bit-decomposition range proofs, CDS OR-proofs, Fiat–Shamir, envelope encryption.' };

const Eq = ({ children }: { children: React.ReactNode }) => <div className="my-6 overflow-x-auto border-l border-jade/60 bg-ink-2/60 px-5 py-4 font-mono text-[14px] text-paper">{children}</div>;

export default function Technology() {
  return (
    <>
      <PageHero label="Technology" title={<>The mathematics, without the mystique.</>}>
        Every claim on this site maps to a construction below and to code in the repository. Where something is a simulation or a plan, it says so.
      </PageHero>

      <section className="page grid gap-16 py-16 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav className="sticky top-24 space-y-2 font-mono text-[12px]" aria-label="On this page">
            {[['#commitments', 'Commitments'], ['#range', 'Range proofs'], ['#or', 'OR-proofs'], ['#fs', 'Fiat–Shamir'], ['#policy', 'Policy bound'], ['#encryption', 'Encryption'], ['#attestation', 'Attestation'], ['#not', 'What it is not'], ['#next', 'Next']].map(([h, l]) =>
              <a key={h} href={h} className="block text-mute hover:text-paper">{l}</a>)}
          </nav>
        </aside>
        <article className="prose-veil lg:col-span-8">
          <Reveal>
            <h2 id="commitments">1. Pedersen commitments on ristretto255</h2>
            <p>An amount <code>v</code> is never published. Instead the operator publishes a commitment with a fresh random blinding factor <code>r</code>:</p>
            <Eq>C = v·G + r·H</Eq>
            <p><code>G</code> is the ristretto255 base point. <code>H</code> is derived with RFC 9380 hash-to-curve from the public string <code>VEILOPS/pedersen/H/v1</code>, so nobody, including us, knows <code>log_G(H)</code>. The commitment is <em>perfectly hiding</em> (every value is equally consistent with <code>C</code>) and <em>computationally binding</em> (opening it to a different value would require solving a discrete logarithm). Ristretto255 gives a prime-order group without the cofactor pitfalls of raw Ed25519 points.</p>
          </Reveal>
          <Reveal>
            <h2 id="range">2. Range proofs by bit decomposition</h2>
            <p>To prove <code>0 ≤ v &lt; 2ⁿ</code>, the prover writes <code>v = Σ bᵢ·2ⁱ</code> and commits to every bit with its own blinding <code>rᵢ</code>, chosen so that <code>Σ 2ⁱ·rᵢ = r</code>:</p>
            <Eq>Cᵢ = bᵢ·G + rᵢ·H&nbsp;&nbsp;&nbsp;&nbsp;and the verifier checks&nbsp;&nbsp;Σ 2ⁱ·Cᵢ = C</Eq>
            <p>If every <code>Cᵢ</code> commits to 0 or 1, the weighted sum can only open to a number in <code>[0, 2ⁿ)</code>. Proof size grows linearly with <code>n</code>: about 160 bytes per bit before encoding.</p>
          </Reveal>
          <Reveal>
            <h2 id="or">3. Cramer–Damgård–Schoenmakers OR-proofs</h2>
            <p>For each bit the prover shows knowledge of <code>x</code> with <code>Cᵢ = x·H</code> (bit 0) <em>or</em> <code>Cᵢ − G = x·H</code> (bit 1), without revealing which. The true branch is a Schnorr proof; the other branch is simulated by choosing its challenge and response first:</p>
            <Eq>A_b = k·H&nbsp;&nbsp;·&nbsp;&nbsp;A_¬b = s_¬b·H − c_¬b·Y_¬b<br />e = Hash(ctx, i, Cᵢ, A₀, A₁)&nbsp;&nbsp;·&nbsp;&nbsp;c_b = e − c_¬b&nbsp;&nbsp;·&nbsp;&nbsp;s_b = k + c_b·x</Eq>
            <p>The verifier recomputes <code>A₀ = s₀·H − c₀·Y₀</code>, <code>A₁ = s₁·H − c₁·Y₁</code> and accepts iff <code>c₀ + c₁ = Hash(ctx, i, Cᵢ, A₀, A₁)</code>. This is honest-verifier zero knowledge: the transcript is distributed identically whichever branch is real.</p>
          </Reveal>
          <Reveal>
            <h2 id="fs">4. Fiat–Shamir and context binding</h2>
            <p>Challenges are derived from SHA-512 over a length-prefixed, domain-separated transcript, reduced modulo the group order. The transcript context is the canonical JSON of all public inputs: operation id, policy id, limit, bit length, asset, category and the commitment. A proof therefore cannot be replayed onto another operation, another asset or a stricter limit. The tests in <code>tests/security</code> check exactly this.</p>
          </Reveal>
          <Reveal>
            <h2 id="policy">5. Proving amount ≤ limit</h2>
            <p>Commitments are additively homomorphic. Given the public limit <code>m</code>, the verifier itself computes</p>
            <Eq>D = m·G − C = (m − v)·G + (−r)·H</Eq>
            <p>and the prover supplies a second range proof that <code>D</code> opens to a value in <code>[0, 2ⁿ)</code>. Since <code>m &lt; 2ⁿ</code> and <code>2ⁿ⁺¹</code> is far below the group order, both proofs together imply <code>0 ≤ v ≤ m</code>. An over-limit amount makes <code>m − v</code> wrap to a huge scalar, for which no bit decomposition exists, so the SDK refuses to prove it and a forged proof would fail.</p>
          </Reveal>
          <Reveal>
            <h2 id="encryption">6. Envelope encryption and selective disclosure</h2>
            <ul>
              <li>Payload: AES-256-GCM via WebCrypto, 96-bit random nonce, associated data = protocol version + operation id.</li>
              <li>Key wrapping: a fresh ephemeral X25519 key per recipient, HKDF-SHA256 over the shared secret (salt = ephemeral ‖ recipient public key), AES-256-GCM wrap of the data key.</li>
              <li>Selective disclosure: <code>grantAccess()</code> unwraps the data key with the owner key and re-wraps it for a new viewer. The ciphertext is unchanged. To prove the disclosed amount matches the public record, the owner also shares the commitment opening <code>(v, r)</code>, which the viewer checks against <code>C</code>.</li>
            </ul>
          </Reveal>
          <Reveal>
            <h2 id="attestation">7. Attestation</h2>
            <p>Every public record is signed with Ed25519 over its canonical JSON (domain-separated). The signature proves which operator published the record and that no field changed since. It is not a zero-knowledge proof, and the interface never presents it as one.</p>
          </Reveal>
          <Reveal>
            <h2 id="not">8. What this is not</h2>
            <table>
              <thead><tr><th>Claim</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>Hides amounts in public records</td><td><StatusBadge status="implemented">yes</StatusBadge></td></tr>
                <tr><td>Proves amount ≤ policy limit in zero knowledge</td><td><StatusBadge status="experimental">yes, unaudited</StatusBadge></td></tr>
                <tr><td>Succinct proofs (SNARK / Bulletproofs)</td><td><StatusBadge status="planned">no</StatusBadge></td></tr>
                <tr><td>Anonymity of senders / transaction graph</td><td><StatusBadge status="planned">no, not a goal of v0.1</StatusBadge></td></tr>
                <tr><td>On-chain verification on Solana</td><td><StatusBadge status="planned">no</StatusBadge></td></tr>
                <tr><td>Independent security audit</td><td><StatusBadge status="planned">not yet</StatusBadge></td></tr>
              </tbody>
            </table>
          </Reveal>
          <Reveal>
            <h2 id="next">9. Next</h2>
            <p>Phase 02 targets logarithmic-size range proofs (Bulletproofs-style inner-product arguments) to shrink proofs from tens of kilobytes to under one, aggregation across a batch of payroll lines, and proving inside a Web Worker. Phase 03 explores Solana&apos;s Token-2022 confidential transfer extension, which already uses twisted ElGamal and range proofs on-chain, as the settlement layer where it is supported.</p>
          </Reveal>
        </article>
      </section>
    </>
  );
}
