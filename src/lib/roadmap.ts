export const ROADMAP: { phase: string; title: string; summary: string; badge: 'implemented' | 'experimental' | 'planned' | 'pending'; label: string; items: [string, 'done' | 'in progress' | 'planned'][] }[] = [
  { phase: '01', title: 'Foundation', summary: 'Protocol architecture, SDK foundation and interactive proof demonstration.', badge: 'experimental', label: 'in progress',
    items: [['Monorepo, shared types, canonical encoding', 'done'], ['Envelope encryption + selective disclosure', 'done'], ['Policy engine', 'done'], ['veilops-range-v1 range proof (experimental)', 'done'], ['Interactive website, explorer over sample data, dashboard', 'done'], ['Public GitHub organization and repositories', 'in progress'], ['Independent review of the proof construction', 'planned']] },
  { phase: '02', title: 'Proof infrastructure', summary: 'Proof generation, verification and policy engine integration.', badge: 'planned', label: 'planned',
    items: [['Aggregated / succinct range proofs (e.g. Bulletproofs) to cut proof size', 'planned'], ['Proof generation in a Web Worker', 'planned'], ['Richer policy predicates (per-period totals, allow-lists)', 'planned'], ['Live indexer replacing the sample dataset', 'planned']] },
  { phase: '03', title: 'Solana integration', summary: 'Devnet testing, supported confidential-transfer integrations and operation lifecycle.', badge: 'planned', label: 'planned',
    items: [['Devnet testing of memo anchoring', 'planned'], ['Anchor registry program for record digests', 'planned'], ['Token-2022 confidential transfer integration where supported', 'planned'], ['Wallet connection (only once there is something to sign)', 'planned']] },
  { phase: '04', title: 'Applications', summary: 'Treasury, payroll and selective disclosure workflows.', badge: 'planned', label: 'planned',
    items: [['Multi-signer treasury workflow', 'planned'], ['Batch payroll with per-recipient envelopes', 'planned'], ['Auditor portal for scoped disclosure', 'planned']] },
  { phase: '05', title: 'Security and ecosystem', summary: 'External review, security testing, developer integrations and expanded infrastructure.', badge: 'planned', label: 'planned',
    items: [['External cryptography and code audit', 'planned'], ['Fuzzing and property-based tests', 'planned'], ['Third-party integrations and SDK stabilization', 'planned']] },
];
