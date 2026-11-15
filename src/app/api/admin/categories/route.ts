import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { loadCategories, slugify } from '@/lib/terra-news';

export const dynamic = 'force-dynamic';

// Categorias de base: aparecem nos selectores do painel mesmo que ainda não tenham notícias.
const BASE = ['Agricultura', 'Mercado', 'Economia', 'Meio Ambiente', 'Clima', 'Tempo', 'Pesca', 'Energia', 'Sociedade', 'Política', 'Internacional', 'Fora de Campo'];

/** Categorias do painel: as de base e as que já têm notícias, com o endereço (slug) e o nome. Opinião tem listas próprias. */
export async function GET() {
  const guard = await requireAuth('ler_artigos');
  if ('error' in guard) return guard.error;
  const map = new Map<string, { label: string; count: number }>();
  for (const name of BASE) map.set(slugify(name), { label: name, count: 0 });
  try {
    for (const c of await loadCategories()) if (c.slug !== 'opiniao') map.set(c.slug, { label: c.name, count: c.count });
  } catch {
    /* sem notícias: ficam as de base */
  }
  const options = [...map].map(([slug, v]) => ({ slug, label: v.label, count: v.count })).sort((a, b) => a.label.localeCompare(b.label, 'pt'));
  return NextResponse.json({ options });
}
