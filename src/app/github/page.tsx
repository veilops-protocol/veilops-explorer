import type { Metadata } from 'next';
import { PageHero, Reveal, StatusBadge, LinkButton } from '@/components/ui';
import { SITE, githubUrl } from '@/lib/site';

export const metadata: Metadata = { title: 'GitHub', description: 'VEILOPS open-source repositories: protocol monorepo, TypeScript SDK, proof engine, explorer and documentation.' };

const REPOS = [
  { name: 'veilops', desc: 'Privacy infrastructure for programmable financial operations, cryptographic proofs and selective disclosure.', role: 'Main protocol monorepo: source of truth', paths: 'apps/ · packages/ · docs/ · tests/ · examples/', status: 'experimental' as const },
  { name: 'veilops-sdk', desc: 'TypeScript developer SDK.', role: 'Subtree mirror of packages/sdk', paths: 'packages/sdk', status: 'implemented' as const },
  { name: 'veilops-proof-engine', desc: 'Proof generation and verification interfaces (veilops-range-v1).', role: 'Subtree mirror of packages/proof-engine', paths: 'packages/proof-engine', status: 'experimental' as const },
  { name: 'veilops-explorer', desc: 'Public proof explorer and website.', role: 'Subtree mirror of apps/website', paths: 'apps/website', status: 'implemented' as const },
  { name: 'veilops-docs', desc: 'Technical documentation.', role: 'Subtree mirror of docs/', paths: 'docs', status: 'implemented' as const },
];

const TREE = `veilops/
├── .github/            workflows (CI, audit), issue + PR templates, dependabot
├── apps/website/       Next.js site: homepage, explorer, verify, dashboard, docs
├── packages/
│   ├── shared/         types, canonical JSON, ids, encoding
│   ├── encryption/     AES-256-GCM envelopes, X25519/HKDF key wrapping
│   ├── policy-engine/  declarative policies, public + confidential rules
│   ├── proof-engine/   Pedersen commitments, range proofs, attestation
│   ├── sdk/            createClient().process(): the 5-stage pipeline
│   └── solana-adapter/ memo anchoring (experimental; devnet scripts)
├── docs/               architecture, protocol, cryptography, security, guide, roadmap
├── examples/           runnable integrations
├── tests/              unit · integration · security (vitest)
├── scripts/            samples, test vectors, reproduce.sh, devnet anchoring
├── test-vectors/       reference vectors for veilops-range-v1
├── verifiers/python/   independent standard-library verifier
└── README · CONTRIBUTING · SECURITY · CODE_OF_CONDUCT · LICENSE`;

export default function GitHub() {
  const live = SITE.githubPublished;
  return (
    <>
      <PageHero label={`GitHub / ${SITE.githubOrg}`} title={<>Read the code. Run the tests.</>}>
        VEILOPS is developed in the open under Apache-2.0. The claims on this website are only as good as the code behind them, so here is where it lives.
      </PageHero>
      <section className="page">
        <div className="mb-10 flex flex-wrap items-center gap-3 border border-line bg-ink-2/40 px-4 py-3 font-mono text-[12px] text-mute">
          {live ? <StatusBadge status="implemented">published</StatusBadge> : <StatusBadge status="pending">publication pending</StatusBadge>}
          <span>{live ? `Repositories are live at github.com/${SITE.githubOrg}.` : `The organization ${SITE.githubOrg} and its repositories are prepared but not yet created on GitHub. Links will go live once they exist. We will not show a repository before it does.`}</span>
        </div>
        <div className="border-t border-line">
          {REPOS.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.04}>
              <article className="grid gap-4 border-b border-line py-8 lg:grid-cols-12 lg:items-baseline">
                <div className="lg:col-span-4">
                  {live ? <a href={githubUrl(r.name)} target="_blank" rel="noreferrer" className="font-mono text-xl text-paper underline decoration-line underline-offset-4 hover:decoration-jade">{SITE.githubOrg}/{r.name}</a>
                    : <span className="font-mono text-xl text-paper">{SITE.githubOrg}/{r.name}</span>}
                </div>
                <p className="text-[15px] text-paper/80 lg:col-span-4">{r.desc}</p>
                <div className="font-mono text-[12px] text-mute lg:col-span-3">{r.role}<br /><span className="text-mute/70">{r.paths}</span></div>
                <div className="lg:col-span-1 lg:text-right"><StatusBadge status={r.status} /></div>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-16 grid gap-px border border-line bg-line lg:grid-cols-[1.3fr_1fr]">
          <pre className="overflow-x-auto bg-ink p-6 font-mono text-[12px] leading-[1.8] text-paper/85">{TREE}</pre>
          <div className="bg-ink p-6">
            <div className="label mb-4">Quality gates</div>
            {[['TypeScript', 'tsc --noEmit across packages and website'], ['Lint', 'ESLint 9 + typescript-eslint'], ['Tests', 'vitest: unit, integration, security (tamper), reference vectors'], ['Verifier', 'independent Python implementation of the same vectors'], ['Reproducible', 'byte-identical package tarballs + SHA256SUMS'], ['Build', 'next build of the website'], ['Dependencies', 'npm audit + Dependabot']].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 border-b border-line/50 py-2.5 text-[13px] last:border-0"><span className="font-mono text-paper">{k}</span><span className="text-mute">{v}</span></div>
            ))}
            <p className="mt-5 text-[13px] leading-relaxed text-mute">No stars, forks or audits are shown here because none exist yet. That is the point.</p>
          </div>
        </div>
        <div className="mt-16 border border-line p-6 sm:p-8">
          <div className="label mb-5">How to check this project is genuine</div>
          <ol className="grid gap-4 text-[14px] leading-relaxed text-paper/80 md:grid-cols-2">
            <li><span className="font-mono text-jade">01</span> The organization <span className="font-mono">github.com/{SITE.githubOrg}</span> links to veilops.tech, and this site links back to it, both ways.</li>
            <li><span className="font-mono text-jade">02</span> Clone the monorepo and run <span className="font-mono">npm test</span>: 74 unit, integration, tamper and reference-vector tests exercise the real cryptography, and a second, independent Python implementation checks the same vectors.</li>
            <li><span className="font-mono text-jade">03</span> Every proof in the explorer can be re-verified in your browser with the same open-source code, and the deliberately tampered samples fail.</li>
            <li><span className="font-mono text-jade">04</span> CI, CodeQL and dependency audits run in public on every change. Their badges link to the actual runs.</li>
            <li><span className="font-mono text-jade">05</span> Security reports go through GitHub private advisories. See <a className="underline decoration-line underline-offset-4" href="/.well-known/security.txt">security.txt</a>.</li>
            <li><span className="font-mono text-jade">06</span> We state what is missing: no external audit, no mainnet deployment and no npm packages yet. Treat any claim otherwise as not coming from this project. All checks are listed on the <a className="underline decoration-line underline-offset-4" href="/trust">trust page</a>.</li>
          </ol>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          {live && <LinkButton href={githubUrl('veilops')} external>Open the monorepo</LinkButton>}
          <LinkButton href="/docs" variant={live ? 'ghost' : 'primary'}>Read the docs</LinkButton>
        </div>
      </section>
    </>
  );
}
