export const fmtAmount = (units: number, asset: string) =>
  (units / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + asset;
export const short = (s: string, h = 8, t = 6) => (!s ? '—' : s.length <= h + t + 1 ? s : `${s.slice(0, h)}…${s.slice(-t)}`);
export const fmtTime = (iso: string) => new Date(iso).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
export const ago = (iso: string) => {
  const d = (Date.now() - Date.parse(iso)) / 1000;
  if (d < 60) return `${Math.max(1, Math.round(d))}s ago`;
  if (d < 3600) return `${Math.round(d / 60)}m ago`;
  if (d < 86400) return `${Math.round(d / 3600)}h ago`;
  return `${Math.round(d / 86400)}d ago`;
};
export const kb = (b64: string) => `${((b64.length * 3) / 4 / 1024).toFixed(1)} KB`;
