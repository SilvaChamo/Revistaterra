import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import PodcastPlayer from '@/components/Terra/PodcastPlayer';
import { DARK, LIME, terra } from '@/lib/terra';

type Pod = (typeof terra.podcasts)[number] & { audio?: string; spotify?: string };

const slugOf = (url: string) => url.replace(/\/+$/, '').split('/').pop() || '';
const find = (slug: string) => (terra.podcasts as Pod[]).find((p) => slugOf(p.url) === slug);

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
  const others = (terra.podcasts as Pod[]).filter((x) => x !== p);
  const meta = ['Por Revista Terra', p.episode, p.duration].filter(Boolean).join(' · ');
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Podcasts', href: '/podcasts' }, { label: p.title }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          <article className="overflow-hidden bg-white shadow-sm max-sm:-mx-3">
            {/* um só card: a capa ocupa toda a altura do card, sem margens (a toda a largura no telemóvel); por baixo do episódio, o leitor */}
            <div className="grid sm:grid-cols-[280px_1fr]">
              {p.image && (
                <div className="relative aspect-[4/3] sm:aspect-auto">
                  <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '12% center' }} />
                </div>
              )}
              <div className="min-w-0 p-5 sm:px-6 sm:py-5">
                <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: LIME, color: DARK }}>Podcast</span>
                <h1 className="mt-2 text-xl font-extrabold leading-tight sm:text-2xl" style={{ color: DARK }}>{p.title}</h1>
                {p.excerpt && <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">{p.excerpt}</p>}
                <div className="mt-2 text-xs font-bold text-neutral-800">{meta}</div>
                <div className="mt-2"><PodcastPlayer src={p.audio} duration={p.duration} /></div>
              </div>
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
