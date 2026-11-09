import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-guard';
import { getAllPosts } from '@/lib/news-data';
import { hasPermission } from '@/lib/permissions';
import { sameAuthor } from '@/lib/columnist-utils';
import { displayNameOf } from '@/lib/display-name';

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const fold = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

/**
 * Índice de pesquisa do painel: todo o texto de cada notícia, de qualquer estado. Fica na cache de dados (etiqueta `news`,
 * que gravar, mudar o estado e eliminar já limpam), por isso só a primeira pesquisa depois de uma alteração é lenta.
 */
const adminSearchIndex = unstable_cache(
  async () => {
    const { data, error } = await supabaseAdmin.from('news').select('id,slug,title,summary,content,category,author_name').eq('site_id', SITE_ID);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({ id: String(r.id), hay: fold([r.title, r.summary, r.category, r.author_name, r.slug, r.content].join(' ')) }));
  },
  ['admin-search-index', 'terra-v1'],
  { tags: ['news'], revalidate: 604800 },
);
const matches = (q: string, hay: string) => fold(q).split(' ').filter(Boolean).every((t) => hay.includes(t));

/** Nome de autor da conta (é o que ficou gravado nos artigos dela); sem conta no Supabase, o nome da sessão. */
async function myAuthorName(userId: string, fallback: string): Promise<string> {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return fallback;
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data?.user ? displayNameOf(data.user) : fallback;
}

/**
 * Lista de notícias do painel. Lê do Supabase no servidor (com a sessão do painel a decidir
 * quem pode ver); se o Supabase recusar ou estiver inacessível, mostra a cópia local do site.
 */
export async function GET(req: NextRequest) {
  const guard = await requireAuth('ler_artigos');
  if ('error' in guard) return guard.error;

  // Com `?q=` a pesquisa corre aqui, em todo o texto da notícia (todos os estados). Com `&ids=1` devolve só os ids.
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  let matchIds: Set<string> | null = null;
  if (q) {
    try {
      matchIds = new Set((await adminSearchIndex()).filter((r) => matches(q, r.hay)).map((r) => r.id));
    } catch {
      matchIds = null;
    }
    if (matchIds && req.nextUrl.searchParams.get('ids') === '1') return NextResponse.json({ ids: [...matchIds] });
  }

  try {
    // Tabela base (mais rápida que a vista `news`). Colunas opcionais que ainda possam não existir na tabela
    // (autor, estado) vão caindo uma a uma; sem `status`, todas contam como publicadas.
    const base = 'id,title,slug,category,date,image_url,summary,views';
    let data: any[] | null = null;
    let error: { message: string } | null = null;
    for (const extra of [',categories,status,author_name', ',status,author_name', ',status', '']) {
      const res = await supabaseAdmin.from('news').select(`${base}${extra}`).eq('site_id', SITE_ID).order('date', { ascending: false });
      data = res.data as any[] | null;
      error = res.error;
      if (!error || !/categories|status|author_name/i.test(error.message)) break;
    }
    if (!error && data) {
      // Opinião tem listas próprias (menu Artigos de Opinião): com ?tipo=opiniao só vêm elas; quem publica (administrador, editor)
      // não as vê misturadas com as notícias. Quem só escreve (contribuidor, colunista) continua a ver os seus artigos todos.
      const opinion = (r: any) => String(r.category ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() === 'opiniao';
      const onlyOpinion = req.nextUrl.searchParams.get('tipo') === 'opiniao';
      const hideOpinion = !onlyOpinion && req.nextUrl.searchParams.get('meus') !== '1' && hasPermission(guard.session.role, 'publicar_artigos');
      // `?meus=1`: só os artigos do próprio (pelo nome de autor da conta), de qualquer categoria e estado.
      const mine = req.nextUrl.searchParams.get('meus') === '1' ? await myAuthorName(guard.session.id, guard.session.name) : null;
      const items = (data as any[])
        .filter((r) => mine === null || sameAuthor(String(r.author_name ?? ''), mine))
        .filter((r) => !matchIds || matchIds.has(String(r.id)))
        .filter((r) => (onlyOpinion ? opinion(r) : hideOpinion ? !opinion(r) : true))
        .map((r) => ({ ...r, status: r.status || 'Published' }));
      return NextResponse.json({ items, source: 'supabase' });
    }
    console.warn('[admin/news/list] Supabase recusou:', error?.message);
  } catch (err) {
    console.warn('[admin/news/list] Supabase inacessível:', err instanceof Error ? err.message : err);
  }

  const { posts } = await getAllPosts();
  const items = posts.map((p) => ({
    id: p.slug,
    title: p.title,
    slug: p.slug,
    category: p.category,
    date: p.date,
    image_url: p.image,
    status: 'Published',
    summary: p.excerpt,
    views: 0,
  }));
  return NextResponse.json({ items, source: 'local' });
}
