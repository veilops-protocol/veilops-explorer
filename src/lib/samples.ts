import 'server-only';
import raw from '../../data/samples.json';
import type { PublicRecord } from '@veilops/shared';

export type Entry = { record: PublicRecord; status: 'verified' | 'failed' | 'pending'; note?: string };
export interface Dataset { generatedAt: string; operator: string; policies: { id: string; name: string; maxAmount: number; rangeBits: number; allowedCategories: string[]; minimumMode: string }[]; records: Entry[] }

// Bundled at build time so serverless deployments never depend on the working directory.
const data = raw as unknown as Dataset;
export function dataset(): Dataset {
  return data;
}

/** List view: everything except the heavy proof blob. */
export function summaries() {
  return dataset().records.map(({ record, status, note }) => {
    const { proof, ...rest } = record;
    return { ...rest, proofBytes: Math.round((proof.length * 3) / 4), status, note };
  });
}
export type Summary = ReturnType<typeof summaries>[number];

export function find(id: string): Entry | undefined {
  return dataset().records.find(e => e.record.operationId === id || (e.record.proofId && e.record.proofId === id));
}
