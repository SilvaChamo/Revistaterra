import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import NewsGrid from '@/components/Terra/NewsGrid';
import { PageTitle } from '@/components/Terra/Bits';
import { loadCards } from '@/lib/terra-news';

export const metadata = { title: 'Arquivo de notícias — Revista Terra', robots: { index: false, follow: false } };
export const revalidate = 60;
const PER = 12;

export default async function Noticias({ searchParams }: { searchParams: Promise<{ pagina?: string; q?: string }> }) {
  const { q = '', pagina } = await searchParams;
  const query = q.trim().toLowerCase();
  const all = await loadCards();
  const cards = query ? all.filter((c) => `${c.title} ${c.excerpt} ${c.category}`.toLowerCase().includes(query)) : all;
  const pages = Math.max(1, Math.ceil(cards.length / PER));
  const page = Math.min(pages, Math.max(1, parseInt(pagina || '1', 10) || 1));
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Notícias' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker={query ? 'Pesquisa' : 'Arquivo'} title={query ? `Resultados para “${q.trim()}”` : 'Notícias'} lead={query ? `${cards.length} ${cards.length === 1 ? 'notícia encontrada' : 'notícias encontradas'}.` : `${cards.length} notícias publicadas, da mais recente para a mais antiga.`} />
          <NewsGrid cards={cards.slice((page - 1) * PER, page * PER)} page={page} pages={pages} base={query ? `/noticias?q=${encodeURIComponent(q.trim())}` : '/noticias'} />
        </main>
        <Sidebar only={['tempo', 'radio', 'cambio', 'capa']} />
      </div>
    </SiteShell>
  );
}
