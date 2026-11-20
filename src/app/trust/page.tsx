import type { Metadata } from 'next';
import { PageHero, Reveal, StatusBadge, LinkButton, Kv } from '@/components/ui';
import { SITE, githubUrl } from '@/lib/site';
import anchorsFile from '../../../data/devnet-anchors.json';
import vectors from '../../../../../test-vectors/veilops-range-v1.json';

export const metadata: Metadata = {
  title: 'Trust & verification',
  description: 'Every way to check VEILOPS yourself: reproducible builds, reference test vectors with an independent second implementation, Solana devnet anchors, build provenance, signed commits and official channels.',
};

const SIGNING_KEY = 'SHA256:0q/tLTLWz3mdlXFnfCcJbDYeJ7nHnGu37TaBa/h96m8';
const blob = (path: string) => githubUrl(`veilops/blob/main/${path}`);

type Anchor = { operationId: string; proofId: string; signature: string; slot: number | null; blockTime: string | null };

function Row({ n, title, status, children }: { n: string; title: string; status: React.ReactNode; children: React.ReactNode }) {
  return (
    <Reveal>
      <article className="grid gap-5 border-b border-line py-10 lg:grid-cols-12">
        <div className="font-mono text-[12px] text-jade lg:col-span-1">{n}</div>
        <div className="lg:col-span-3">
          <h2 className="text-xl text-paper">{title}</h2>
          <div className="mt-3">{status}</div>
        </div>
        <div className="space-y-4 text-[14px] leading-relaxed text-paper/80 lg:col-span-8">{children}</div>
      </article>
    </Reveal>
  );
}

const Code = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto border border-line bg-ink-2/60 p-4 font-mono text-[12px] leading-[1.7] text-paper/85">{children}</pre>
);

