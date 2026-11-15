import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { listSiteCategories } from '@/lib/categorias-site';

export const dynamic = 'force-dynamic';

/** Categorias deste site (as guardadas no painel e as criadas ao escrever notícias), para o selector do formulário de notícias. */
export async function GET() {
  const guard = await requireAuth('criar_artigos', 'editar_artigos');
  if ('error' in guard) return guard.error;
  try {
    return NextResponse.json({ categories: (await listSiteCategories(true)).map((c) => c.name) });
  } catch {
    return NextResponse.json({ categories: [] });
  }
}
