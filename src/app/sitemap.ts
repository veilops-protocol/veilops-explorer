import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
const ROUTES = ['', '/protocol', '/technology', '/applications', '/explorer', '/verify', '/app', '/docs', '/roadmap', '/github'];
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-11-20');
  return ROUTES.map(r => ({ url: `${SITE.url}${r}`, lastModified, changeFrequency: 'weekly', priority: r === '' ? 1 : 0.7 }));
}
