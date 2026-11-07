import type { MetadataRoute } from 'next';
import { loadCategories, loadPosts } from '@/lib/terra-news';

export const revalidate = 3600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://revistaterraonline.com').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([loadPosts(), loadCategories()]);
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/noticias`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categorias`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/cotacoes`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/planos`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/quem-somos`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/contacto`, changeFrequency: 'yearly', priority: 0.3 },
    ...categories.filter((c) => c.slug !== 'opiniao').map((c) => ({ url: `${SITE_URL}/categoria/${c.slug}`, changeFrequency: 'daily' as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/noticias/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}
