import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { PostCard, Pager } from '@/components/Terra/Posts';
import { ARCHIVE_PAGE_SIZE, getAllPosts } from '@/lib/news-data';

export const revalidate = 60;
export const metadata = { title: 'Arquivo de notícias — Revista Terra' };

/** Arquivo de todas as notícias, com pesquisa (?q=) e paginação (?pagina=). */
export default async function ArquivoDeNoticias({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string }>;
}) {
  const { q = '', pagina } = await searchParams;
  const query = q.trim().toLowerCase();
  const { posts } = await getAllPosts();
  const found = query ? posts.filter((p) => `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(query)) : posts;

  const pages = Math.max(1, Math.ceil(found.length / ARCHIVE_PAGE_SIZE));
  const page = Math.min(Math.max(parseInt(pagina || '1', 10) || 1, 1), pages);
  const visible = found.slice((page - 1) * ARCHIVE_PAGE_SIZE, page * ARCHIVE_PAGE_SIZE);
  const hrefFor = (n: number) => `/noticias?${new URLSearchParams({ ...(q ? { q } : {}), ...(n > 1 ? { pagina: String(n) } : {}) })}`;

  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Notícias" title={q ? `Resultados para “${q}”` : 'Arquivo de notícias'} />
          {visible.length === 0 ? (
            <p className="bg-white py-16 text-center text-neutral-500 shadow-sm">Nenhuma notícia encontrada.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map((p) => <PostCard key={p.slug} post={p} />)}</div>
          )}
          <Pager page={page} pages={pages} hrefFor={hrefFor} />
        </main>
        <Sidebar only={['tempo', 'radio', 'cambio']} />
      </div>
    </SiteShell>
  );
}
