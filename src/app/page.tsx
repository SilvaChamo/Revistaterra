import data from '@/data/terra.json';
import HeroSlider from '@/components/Terra/HeroSlider';

export const metadata = {
  title: 'Revista Terra — A Voz do Agro e Ambiente (proposta de layout)',
  description: 'Proposta de redesenho da Revista Terra',
  robots: { index: false, follow: false },
};

type Card = { category: string; title: string; excerpt: string; url: string; image: string | null; date?: string };

const GREEN = '#047857';
const DARK = '#064E3B';
const all: Card[] = data.cards.map((c) => ({ ...c, category: c.category || 'Fora de Campo' }));
const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide text-white" style={{ background: GREEN }}>{children}</span>
);

const Overlay = ({ c, className = '', big = false }: { c: Card; className?: string; big?: boolean }) => (
  <a href={c.url} className={`group relative block overflow-hidden bg-black ${className}`}>
    {c.image && <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-4">
      <Tag>{c.category}</Tag>
      <h3 className={`mt-2 font-semibold leading-snug text-white ${big ? 'text-xl sm:text-2xl' : 'text-sm'}`}>{c.title}</h3>
    </div>
  </a>
);

const Heading = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-3 mt-8 flex items-end justify-between">
    <h2 className="border-b-2 text-[15px] font-bold uppercase" style={{ color: GREEN, borderColor: GREEN }}>{children}</h2>
    <a href="#" className="text-[11px] font-medium uppercase" style={{ color: GREEN }}>Ver tudo ›</a>
  </div>
);

const Widget = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5 bg-white shadow-sm">
    <h3 className="border-b border-neutral-200 px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-600">{title}</h3>
    <div className="p-5">{children}</div>
  </div>
);

