import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import HeroSlider from '@/components/Terra/HeroSlider';
import VideoSpotlight from '@/components/Terra/VideoSpotlight';
import { Heading, NewsCard, Overlay } from '@/components/Terra/Bits';
import RecentNews, { type RecentSet } from '@/components/Terra/RecentNews';
import { GREEN, makePicker, parseDate, terra, type Card } from '@/lib/terra';
import { loadCards, loadHero } from '@/lib/terra-news';
import type { ReactNode } from 'react';
import { getAllPosts } from '@/lib/news-data';
import { getColumnists } from '@/lib/columnists';
import { opinionPosts, sameAuthor } from '@/lib/columnist-utils';
import Columnists from '@/components/Terra/Columnists';
import HomeAd from '@/components/Terra/HomeAd';
import { homeCategories, homeLayout, homeOptions } from '@/lib/home-config';
import { isAdId } from '@/lib/home-sections';
import { label, slugify } from '@/lib/terra-news';

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
  const [layout, categories, options] = await Promise.all([homeLayout.get(), homeCategories.get(), homeOptions.get()]);
  const allCards = (await loadCards()).map((c) => ({ ...c, category: c.category || 'Fora de Campo' }));
  const hero = await loadHero();
  // Colunistas = contas com o nível Colunista; o card mostra o artigo de Opinião mais recente do autor; sem artigos, o colunista não aparece.
  const [columnists, { posts: allPosts }] = await Promise.all([getColumnists(), getAllPosts().catch(() => ({ posts: [] as Awaited<ReturnType<typeof getAllPosts>>['posts'] }))]);
  const opinion = opinionPosts(allPosts);
  const columnistItems = columnists.flatMap((columnist) => {
    const mine = opinion.filter((p) => sameAuthor(p.author, columnist.autor));
    const p = mine[0];
    return p ? [{ columnist, post: { slug: p.slug, title: p.title } }] : [];
  });
  const cards = columnistItems.length > 0
    ? columnistItems
    : terra.authors.map((a) => ({
        columnist: { id: a.author, nome: a.author, handle: '', foto: a.image || '', autor: a.author, facebook: '', instagram: '', linkedin: '', x: '' },
        post: { slug: '', title: a.title, href: a.url },
      }));
  const take = makePicker(allCards);
  const todas = allCards.filter((c) => c.image);
  const recentSets: RecentSet[] = [
    buildSet('todas', 'Todas', [...todas].sort((x, y) => Number(y.category === 'Sociedade' || y.category === 'Mercado') - Number(x.category === 'Sociedade' || x.category === 'Mercado'))),
    buildSet('recentes', 'Recentes', [...todas].sort((x, y) => parseDate(y.date) - parseDate(x.date))),
    buildSet('populares', 'Populares', todas),
  ];
  // Categorias escolhidas no painel: o endereço de cada uma passa ao nome com que as notícias a guardam.
  const prefs = (key: string) => {
    const slugs = categories[key] ?? [];
    return slugs.flatMap((slug) => [...new Set(allCards.filter((c) => slugify(c.category) === slug).map((c) => c.category))]);
  };
  const titleOf = (key: string, fallback: string) => {
    const slug = categories[key]?.[0];
    if (!slug) return fallback;
    return allCards.find((c) => slugify(c.category) === slug)?.category ?? label(slug.replace(/-/g, ' '));
  };
  const env = take(2, prefs('ambiente'));
  const soc = take(3, prefs('sociedade'));
  const out = take(3, prefs('fora'));
  const more = take(6, prefs('mais'));
  const ads = Object.fromEntries(options.ads.map((a) => [a.id, a]));

  // Cada secção da home, pelo nome com que o painel a conhece; a ordem e a zona vêm do painel (Página inicial).
  const sections: Record<string, ReactNode> = {
    destaque: <HeroSlider items={hero.length ? hero : terra.hero} />,
    ultimas: <RecentNews sets={recentSets} />,
    ambiente: (
      <>
        <Heading>Ambiente e Clima</Heading>
        <div className="grid gap-3 sm:grid-cols-2">{env.map((c) => <Overlay key={c.title} c={c} big className="h-[230px]" />)}</div>
      </>
    ),
    videos: (
      <>
        <Heading>Vídeos</Heading>
        <VideoSpotlight />
      </>
    ),
    sociedade: (
      <>
        <Heading>{titleOf('sociedade', 'Sociedade')}</Heading>
        <div className="grid gap-3 md:grid-cols-3">{soc.map((c) => <NewsCard key={c.title} c={c} />)}</div>
      </>
    ),
    fora: (
      <>
        <Heading>{titleOf('fora', 'Fora de Campo')}</Heading>
        <div className="grid gap-3 md:grid-cols-3">{out.map((c) => <Overlay key={c.title} c={c} className="h-[190px]" />)}</div>
      </>
    ),
    // Colunistas do painel; enquanto não houver, mostram-se os autores de opinião de sempre, no mesmo desenho de cartão
    colunistas: (
      <>
        <Heading>{columnistItems.length > 0 ? 'Colunistas' : 'Opinião'}</Heading>
        <Columnists items={cards} />
      </>
    ),
    mais: (
      <>
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
      </>
    ),
  };
  const zone = (ids: string[]) => ids.map((id) => (isAdId(id) ? <HomeAd key={id} image={ads[id]?.image} link={ads[id]?.link} /> : <div key={id}>{sections[id]}</div>));

  return (
    <SiteShell>
      {layout.top.length > 0 && <div className="mb-5">{zone(layout.top)}</div>}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">{zone(layout.main)}</main>
        <Sidebar only={layout.side} ads={ads} />
      </div>
      {layout.bottom.length > 0 && <div className="mt-5">{zone(layout.bottom)}</div>}
    </SiteShell>
  );
}
