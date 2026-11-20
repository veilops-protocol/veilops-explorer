import { NextResponse } from 'next/server';
import { PROTOCOL_VERSION } from '@veilops/shared';
import { PROOF_SYSTEM } from '@veilops/proof-engine';
export const dynamic = 'force-dynamic';
export function GET() {
  return NextResponse.json({ ok: true, protocol: PROTOCOL_VERSION, proofSystem: PROOF_SYSTEM, network: 'solana devnet (experimental verifier program 4fWHkQi8HgWPvw5fS4vudFGn6u6eZvdRKwfQqBgVexTZ; no mainnet)', dataset: 'sample' });
}
