import type { Metadata } from 'next';
import { Dashboard } from '@/components/Dashboard';
import { summaries, dataset } from '@/lib/samples';
export const metadata: Metadata = { title: 'Dashboard', description: 'VEILOPS protocol dashboard: operations, private treasury, proof center, explorer and developer tools.' };
export default function AppPage() {
  return <Dashboard sample={summaries()} policies={dataset().policies} />;
}
