import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { refreshSite } from '@/lib/refresh-site';
import { siteCategoryList } from '@/lib/home-config';
import { listSiteCategories, renameInNews } from '@/lib/categorias-site';
import { normalizeSiteCategories, slugifyCategory, type SiteCategory } from '@/lib/site-categories';

export const dynamic = 'force-dynamic';

const toOptions = (rows: Awaited<ReturnType<typeof listSiteCategories>>) =>
  rows.map((c) => ({ slug: c.slug, label: c.name, description: c.description, count: c.count }));

/** Categorias do painel, só deste site: as guardadas e as que já têm notícias, com o endereço (slug), a descrição e o nº de artigos. */
export async function GET() {
  const guard = await requireAuth('ler_artigos');
  if ('error' in guard) return guard.error;
  return NextResponse.json({ options: toOptions(await listSiteCategories(true)) });
}

/** Lista completa a guardar: as já guardadas mais as que só existem nas notícias (para editar ou apagar qualquer uma). */
async function fullList(): Promise<SiteCategory[]> {
  return (await listSiteCategories(true)).map(({ slug, name, description }) => ({ slug, name, description }));
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

async function save(list: SiteCategory[]) {
  await siteCategoryList.save(normalizeSiteCategories(list));
  refreshSite();
  return NextResponse.json({ ok: true, options: toOptions(await listSiteCategories(true)) });
}

/** Acrescenta uma categoria. */
export async function POST(req: NextRequest) {
  const guard = await requireAuth('editar_artigos');
  if ('error' in guard) return guard.error;
  const body = await req.json().catch(() => ({}));
  const name = clean(body.name, 40);
  const slug = slugifyCategory(name);
  if (!slug) return NextResponse.json({ error: 'Escreva o nome da categoria.' }, { status: 400 });
  if (slug === 'opiniao') return NextResponse.json({ error: 'Opinião é só para colunistas.' }, { status: 400 });
  const list = await fullList();
  if (list.some((c) => c.slug === slug)) return NextResponse.json({ error: `«${name}» já existe.` }, { status: 409 });
  try {
    return await save([...list, { slug, name, description: clean(body.description, 120) }]);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Não foi possível guardar.' }, { status: 500 });
  }
}

/** Muda o nome e/ou a descrição; com novo nome, as notícias deste site passam para ele. */
export async function PUT(req: NextRequest) {
  const guard = await requireAuth('editar_artigos');
  if ('error' in guard) return guard.error;
  const body = await req.json().catch(() => ({}));
  const slug = clean(body.slug, 60);
  const name = clean(body.name, 40);
  const newSlug = slugifyCategory(name);
  if (!newSlug) return NextResponse.json({ error: 'Escreva o nome da categoria.' }, { status: 400 });
  if (newSlug === 'opiniao') return NextResponse.json({ error: 'Opinião é só para colunistas.' }, { status: 400 });
  const list = await fullList();
  const current = list.find((c) => c.slug === slug);
  if (!current) return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 });
  if (newSlug !== slug && list.some((c) => c.slug === newSlug)) return NextResponse.json({ error: `«${name}» já existe.` }, { status: 409 });
  try {
    if (name !== current.name || newSlug !== slug) await renameInNews(slug, name);
    return await save(list.map((c) => (c.slug === slug ? { slug: newSlug, name, description: clean(body.description, 120) } : c)));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Não foi possível guardar.' }, { status: 500 });
  }
}

/** Apaga uma categoria sem artigos (com artigos, primeiro mudam-se para outra). */
export async function DELETE(req: NextRequest) {
  const guard = await requireAuth('editar_artigos');
  if ('error' in guard) return guard.error;
  const slug = clean(new URL(req.url).searchParams.get('slug'), 60);
  const rows = await listSiteCategories(true);
  const found = rows.find((c) => c.slug === slug);
  if (!found) return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 });
  if (found.count > 0) {
    return NextResponse.json({ error: `«${found.name}» tem ${found.count} artigo${found.count === 1 ? '' : 's'}: passe-os para outra categoria antes de a apagar.` }, { status: 409 });
  }
  try {
    return await save(rows.filter((c) => c.slug !== slug));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Não foi possível guardar.' }, { status: 500 });
  }
}
