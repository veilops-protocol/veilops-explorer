import type { Metadata } from 'next';
import { PageHero, StatusBadge } from '@/components/ui';
import { COMPONENTS, SITE, githubUrl } from '@/lib/site';

export const metadata: Metadata = { title: 'Documentation', description: 'VEILOPS developer documentation: installation, quick start, SDK and package APIs, record format, HTTP API, security model.' };

const TOC = [['start', 'Getting started'], ['install', 'Installation'], ['quick', 'Quick start'], ['concepts', 'Concepts'], ['api-sdk', 'SDK'], ['api-encryption', 'Encryption'], ['api-policy', 'Policy engine'],
  ['api-proof', 'Proof engine'], ['api-solana', 'Solana adapter'], ['record', 'Record format'], ['http', 'HTTP API'], ['examples', 'Examples'], ['security', 'Security model'], ['trust', 'Trust assumptions'], ['status', 'Implementation status']];

const Api = ({ sig, children }: { sig: string; children: React.ReactNode }) => (
  <div className="mb-5 border-l border-line pl-5"><code className="!bg-transparent !p-0 !text-paper">{sig}</code><div className="mt-1.5 text-[14.5px] text-mute">{children}</div></div>
);

export default function Docs() {
  return (
    <>
      <PageHero label="Developers / documentation" title={<>Build on privacy.</>}>
        Everything you need to run VEILOPS locally, integrate the SDK, and understand exactly what it does and does not protect.
      </PageHero>
      <section className="page grid gap-16 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav className="sticky top-24 space-y-1.5 font-mono text-[12px]" aria-label="Documentation">
            {TOC.map(([id, l]) => <a key={id} href={`#${id}`} className="block text-mute hover:text-paper">{l}</a>)}
          </nav>
        </aside>
        <article className="prose-veil min-w-0 lg:col-span-8">
          <h2 id="start" className="!mt-0 scroll-mt-24">Getting started</h2>
          <p>VEILOPS is a TypeScript monorepo of small packages with no runtime services. Everything (encryption, policy evaluation, proving and verification) runs in your process or your user&apos;s browser. Cryptographic primitives come from the audited <code>@noble/curves</code> and <code>@noble/hashes</code> libraries and WebCrypto; the VEILOPS protocol code built on them is not audited.</p>
          <p>Repository: {SITE.githubPublished ? <a href={githubUrl('veilops')}>{SITE.githubOrg}/veilops</a> : <><code>{SITE.githubOrg}/veilops</code> (publication pending; see <a href="/github">/github</a>)</>}.</p>

          <h2 id="install" className="scroll-mt-24">Installation</h2>
          <pre><code>{`git clone https://github.com/${SITE.githubOrg}/veilops.git
cd veilops
nvm use            # Node 22 LTS (20.10+ works)
npm install
npm test           # unit, integration and security tests
npm run dev        # website on http://localhost:3700`}</code></pre>
          <p>The packages are not yet published to npm. Inside the monorepo they resolve through npm workspaces as <code>@veilops/*</code>.</p>

          <h2 id="quick" className="scroll-mt-24">Quick start</h2>
          <pre><code>{`import { createClient, encryption } from '@veilops/sdk';
import { definePolicy } from '@veilops/policy-engine';

const auditor = encryption.generateViewingKeyPair();     // X25519, held by the auditor
const veil = createClient({ viewers: [auditor.publicKey] });

const policy = definePolicy({ name: 'contributors', maxAmount: 25_000_00, rangeBits: 24 });

const res = await veil.process({
  name: 'November payout',
  category: 'payroll',
  recipient: 'alice.sol',
  amount: 4_825_00,          // integer minor units
  asset: 'USDC',
  policyLimit: 25_000_00,
  mode: 'amount-and-recipient',
}, policy, { onStage: e => console.log(e.stage, e.detail) });

res.record;                  // PublicRecord: safe to publish
res.envelope;                // encrypted payload for owner + auditor
veil.verify(res.record);     // { valid: true, checks: [...] }`}</code></pre>

          <h2 id="concepts" className="scroll-mt-24">Concepts</h2>
          <ul>
            <li><strong>Operation</strong>: what the application wants to do: name, category, recipient, amount, asset, policy limit, confidentiality mode.</li>
            <li><strong>Envelope</strong>: the encrypted operation (AES-256-GCM), readable by the owner and explicitly authorized viewers.</li>
            <li><strong>Policy</strong>: content-addressed rules. Public rules are checkable by anyone; the amount limit is enforced in zero knowledge.</li>
            <li><strong>Public record</strong>: commitment + proof + public metadata + Ed25519 attestation. Contains no plaintext amount.</li>
            <li><strong>Modes</strong>: <code>amount-only</code> publishes the recipient; <code>amount-and-recipient</code> and <code>full</code> do not. <code>full</code> currently produces the same record as <code>amount-and-recipient</code> and exists to satisfy stricter policy minimums.</li>
          </ul>

          <h2 id="api-sdk" className="scroll-mt-24">@veilops/sdk</h2>
          <Api sig="createClient(opts?: { signingKey?, owner?, viewers?: string[] })">Returns <code>{'{ process, verify, signingPublicKey, ownerPublicKey }'}</code>. Generates ephemeral keys if none are given; never persists them.</Api>
          <Api sig="process(input, policy, { onStage? }) → Promise<ProcessResult>">Runs created → encrypted → policy → proof → verified. Throws <code>PolicyViolation</code> (with the failing checks) instead of producing a proof for a violation.</Api>
          <Api sig="pseudonym(recipient, salt) → string">Stable salted pseudonym, for apps that need correlation without publishing identifiers.</Api>

          <h2 id="api-encryption" className="scroll-mt-24">@veilops/encryption</h2>
          <Api sig="generateViewingKeyPair() → { publicKey: hex, secretKey: Uint8Array }">X25519 key pair.</Api>
          <Api sig="seal(plaintext, recipients: hex[], aad) → Promise<Envelope>">Encrypts once, wraps the data key per recipient.</Api>
          <Api sig="open(envelope, secretKey) / openText(...)">Decrypts; throws for non-recipients or any tampering.</Api>
          <Api sig="grantAccess(envelope, ownerSecret, newRecipient) → Promise<Envelope>">Selective disclosure without re-encrypting the payload.</Api>
          <Api sig="envelopeDigest(envelope) → hex">SHA-256 over ciphertext, nonce and aad; published in the record.</Api>

          <h2 id="api-policy" className="scroll-mt-24">@veilops/policy-engine</h2>
          <Api sig="definePolicy({ name, maxAmount, rangeBits?, allowedCategories?, allowedAssets?, minimumMode? })">Validates and returns a Policy. <code>maxAmount</code> must be &lt; 2^rangeBits; rangeBits ≤ 48.</Api>
          <Api sig="evaluate(policy, input) → PolicyResult">All rules on plaintext (operator side).</Api>
          <Api sig="evaluatePublic(policy, record) → PolicyCheck[]">Only the rules a third party can check.</Api>
          <Api sig="policyId(policy) → 'pol_…'">Content address of a policy.</Api>

          <h2 id="api-proof" className="scroll-mt-24">@veilops/proof-engine</h2>
          <p><StatusBadge status="experimental" /> Real zero-knowledge proofs; unaudited.</p>
          <Api sig="provePolicy({ operationId, policyId, maxAmount, rangeBits, asset, category, amount })">Returns <code>{'{ publicInputs, proof, proofId, opening, timings }'}</code>. Refuses amounts above the limit.</Api>
          <Api sig="verifyPolicy(publicInputs, proof) → VerifyReport">Checks both range proofs. Never throws on malformed input.</Api>
          <Api sig="verifyRecord(record) → RecordVerification">Proof + proof-id binding + Ed25519 attestation.</Api>
          <Api sig="commit(v, r) · verifyOpening(C, v, r) · proveRange / verifyRange">Lower-level primitives.</Api>
          <Api sig="attest(record, key) · verifyAttestation(record) · generateSigningKey()">Ed25519 publishing signatures.</Api>

          <h2 id="api-solana" className="scroll-mt-24">@veilops/solana-adapter</h2>
          <p><StatusBadge status="experimental" /> Untested on any cluster. Sends nothing.</p>
          <Api sig="anchorMemo(record) → string · buildAnchorInstruction(record, signer)">Memo-program anchor <code>veilops:&lt;version&gt;:&lt;proofId&gt;:&lt;digest&gt;</code> for your wallet to sign.</Api>
          <Api sig="parseAnchorMemo(memo)">Parses an anchor back into its fields.</Api>

          <h2 id="record" className="scroll-mt-24">Record format</h2>
          <pre><code>{`{
  "version": "veilops/0.1",
  "operationId": "op_4f1c9a02b7e3d815",
  "proofId": "prf_91d0a3c4e5f6a7b8c9d0",
  "createdAt": "2026-11-04T14:02:11.000Z",
  "category": "payroll", "asset": "USDC", "mode": "amount-and-recipient",
  "policy": { "id": "pol_3c…", "maxAmount": 2500000, "rangeBits": 24 },
  "amountCommitment": "6a1f…09bd",          // ristretto255 point, hex
  "envelopeDigest": "e3b0…b855",           // sha-256 of the envelope
  "proofSystem": "veilops-range-v1",
  "proof": "eyJzeXN0ZW0iOi…",             // base64
  "attestation": { "publicKey": "…", "signature": "…" }   // ed25519
}`}</code></pre>

          <h2 id="http" className="scroll-mt-24">HTTP API</h2>
          <table><thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead><tbody>
            <tr><td>GET</td><td>/api/health</td><td>Versions; states that no chain is connected.</td></tr>
            <tr><td>GET</td><td>/api/records</td><td>Sample index without proof blobs.</td></tr>
            <tr><td>GET</td><td>/api/records/:id</td><td>Full record by operation id or proof id.</td></tr>
            <tr><td>POST</td><td>/api/verify</td><td>Verify a record (JSON, ≤ 256 KB). Stateless, nothing stored.</td></tr>
          </tbody></table>

          <h2 id="examples" className="scroll-mt-24">Examples</h2>
          <ul>
            <li><code>examples/basic-operation.ts</code>: process, publish, verify, tamper, policy violation. <code>npx tsx examples/basic-operation.ts</code></li>
            <li><code>examples/selective-disclosure.ts</code>: auditor access with <code>grantAccess</code> and commitment opening.</li>
            <li>Server verification: <code>{`curl -X POST /api/verify --data @record.json`}</code></li>
            <li>The <a href="/verify">verification playground</a> and <a href="/app#treasury">dashboard</a> are themselves integrations of the SDK in a Next.js app.</li>
          </ul>

          <h2 id="security" className="scroll-mt-24">Security model</h2>
          <table><thead><tr><th>Data</th><th>Who can see it</th></tr></thead><tbody>
            <tr><td>Amount</td><td>Owner and authorized viewers (envelope); everyone else sees a commitment.</td></tr>
            <tr><td>Recipient</td><td>Public in amount-only mode; otherwise owner and viewers only.</td></tr>
            <tr><td>Name, memo</td><td>Owner and viewers only.</td></tr>
            <tr><td>Category, asset, mode, timestamp, policy limit</td><td>Everyone (metadata).</td></tr>
            <tr><td>That an operation happened, and how often</td><td>Everyone. VEILOPS does not provide anonymity.</td></tr>
          </tbody></table>
          <p>Report vulnerabilities privately through GitHub security advisories on the main repository once it is published. Please do not open public issues for security reports.</p>

          <h2 id="trust" className="scroll-mt-24">Trust assumptions</h2>
          <ul>
            <li>The operator&apos;s Ed25519 key authenticates records. A stolen key allows publishing fake <em>within-policy</em> records, never over-limit proofs.</li>
            <li>Discrete-log hardness on ristretto255 and SHA-512 as a random oracle.</li>
            <li>The client device: plaintext exists in the browser before sealing.</li>
            <li>No blockchain anchoring is live; existence and ordering depend on the publisher.</li>
            <li>Policy contents beyond id, limit and bit length are not published; verifiers cannot recompute the policy id from a record alone.</li>
          </ul>

          <h2 id="status" className="scroll-mt-24">Implementation status</h2>
          <table><thead><tr><th>Component</th><th>Status</th><th>Notes</th></tr></thead><tbody>
            {COMPONENTS.map(c => <tr key={c.key}><td>{c.name}</td><td><StatusBadge status={c.status} /></td><td className="!font-sans">{c.note}</td></tr>)}
          </tbody></table>
        </article>
      </section>
    </>
  );
}
