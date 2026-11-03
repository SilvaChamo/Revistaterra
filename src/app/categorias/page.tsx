import Link from 'next/link';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { getCategories } from '@/lib/news-data';
import { GREEN } from '@/lib/terra';

export const revalidate = 60;
export const metadata = { title: 'Categorias — Revista Terra' };

/** Todas as categorias que têm notícias na Revista Terra, com o número de notícias de cada uma. */
export default async function Categorias() {
  const categorias = await getCategories();
  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Notícias" title="Categorias" lead="Explore as notícias da Revista Terra por tema." />
          {categorias.length === 0 ? (
            <p className="bg-white py-16 text-center text-neutral-500 shadow-sm">Ainda não há categorias.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {categorias.map((c) => (
                <Link key={c.slug} href={`/categoria/${c.slug}`} className="flex items-center justify-between bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <span className="font-semibold" style={{ color: GREEN }}>{c.label}</span>
                  <span className="text-xs text-neutral-500">{c.count} {c.count === 1 ? 'notícia' : 'notícias'}</span>
                </Link>
              ))}
            </div>
          )}
        </main>
        <Sidebar only={['tempo', 'radio', 'cambio']} />
      </div>
    </SiteShell>
  );
}
