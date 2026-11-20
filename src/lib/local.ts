'use client';
import type { PublicRecord } from '@veilops/shared';

/** Records created in this browser. Public records only: no plaintext, no keys. */
export type LocalEntry = { record: PublicRecord; status: 'verified' | 'failed'; stages: { stage: string; at: string; ms: number; detail: string; ok: boolean }[] };
const KEY = 'veilops.local.records.v1';

export function loadLocal(): LocalEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
export function saveLocal(e: LocalEntry) {
  try {
    const all = [e, ...loadLocal().filter(x => x.record.operationId !== e.record.operationId)].slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('veilops-local'));
  } catch { /* quota or disabled */ }
}
export function clearLocal() {
  try { localStorage.removeItem(KEY); window.dispatchEvent(new Event('veilops-local')); } catch { /* ignore */ }
}