export default function Trust() {
  const anchors = anchorsFile.anchors as Anchor[];
  const counts = {
    commitments: vectors.commitments.length,
    challenges: vectors.challenges.length,
    range: vectors.rangeProofs.length,
    rangeNeg: vectors.rangeProofs.filter(r => !r.expected).length,
    policy: vectors.policyProofs.length,
    policyNeg: vectors.policyProofs.filter(r => !r.expected).length,
    records: vectors.records.length,
  };
  return (
    <>
      <PageHero label="Trust / verification" title={<>Don&apos;t trust. Verify.</>}>
        Everything VEILOPS claims can be checked without asking us. This page lists each check, what it proves, and what it does not.
      </PageHero>
      <section className="page">
        <div className="mb-4 flex flex-wrap items-center gap-3 border border-amber/30 bg-ink-2/40 px-4 py-3 font-mono text-[12px] text-mute">
          <StatusBadge status="experimental">not audited</StatusBadge>
          <span>No independent cryptographic review has been performed yet. The checks below are evidence, not an audit.</span>
        </div>

        <div className="border-t border-line">
          <Row n="01" title="Reproducible build" status={<StatusBadge status="implemented">in CI on every commit</StatusBadge>}>
            <p>Anyone can rebuild the release packages from a tag and get byte-identical tarballs. The script installs strictly from the lockfile, then runs typecheck, lint, all tests and the independent verifier, then prints <span className="font-mono">SHA256SUMS</span>.</p>
            <Code>{`git clone ${githubUrl('veilops')} && cd veilops
nvm install && nvm use       # Node pinned in .nvmrc
bash scripts/reproduce.sh    # compare dist/SHA256SUMS with the release`}</Code>
            <p className="text-mute">The website bundle itself is not bit-for-bit reproducible because Next.js embeds build ids, so it is excluded from the checksums.</p>
          </Row>

          <Row n="02" title="Test vectors + a second implementation" status={<StatusBadge status="implemented">two implementations agree</StatusBadge>}>
            <p>
              <a className="underline decoration-line underline-offset-4 hover:decoration-jade" href={blob('test-vectors/veilops-range-v1.json')}>veilops-range-v1.json</a> fixes the protocol: {counts.commitments} commitments, {counts.challenges} Fiat–Shamir challenges, {counts.range} range-proof cases ({counts.rangeNeg} deliberately broken), {counts.policy} policy-proof cases ({counts.policyNeg} broken) and {counts.records} full records, each with its expected verdict.
            </p>
            <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
              <div className="bg-ink p-4"><div className="label mb-2">Reference</div><p className="text-[13px]">TypeScript, <span className="font-mono">@noble/curves</span>. Runs in the browser and in <span className="font-mono">npm test</span>.</p></div>
              <div className="bg-ink p-4"><div className="label mb-2">Independent verifier</div><p className="text-[13px]">Python standard library only: its own ristretto255, hash-to-curve and Ed25519, checked first against the official RFC 9496 and RFC 8032 vectors.</p></div>
            </div>
            <Code>{'python3 verifiers/python/veilops_verify.py test-vectors/veilops-range-v1.json'}</Code>
            <p className="text-mute">Both implementations were written by this project, so this shows the specification is precise and consistent. It does not replace an outside review.</p>
          </Row>

          <Row n="03" title="Solana devnet anchors" status={anchors.length ? <StatusBadge status="verified">{anchors.length} anchors on devnet</StatusBadge> : <StatusBadge status="pending">first anchors pending</StatusBadge>}>
            <p>{anchors.length ? 'Verified sample records are anchored' : 'No devnet transactions have been published yet. Once they are, verified sample records will be anchored'} with SPL Memo transactions carrying <span className="font-mono">veilops:&lt;version&gt;:&lt;proofId&gt;:&lt;sha256(record)&gt;</span>. A daily workflow re-reads every transaction from a public RPC and checks that the memo matches the published record, that the published key signed it, and that the record still verifies.</p>
            <div className="border-t border-line/70">
              <Kv k="cluster" v="devnet (test network, no real value)" />
              <Kv k="anchor key" v={<a className="underline decoration-line underline-offset-4 hover:decoration-jade" href={`https://explorer.solana.com/address/${anchorsFile.signer}?cluster=devnet`} target="_blank" rel="noreferrer">{anchorsFile.signer}</a>} />
              <Kv k="memo program" v={anchorsFile.memoProgram} />
            </div>
            {anchors.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left font-mono text-[12px]">
                  <thead className="text-mute"><tr><th className="py-2 font-normal">record</th><th className="py-2 font-normal">slot</th><th className="py-2 font-normal">transaction</th></tr></thead>
                  <tbody>
                    {anchors.map(a => (
                      <tr key={a.signature} className="border-t border-line/60">
                        <td className="py-2 pr-4"><a className="hover:text-jade" href={`/explorer/${a.operationId}`}>{a.operationId}</a></td>
                        <td className="py-2 pr-4 text-mute">{a.slot ?? '—'}</td>
                        <td className="py-2"><a className="underline decoration-line underline-offset-4 hover:decoration-jade" href={`https://explorer.solana.com/tx/${a.signature}?cluster=devnet`} target="_blank" rel="noreferrer">{a.signature.slice(0, 20)}…</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Code>{'npx tsx scripts/devnet-verify.ts   # re-check every anchor yourself'}</Code>
            <p className="text-mute">This is devnet only. There is no mainnet deployment and no on-chain verifier program yet.</p>
          </Row>

          <Row n="04" title="Build provenance" status={<StatusBadge status="implemented">from v0.1.1</StatusBadge>}>
            <p>Release files are built by GitHub Actions and carry a signed artifact attestation (Sigstore). The attestation proves which workflow run, repository and commit produced a file, so nobody can swap in a hand-made tarball unnoticed.</p>
            <Code>{'gh attestation verify veilops-proof-engine-0.1.1.tgz --repo veilops-protocol/veilops'}</Code>
          </Row>

          <Row n="05" title="Signed commits" status={<StatusBadge status="implemented">from v0.1.1</StatusBadge>}>
            <p>Commits and tags on <span className="font-mono">main</span> are signed with the maintainer&apos;s SSH key and show <em>Verified</em> on GitHub. The project is maintained pseudonymously, so this key, not a name, is what ties every change to the same maintainer.</p>
            <div className="border-t border-line/70"><Kv k="maintainer" v={<a className="underline decoration-line underline-offset-4" href="https://github.com/veilopsonline">@veilopsonline</a>} /><Kv k="signing key" v={SIGNING_KEY} /></div>
            <p className="text-mute">The initial import on 2026-11-20 predates signing and is unsigned. Full history is in the <a className="underline decoration-line underline-offset-4" href={blob('CHANGELOG.md')}>changelog</a>.</p>
          </Row>

          <Row n="06" title="Official channels" status={<StatusBadge status="implemented">one domain, linked both ways</StatusBadge>}>
            <div className="border-t border-line/70">
              <Kv k="website" v={SITE.url.replace('https://', '')} />
              <Kv k="source" v={<a className="underline decoration-line underline-offset-4" href={githubUrl()}>github.com/{SITE.githubOrg}</a>} />
              <Kv k="security" v={<a className="underline decoration-line underline-offset-4" href="/.well-known/security.txt">/.well-known/security.txt</a>} />
              <Kv k="machine-readable" v={<a className="underline decoration-line underline-offset-4" href="/.well-known/veilops.json">/.well-known/veilops.json</a>} />
            </div>
            <p>VEILOPS has <strong className="text-paper">no</strong> official X, Telegram or Discord account yet. Anything else claiming to be official is not, unless it appears here and in a signed commit.</p>
          </Row>

          <Row n="07" title="Independent review" status={<StatusBadge status="planned">not started</StatusBadge>}>
            <p>The scope, the questions for the reviewer and the known limitations are public in <a className="underline decoration-line underline-offset-4" href={blob('docs/audit-scope.md')}>docs/audit-scope.md</a>. When a review happens, the report will be published unedited, with the reviewer&apos;s name, dates and the commit reviewed.</p>
          </Row>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <LinkButton href={blob('VERIFY.md')} external>Full guide: VERIFY.md</LinkButton>
          <LinkButton href="/verify" variant="ghost">Verify a proof in your browser</LinkButton>
        </div>
      </section>
    </>
  );
}
