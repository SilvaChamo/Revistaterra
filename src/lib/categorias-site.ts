import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { siteCategoryList } from '@/lib/home-config';
import { loadCategories } from '@/lib/terra-news';
import { slugifyCategory, type SiteCategory } from '@/lib/site-categories';

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';

export type CategoryRow = SiteCategory & { count: number };

/** Categorias do painel: as guardadas deste site mais as que já têm notícias deste site (Opinião tem listas próprias). */
export async function listSiteCategories(fresh = false): Promise<CategoryRow[]> {
  const saved = await (fresh ? siteCategoryList.read() : siteCategoryList.get());
  const map = new Map<string, CategoryRow>(saved.map((c) => [c.slug, { ...c, count: 0 }]));
  try {
    for (const c of await loadCategories()) {
      if (c.slug === 'opiniao') continue;
      const e = map.get(c.slug);
      if (e) e.count = c.count;
      else map.set(c.slug, { slug: c.slug, name: c.name, description: '', count: c.count });
    }
  } catch {
    /* sem notícias: ficam as guardadas */
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt'));
}

/** Muda o nome da categoria nas notícias deste site (e só deste), na principal e nas outras. */
export async function renameInNews(oldSlug: string, newName: string) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await db.from('news').select('id,category,categories').eq('site_id', SITE_ID).order('id').range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const r of data ?? []) {
      const list = Array.isArray(r.categories) ? (r.categories as string[]) : [];
      const mainHit = slugifyCategory(String(r.category || '')) === oldSlug;
      const extraHit = list.some((c) => slugifyCategory(String(c)) === oldSlug);
      if (!mainHit && !extraHit) continue;
      const patch: Record<string, unknown> = {};
      if (mainHit) patch.category = newName;
      if (extraHit) patch.categories = [...new Set(list.map((c) => (slugifyCategory(String(c)) === oldSlug ? newName.toLowerCase() : c)))];
      const { error: e2 } = await db.from('news').update(patch).eq('id', r.id).eq('site_id', SITE_ID);
      if (e2) throw new Error(e2.message);
    }
    if ((data?.length ?? 0) < 1000) break;
  }
}