export default function Home() {
  const used = new Set<string>();
  /** Escolhe notícias ainda não usadas, preferindo as categorias indicadas. */
  const take = (n: number, prefer: string[] = []): Card[] => {
    const out: Card[] = [];
    const pick = (pred: (c: Card) => boolean) => {
      for (const c of all) if (out.length < n && !used.has(c.title) && pred(c)) { used.add(c.title); out.push(c); }
    };
    if (prefer.length) pick((c) => prefer.includes(c.category));
    pick(() => true);
    for (let i = 0; out.length < n; i++) out.push(all[i % all.length]);
    return out;
  };
  const radio = data.radio.filter((r, i, arr) => arr.findIndex((x) => x.time === r.time && x.show === r.show) === i);
  const staff = take(4, ['Agricultura', 'Mercado']);
  const biz = take(4, ['Mercado', 'Economia', 'Agricultura']);
  const env = take(2, ['Meio Ambiente', 'Tempo', 'Clima']);
  const soc = take(3, ['Sociedade']);
  const out = take(3, ['Fora de Campo']);
  const trending = all.slice(0, 5);
  const recent = all.slice(5, 9);
  const nav = data.menu;

  return (
    <div className="min-h-screen bg-[#ececec] text-[#222]" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="mx-auto max-w-[1200px] px-3 py-3">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <a href="#" className="text-3xl font-extrabold tracking-tight" style={{ color: DARK }}>TERRA<span style={{ color: GREEN }}>online</span></a>
            <span className="hidden text-xs text-neutral-500 sm:block">A Voz do Agro e Ambiente</span>
            <span className="text-xs uppercase text-neutral-500">Pesquisar</span>
          </div>
          <nav className="flex flex-wrap" style={{ background: GREEN }} aria-label="Menu principal">
            {nav.map((m, n) => (
              <a key={m} href="#" className={`px-4 py-3 text-xs font-bold uppercase text-white hover:bg-black/20 ${n === 0 ? 'bg-black/20' : ''}`}>{m}</a>
            ))}
          </nav>
          <div className="flex gap-6 overflow-x-auto border-t border-neutral-200 px-5 py-2 text-[11px] text-neutral-600">
            {data.market.map((m) => (
              <span key={m.pair} className="whitespace-nowrap"><b>{m.pair}</b> {m.price} <b style={{ color: m.change.startsWith('-') ? '#E22F57' : '#039A67' }}>{m.change}</b></span>
            ))}
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <main className="min-w-0">
            <HeroSlider items={data.hero} />

            <Heading>Destaques</Heading>
            <div className="grid gap-3 md:grid-cols-[1.45fr_1fr]">
              <div className="flex flex-col">
                <Overlay c={staff[0]} big className="h-[260px]" />
                {staff[0].excerpt && <div className="flex-1 p-4 text-sm text-white" style={{ background: GREEN }}>{staff[0].excerpt}</div>}
              </div>
              <div className="grid gap-3">
                {staff.slice(1).map((c) => <Overlay key={c.title} c={c} className="h-[150px]" />)}
              </div>
            </div>

            <Heading>Mercado e Economia</Heading>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="bg-white">
                <Overlay c={biz[0]} big className="h-[200px]" />
                {biz[0].excerpt && <p className="p-4 text-sm text-neutral-500">{biz[0].excerpt}</p>}
              </div>
              <div className="grid gap-3">
                {biz.slice(1).map((c) => (
                  <a key={c.title} href={c.url} className="bg-white p-4 hover:shadow-md">
                    <span className="text-[10px] font-bold uppercase" style={{ color: GREEN }}>{c.category}</span>
                    <h3 className="mt-1 text-sm font-semibold leading-snug">{c.title}</h3>
                  </a>
                ))}
              </div>
            </div>

            <Heading>Ambiente e Clima</Heading>
            <div className="grid gap-3 sm:grid-cols-2">
              {env.map((c) => <Overlay key={c.title} c={c} big className="h-[230px]" />)}
            </div>

            <Heading>Sociedade</Heading>
            <div className="grid gap-3 md:grid-cols-3">
              {soc.map((c) => (
                <div key={c.title} className="bg-white">
                  <Overlay c={c} className="h-[170px]" />
                  <p className="line-clamp-4 p-4 text-xs text-neutral-500">{c.excerpt}</p>
                  <div className="border-t border-neutral-100 px-4 py-3 text-[11px] text-neutral-500">{c.date || 'Revista Terra'}</div>
                </div>
              ))}
            </div>

            <Heading>Fora de Campo</Heading>
            <div className="grid gap-3 md:grid-cols-3">
              {out.map((c) => <Overlay key={c.title} c={c} className="h-[190px]" />)}
            </div>

            {data.authors.length > 0 && (
              <>
                <Heading>Opinião</Heading>
                <div className="grid gap-3 md:grid-cols-3">
                  {data.authors.map((a) => (
                    <a key={a.title} href={a.url} className="flex gap-3 bg-white p-4 hover:shadow-md">
                      {a.image && <img src={a.image} alt={a.author} className="h-14 w-14 shrink-0 rounded-full object-cover" />}
                      <div>
                        <span className="text-[10px] font-bold uppercase" style={{ color: GREEN }}>{a.author}</span>
                        <h3 className="mt-1 text-sm font-semibold leading-snug">“{a.title}”</h3>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </main>

          <aside>
            <Widget title="Newsletter">
              <p className="mb-3 text-sm">Receba o Agro no E-mail: notícias e análises na sua caixa de entrada.</p>
              <div className="flex">
                <input placeholder="O seu e-mail" className="min-w-0 flex-1 border border-neutral-300 px-3 py-2 text-xs" />
                <button className="px-4 text-xs font-bold uppercase text-white" style={{ background: GREEN }}>Subscrever</button>
              </div>
            </Widget>

            {data.cover && (
              <div className="mb-5 bg-white shadow-sm">
                <h3 className="border-b border-neutral-200 px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-600">Edição actual · nº {data.cover.issue}</h3>
                <a href={data.cover.url} className="block p-5">
                  {data.cover.image && <img src={data.cover.image} alt={data.cover.title} className="w-full" />}
                  <span className="mt-3 block text-center text-xs font-bold uppercase" style={{ color: GREEN }}>Ler edição ↗</span>
                </a>
              </div>
            )}

            <Widget title="Mais lidas">
              <ol>
                {trending.map((c, n) => (
                  <li key={c.title} className="flex gap-3 border-b border-neutral-100 py-3 text-[13px] last:border-0">
                    <b className="text-lg">{n + 1}.</b>
                    <a href={c.url} className="hover:underline">{c.title}</a>
                  </li>
                ))}
              </ol>
            </Widget>

            <Widget title="Rádio +Agro · Programação">
              <ul className="text-[13px]">
                {radio.slice(0, 6).map((r) => (
                  <li key={r.time + r.show} className="flex gap-3 border-b border-neutral-100 py-2 last:border-0">
                    <b className="w-12 shrink-0" style={{ color: GREEN }}>{r.time}</b><span>{r.show}</span>
                  </li>
                ))}
              </ul>
            </Widget>

            <Widget title="Recentes">
              <ul>
                {recent.map((c) => (
                  <li key={c.title} className="flex gap-3 border-b border-neutral-100 py-3 last:border-0">
                    {c.image && <img src={c.image} alt="" className="h-12 w-12 shrink-0 object-cover" />}
                    <a href={c.url} className="text-[13px] font-semibold leading-snug hover:underline">{c.title}</a>
                  </li>
                ))}
              </ul>
            </Widget>
          </aside>
        </div>

        <footer className="mt-8 px-5 py-6 text-center text-xs text-white" style={{ background: DARK }}>
          Proposta de redesign · conteúdo © Revista Terra · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
