import { notFound } from 'next/navigation';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { PostCard, Pager } from '@/components/Terra/Posts';
import { PAGE_SIZE, categoryLabel, getCategories, getCategoryPosts, isKnownCategory, slugify } from '@/lib/news-data';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = slugify(decodeURIComponent((await params).slug));
  return { title: `Arquivo de ${categoryLabel(slug)} — Revista Terra` };
}

/** Modelo único de categoria: serve todas as categorias (/categoria/<slug>?pagina=N). */
export default async function PaginaDeCategoria({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pagina?: string }>;
}) {
  const slug = slugify(decodeURIComponent((await params).slug));
  const posts = await getCategoryPosts(slug);

  // Categoria sem notícias e desconhecida => 404; conhecida mas vazia => página vazia.
  if (posts.length === 0 && !isKnownCategory(slug) && !(await getCategories()).some((c) => c.slug === slug)) notFound();

  const pages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const page = Math.min(Math.max(parseInt((await searchParams).pagina || '1', 10) || 1, 1), pages);
  const visible = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Categoria" title={categoryLabel(slug)} />
          {visible.length === 0 ? (
            <p className="bg-white py-16 text-center text-neutral-500 shadow-sm">Ainda não há notícias nesta categoria.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map((p) => <PostCard key={p.slug} post={p} />)}</div>
          )}
          <Pager page={page} pages={pages} hrefFor={(n) => (n === 1 ? `/categoria/${slug}` : `/categoria/${slug}?pagina=${n}`)} />
        </main>
        <Sidebar only={['tempo', 'radio', 'cambio']} />
      </div>
    </SiteShell>
  );
}
