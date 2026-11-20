import { NextResponse } from 'next/server';
import { PROTOCOL_VERSION } from '@veilops/shared';
import { PROOF_SYSTEM } from '@veilops/proof-engine';
export const dynamic = 'force-dynamic';
export function GET() {
  return NextResponse.json({ ok: true, protocol: PROTOCOL_VERSION, proofSystem: PROOF_SYSTEM, network: 'none (no chain deployment)', dataset: 'sample' });
}
