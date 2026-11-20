import { NextResponse } from 'next/server';
import { find, dataset } from '@/lib/samples';

export function generateStaticParams() {
  return dataset().records.map(e => ({ id: e.record.operationId }));
}

/** GET /api/records/:id — full signed record (by operation id or proof id). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = find(id);
  if (!e) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ sample: true, ...e });
}
