import { NextResponse } from 'next/server';
import { verifyRecord } from '@veilops/proof-engine';
import type { PublicRecord } from '@veilops/shared';

export const runtime = 'nodejs';
const MAX_BYTES = 256 * 1024;

/** POST /api/verify — server-side verification of a public record. Stateless; nothing is stored or logged. */
export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > MAX_BYTES) return NextResponse.json({ error: 'record too large' }, { status: 413 });
  let rec: PublicRecord;
  try { rec = JSON.parse(text); } catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }
  if (!rec || typeof rec !== 'object' || typeof rec.proof !== 'string' || !rec.policy || !rec.attestation)
    return NextResponse.json({ error: 'not a VEILOPS public record' }, { status: 422 });
  const report = verifyRecord(rec);
  return NextResponse.json({ verifiedBy: 'server', ...report });
}
