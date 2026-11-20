import { NextResponse } from 'next/server';
import { summaries, dataset } from '@/lib/samples';

export const dynamic = 'force-static';

/** GET /api/records — sample explorer index (no proof blobs). */
export function GET() {
  const d = dataset();
  return NextResponse.json({ sample: true, generatedAt: d.generatedAt, operator: d.operator, policies: d.policies, records: summaries() });
}
