import Link from 'next/link';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { GREEN } from '@/lib/terra';
import { loadCategories } from '@/lib/terra-news';

export const metadata = { title: 'Categorias — Revista Terra', robots: { index: false, follow: false } };
export const revalidate = 60;

export default async function Categorias() {
  const cats = await loadCategories();
  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Notícias" title="Categorias" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cats.map((c) => (
              <Link key={c.slug} href={`/categoria/${c.slug}`} className="flex items-center justify-between bg-white p-4 shadow-sm hover:shadow-md">
                <span className="font-bold text-[#064E3B]">{c.name}</span>
                <span className="px-2 py-0.5 text-xs font-bold text-white" style={{ background: GREEN }}>{c.count}</span>
              </Link>
            ))}
          </div>
        </main>
        <Sidebar only={['tempo', 'radio', 'cambio']} />
      </div>
    </SiteShell>
  );
}
