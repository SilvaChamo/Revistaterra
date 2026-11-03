import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { DARK, GREEN, LIME, terra } from '@/lib/terra';

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

const chip = 'inline-flex items-center border border-white/25 px-2.5 py-1 text-[11px] text-white/85';

export default async function Podcast({ params }: { params: Promise<{ slug: string }> }) {
  const p = find((await params).slug);
  if (!p) notFound();
  const others = (terra.podcasts as Pod[]).filter((x) => x !== p);
  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          <nav className="mb-3 text-xs text-neutral-500" aria-label="Caminho">
            <Link href="/" className="hover:underline">Início</Link> › <Link href="/podcasts" className="hover:underline">Podcasts</Link>
          </nav>

          <article className="text-white shadow-sm" style={{ background: DARK }}>
            {/* capa, título e resumo */}
            <div className="grid gap-5 p-5 sm:grid-cols-[200px_1fr] sm:p-8">
              {p.image && <img src={p.image} alt="" className="aspect-square w-full max-w-[200px] object-cover shadow-lg" />}
              <div className="min-w-0">
                <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: LIME, color: DARK }}>Podcast</span>
                <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{p.title}</h1>
                {p.excerpt && <p className="mt-3 text-[14px] leading-relaxed text-white/80">{p.excerpt}</p>}
                <div className="mt-3 text-xs font-bold">Por Revista Terra</div>
              </div>
            </div>

            <div className="border-t border-white/15 p-5 sm:p-8">
              {/* leitor dentro da página */}
              {p.audio && <audio controls preload="none" src={p.audio} className="w-full" />}
              <div className="mt-4 flex flex-wrap gap-2">
                {p.episode && <span className={chip}>{p.episode}</span>}
                {p.duration && <span className={chip}>{p.duration}</span>}
                {p.series && <span className={chip}>{p.series}</span>}
              </div>
              {p.spotify && (
                <a href={p.spotify} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-9 items-center px-5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:!bg-[#8DF43A] hover:!text-[#064E3B]" style={{ background: GREEN }}>Ouvir no Spotify ›</a>
              )}

              {(p.aboutTitle || p.about) && (
                <div className="mt-6">
                  {p.aboutTitle && <h2 className="text-lg font-bold">{p.aboutTitle}</h2>}
                  {p.about && <p className="mt-2 text-[14px] leading-relaxed text-white/80">{p.about}</p>}
                </div>
              )}

              {(p.host || p.guest) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {p.host && <div className="border border-white/20 p-4"><div className="text-[11px] text-white/60">Apresentação</div><div className="mt-1 text-sm font-bold">{p.host}</div></div>}
                  {p.guest && <div className="border border-white/20 p-4"><div className="text-[11px] text-white/60">Convidada</div><div className="mt-1 text-sm font-bold">{p.guest}</div></div>}
                </div>
              )}

              <div className="mt-6 border-t border-white/15 pt-4">
                <Link href="/podcasts" className="text-sm font-bold transition-colors hover:text-[#8DF43A]" style={{ color: LIME }}>← Explorar episódios</Link>
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
