import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import HeroSlider from '@/components/Terra/HeroSlider';
import VideoSpotlight from '@/components/Terra/VideoSpotlight';
import { Heading, Overlay } from '@/components/Terra/Bits';
import RecentNews, { type RecentSet } from '@/components/Terra/RecentNews';
import { GREEN, makePicker, parseDate, terra, type Card } from '@/lib/terra';
import { loadCards, loadHero } from '@/lib/terra-news';

/** Até 9 notícias para o carrossel, na ordem do separador. */
function buildSet(id: string, label: string, ordered: Card[]): RecentSet {
  const used = new Set<string>();
  const take = (pred: (c: Card) => boolean, n: number) => {
    const out: Card[] = [];
    for (const c of ordered) if (out.length < n && !used.has(c.title) && pred(c)) { used.add(c.title); out.push(c); }
    return out;
  };
  return { id, label, feature: take(() => true, 9) };
}

export const metadata = {
  title: 'Revista Terra — A Voz do Agro e Ambiente (proposta de layout)',
  description: 'Proposta de redesenho da Revista Terra',
  robots: { index: false, follow: false },
};

export const revalidate = 60; // o que se edita no painel aparece em ~1 minuto

export default async function Home() {
  const allCards = (await loadCards()).map((c) => ({ ...c, category: c.category || 'Fora de Campo' }));
  const hero = await loadHero();
  const take = makePicker(allCards);
  const todas = allCards.filter((c) => c.image);
  const recentSets: RecentSet[] = [
    buildSet('todas', 'Todas', [...todas].sort((x, y) => Number(y.category === 'Sociedade' || y.category === 'Mercado') - Number(x.category === 'Sociedade' || x.category === 'Mercado'))),
    buildSet('recentes', 'Recentes', [...todas].sort((x, y) => parseDate(y.date) - parseDate(x.date))),
    buildSet('populares', 'Populares', todas),
  ];
  const env = take(2, ['Meio Ambiente', 'Tempo', 'Clima']);
  const soc = take(3, ['Sociedade']);
  const out = take(3, ['Fora de Campo']);
  const more = take(6, ['Pesca', 'Energia', 'Internacional', 'Política', 'Economia']);

  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          <HeroSlider items={hero.length ? hero : terra.hero} />

          <RecentNews sets={recentSets} />

          <Heading>Ambiente e Clima</Heading>
          <div className="grid gap-3 sm:grid-cols-2">{env.map((c) => <Overlay key={c.title} c={c} big className="h-[230px]" />)}</div>

          <Heading>Vídeos</Heading>
          <VideoSpotlight />

          <Heading>Sociedade</Heading>
          <div className="grid gap-3 md:grid-cols-3">
            {soc.map((c) => (
              <div key={c.title} className="bg-white">
                <Overlay c={c} className="h-[170px]" />
                {c.excerpt && <p className="p-4 text-xs text-neutral-500">{c.excerpt}</p>}
                <div className="border-t border-neutral-100 px-4 py-3 text-[11px] text-neutral-500">{c.date || 'Revista Terra'}</div>
              </div>
            ))}
          </div>

          <Heading>Fora de Campo</Heading>
          <div className="grid gap-3 md:grid-cols-3">{out.map((c) => <Overlay key={c.title} c={c} className="h-[190px]" />)}</div>

          <Heading>Opinião</Heading>
          <div className="grid gap-3 md:grid-cols-3">
            {terra.authors.map((a) => (
              <a key={a.title} href={a.url} className="flex gap-3 bg-white p-4 hover:shadow-md">
                {a.image && <img src={a.image} alt={a.author} className="h-14 w-14 shrink-0 rounded-full object-cover" />}
                <div>
                  <span className="text-[10px] font-bold uppercase" style={{ color: GREEN }}>{a.author}</span>
                  <h3 className="mt-1 text-sm font-semibold leading-snug">“{a.title}”</h3>
                </div>
              </a>
            ))}
          </div>

          <Heading>Mais notícias</Heading>
          <div className="grid gap-3 sm:grid-cols-2">
            {more.map((c) => (
              <a key={c.title} href={c.url} className="flex overflow-hidden bg-white hover:shadow-md">
                {/* a foto preenche o cartão de ponta a ponta (sem margens à volta) */}
                {c.image && <img src={c.image} alt="" loading="lazy" className="min-h-20 w-28 shrink-0 self-stretch object-cover" />}
                <div className="p-3">
                  <span className="text-[10px] font-bold uppercase" style={{ color: GREEN }}>{c.category}{c.date ? ` · ${c.date}` : ''}</span>
                  <h3 className="mt-1 text-[13px] font-semibold leading-snug">{c.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </main>
        <Sidebar />
      </div>
    </SiteShell>
  );
}
