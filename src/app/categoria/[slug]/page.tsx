import { notFound } from 'next/navigation';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import NewsGrid from '@/components/Terra/NewsGrid';
import { PageTitle } from '@/components/Terra/Bits';
import { loadCards, slugify } from '@/lib/terra-news';

export const revalidate = 60;
const PER = 12;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = (await loadCards()).find((x) => slugify(x.category) === slug);
  return { title: `${c?.category ?? 'Categoria'} — Revista Terra`, robots: { index: false, follow: false } };
}

export default async function Categoria({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ pagina?: string }> }) {
  const { slug } = await params;
  const cards = (await loadCards()).filter((c) => slugify(c.category) === slug);
  if (!cards.length) notFound();
  const pages = Math.max(1, Math.ceil(cards.length / PER));
  const page = Math.min(pages, Math.max(1, parseInt((await searchParams).pagina || '1', 10) || 1));
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Notícias', href: '/noticias' }, { label: cards[0].category }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Categoria" title={cards[0].category} lead={`${cards.length} ${cards.length === 1 ? 'notícia' : 'notícias'}.`} />
          <NewsGrid cards={cards.slice((page - 1) * PER, page * PER)} page={page} pages={pages} base={`/categoria/${slug}`} />
        </main>
        <Sidebar only={['tempo', 'radio', 'cambio', 'capa']} />
      </div>
    </SiteShell>
  );
}
