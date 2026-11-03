import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { Tag } from '@/components/Terra/Bits';
import { GREEN, terra } from '@/lib/terra';

const slugOf = (url: string) => url.replace(/\/+$/, '').split('/').pop() || '';
const find = (slug: string) => terra.podcasts.find((p) => slugOf(p.url) === slug);

export function generateStaticParams() {
  return terra.podcasts.map((p) => ({ slug: slugOf(p.url) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = find((await params).slug);
  return { title: p ? `${p.title} — Podcasts — Revista Terra` : 'Podcast — Revista Terra', description: p?.excerpt, robots: { index: false, follow: false } };
}

export default async function Podcast({ params }: { params: Promise<{ slug: string }> }) {
  const p = find((await params).slug);
  if (!p) notFound();
  const others = terra.podcasts.filter((x) => x !== p);
  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          <nav className="mb-3 text-xs text-neutral-500" aria-label="Caminho">
            <Link href="/" className="hover:underline">Início</Link> › <Link href="/podcasts" className="hover:underline">Podcasts</Link>
          </nav>
          <article className="bg-white shadow-sm">
            {p.image && <img src={p.image} alt="" className="h-[240px] w-full object-cover sm:h-[400px]" />}
            <div className="border-t-4 p-5 sm:p-8" style={{ borderColor: GREEN }}>
              <Tag>Podcast</Tag>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight text-[#064E3B] sm:text-[34px]">{p.title}</h1>
              {p.excerpt && <p className="mt-5 text-[17px] leading-relaxed text-neutral-700">{p.excerpt}</p>}
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-9 items-center px-5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:!bg-[#8DF43A] hover:!text-[#064E3B]" style={{ background: GREEN }}>Ouvir o episódio ›</a>
            </div>
          </article>
          {others.length > 0 && (
            <section className="mt-5">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-600">Outros episódios</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {others.map((x) => (
                  <Link key={x.url} href={`/podcasts/${slugOf(x.url)}`} className="group block bg-white shadow-sm hover:shadow-md">
                    {x.image && <img src={x.image} alt="" className="aspect-video w-full object-cover" />}
                    <div className="p-4"><span className="text-[10px] font-bold uppercase text-[#047857]">Podcast</span><h3 className="mt-1 text-sm font-bold group-hover:underline">{x.title}</h3></div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
        <Sidebar only={['radio', 'newsletter', 'capa']} />
      </div>
    </SiteShell>
  );
}
