import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { loadCategories } from '@/lib/terra-news';

export const dynamic = 'force-dynamic';

/** Categorias que já existem no site (as de base e as criadas ao escrever notícias), para o selector do formulário de notícias. */
export async function GET() {
  const guard = await requireAuth('criar_artigos', 'editar_artigos');
  if ('error' in guard) return guard.error;
  try {
    const cats = await loadCategories();
    return NextResponse.json({ categories: cats.filter((c) => c.slug !== 'opiniao').map((c) => c.name) });
  } catch {
    return NextResponse.json({ categories: [] });
  }
}
