'use client';
/** Section 6 — clickable architecture stack with animated connections. */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Status } from '@/lib/site';
import { useSound } from '../sound';
import { EASE, StatusBadge } from '../ui';

export const LAYERS: { key: string; name: string; pkg: string; status: Status; summary: string; detail: string[]; io: [string, string] }[] = [
  { key: 'app', name: 'Application', pkg: 'your code', status: 'implemented', summary: 'A DAO tool, payroll app or treasury dashboard that needs to move value without publishing it.',
    detail: ['Builds an OperationInput: name, category, recipient, amount (integer minor units), asset, policy limit, confidentiality mode.', 'Holds its own keys. VEILOPS never asks for a seed phrase or private key and never stores one.'], io: ['user intent', 'OperationInput'] },
  { key: 'sdk', name: 'VEILOPS SDK', pkg: '@veilops/sdk', status: 'implemented', summary: 'One call, five stages: create → encrypt → evaluate policy → prove → verify.',
    detail: ['createClient({ signingKey, viewers }) returns process(input, policy, { onStage }).', 'Runs entirely locally. No network calls, no telemetry, no key persistence.', 'Emits stage events so interfaces can show progress honestly.'], io: ['OperationInput', 'PublicRecord + Envelope'] },
  { key: 'enc', name: 'Encryption layer', pkg: '@veilops/encryption', status: 'implemented', summary: 'AES-256-GCM envelope; the data key is wrapped per authorized reader with X25519 + HKDF-SHA256.',
    detail: ['Associated data binds the ciphertext to its operation id: moving it to another record fails authentication.', 'grantAccess() adds a reader without re-encrypting the payload. That is selective disclosure.', 'Only the envelope digest is published. The ciphertext stays with the operator.'], io: ['plaintext fields', 'Envelope'] },
  { key: 'policy', name: 'Policy engine', pkg: '@veilops/policy-engine', status: 'implemented', summary: 'Declarative policies. Public rules are checked by anyone, the amount limit is checked in zero knowledge.',
    detail: ['Rules: allowed categories, allowed assets, minimum confidentiality mode, maxAmount, rangeBits.', 'Policies are content-addressed: the policy id is a hash of the policy.', 'A failing policy stops the pipeline. No proof is produced for a violation.'], io: ['OperationInput + Policy', 'PolicyResult'] },
  { key: 'proof', name: 'Proof engine', pkg: '@veilops/proof-engine', status: 'experimental', summary: 'veilops-range-v1: Pedersen commitment + two bit-decomposition range proofs ⇒ 0 ≤ amount ≤ limit.',
    detail: ['Commitment C = v·G + r·H on ristretto255. H is derived by hash-to-curve, so no one knows its discrete log.', 'Each bit commitment carries a CDS OR-proof (it opens to 0 or 1). Fiat–Shamir with SHA-512 binds every challenge to the operation’s public inputs.', 'The upper bound uses the homomorphism D = max·G − C. Proof size is O(n): tens of KB, not succinct.', 'Unaudited. Treat as experimental.'], io: ['amount (private), public inputs', 'PolicyProof'] },
  { key: 'verify', name: 'Verification', pkg: 'verifyRecord()', status: 'implemented', summary: 'A pure function anyone can run: proof, proof-id binding and the operator’s Ed25519 attestation.',
    detail: ['Runs identically in the browser and on a server (POST /api/verify).', 'Never throws on malformed input. It reports which check failed.', 'The Ed25519 signature proves who published a record. It is not a privacy proof.'], io: ['PublicRecord', 'VerifyReport'] },
  { key: 'solana', name: 'Solana integration', pkg: '@veilops/solana-adapter', status: 'experimental', summary: 'Anchors a record digest in an SPL Memo instruction. Confidential transfers are planned.',
    detail: ['buildAnchorInstruction(record, signer) returns a transport-agnostic instruction for your wallet to sign.', 'Tested on devnet: six sample records are anchored and re-verified daily. Never used on mainnet.', 'Planned: Token-2022 confidential-transfer integration where supported, and an Anchor registry program.'], io: ['PublicRecord', 'Memo instruction'] },
];

export function Architecture() {
  const [open, setOpen] = useState<string>('proof');
  const { play } = useSound();
  const active = LAYERS.find(l => l.key === open)!;
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <ol className="relative lg:col-span-5" aria-label="Architecture layers">
        {LAYERS.map((l, i) => (
          <li key={l.key} className="relative">
            <button onClick={() => { setOpen(l.key); play('click'); }} aria-expanded={open === l.key}
              className={`group flex w-full items-center justify-between border px-5 py-4 text-left transition-colors duration-300 ${open === l.key ? 'border-paper bg-paper text-ink' : 'border-line bg-ink hover:border-mute'}`}>
              <span className="flex items-baseline gap-4">
                <span className={`font-mono text-[10px] ${open === l.key ? 'text-ink/60' : 'text-mute'}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[17px] font-medium tracking-[-0.01em]">{l.name}</span>
              </span>
              <span className={`font-mono text-[10px] ${open === l.key ? 'text-ink/60' : 'text-mute'}`}>{l.pkg}</span>
            </button>
            {i < LAYERS.length - 1 && (
              <svg className="mx-auto block h-7 w-4" viewBox="0 0 16 28" aria-hidden>
                <line x1="8" x2="8" y1="0" y2="28" stroke="#292D2B" />
                <motion.line x1="8" x2="8" y1="0" y2="28" stroke="#72D6A1" strokeDasharray="4 24" animate={{ strokeDashoffset: [28, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: i * 0.2 }} />
              </svg>
            )}
          </li>
        ))}
      </ol>
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          <motion.div key={active.key} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.5, ease: EASE }}
            className="sticky top-24 border border-line bg-ink-2/50 p-8 sm:p-10" role="region" aria-live="polite">
            <div className="flex flex-wrap items-center gap-3"><span className="label">{active.pkg}</span><StatusBadge status={active.status} /></div>
            <h3 className="mt-5 text-3xl font-medium tracking-[-0.03em] text-paper sm:text-4xl">{active.name}</h3>
            <p className="mt-4 text-[16px] leading-relaxed text-paper/80">{active.summary}</p>
            <ul className="mt-8 space-y-4 border-t border-line pt-6">
              {active.detail.map(d => <li key={d} className="grid grid-cols-[1rem_1fr] gap-3 text-[14px] leading-relaxed text-mute"><span className="text-jade">—</span>{d}</li>)}
            </ul>
            <div className="mt-8 grid grid-cols-2 gap-px bg-line font-mono text-[11px]">
              <div className="bg-ink p-3"><div className="label mb-1">input</div><span className="text-paper/80">{active.io[0]}</span></div>
              <div className="bg-ink p-3"><div className="label mb-1">output</div><span className="text-paper/80">{active.io[1]}</span></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
