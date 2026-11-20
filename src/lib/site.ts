export const SITE = {
  name: 'VEILOPS',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://veilops.tech',
  tagline: "Privacy is not the absence of proof. It's proof without exposure.",
  githubOrg: process.env.NEXT_PUBLIC_GITHUB_ORG || 'veilops-protocol',
  /** The repositories exist at github.com/veilops-protocol (published 2026-11-20). Set to 'false' in forks without them. */
  githubPublished: process.env.NEXT_PUBLIC_GITHUB_PUBLISHED !== 'false',
};

export const githubUrl = (repo?: string) => `https://github.com/${SITE.githubOrg}${repo ? '/' + repo : ''}`;

export const NAV = [
  { href: '/protocol', label: 'The Protocol' },
  { href: '/#how', label: 'How It Works' },
  { href: '/applications', label: 'Applications' },
  { href: '/explorer', label: 'Explorer' },
  { href: '/docs', label: 'Developers' },
  { href: '/trust', label: 'Trust' },
  { href: '/github', label: 'GitHub' },
];

export type Status = 'implemented' | 'experimental' | 'simulated' | 'planned';

/** Single source of truth for what exists. Shown on every page that mentions a component. */
export const COMPONENTS: { key: string; name: string; status: Status; note: string }[] = [
  { key: 'encryption', name: 'Envelope encryption', status: 'implemented', note: 'AES-256-GCM + X25519/HKDF key wrapping, runs in your browser. Unit-tested, not externally reviewed.' },
  { key: 'policy', name: 'Policy engine', status: 'implemented', note: 'Public rules + a confidential amount limit that is enforced by the range proof.' },
  { key: 'proof', name: 'Range proof (veilops-range-v1)', status: 'experimental', note: 'Real zero-knowledge proof of 0 ≤ amount ≤ limit on a Pedersen commitment. Not audited, not succinct.' },
  { key: 'attestation', name: 'Record attestation', status: 'implemented', note: 'Ed25519 signature by the publishing operator. Proves origin, not privacy.' },
  { key: 'explorer', name: 'Public proof explorer', status: 'implemented', note: 'Real verification in your browser over a SAMPLE dataset. No live network indexer yet.' },
  { key: 'solana', name: 'Solana anchoring', status: 'experimental', note: 'Builds an SPL Memo anchor instruction. Not tested on devnet or mainnet; sends nothing.' },
  { key: 'confidential-transfers', name: 'Token-2022 confidential transfers', status: 'planned', note: 'Integration with the confidential transfer extension where supported.' },
  { key: 'program', name: 'On-chain verifier program', status: 'planned', note: 'An Anchor program for record registration. Not written yet.' },
  { key: 'wallet', name: 'Wallet connection', status: 'planned', note: 'Hidden until there is something real for a wallet to sign.' },
];
