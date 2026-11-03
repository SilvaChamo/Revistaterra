import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import NewsGrid from '@/components/Terra/NewsGrid';
import { PageTitle } from '@/components/Terra/Bits';
import { loadCards } from '@/lib/terra-news';

export const metadata = { title: 'Arquivo de notícias — Revista Terra', robots: { index: false, follow: false } };
export const revalidate = 60;
const PER = 12;

export default async function Noticias({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const cards = await loadCards();
  const pages = Math.max(1, Math.ceil(cards.length / PER));
  const page = Math.min(pages, Math.max(1, parseInt((await searchParams).pagina || '1', 10) || 1));
  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Arquivo" title="Notícias" lead={`${cards.length} notícias publicadas, da mais recente para a mais antiga.`} />
          <NewsGrid cards={cards.slice((page - 1) * PER, page * PER)} page={page} pages={pages} base="/noticias" />
        </main>
        <Sidebar only={['tempo', 'radio', 'cambio', 'capa']} />
      </div>
    </SiteShell>
  );
}
