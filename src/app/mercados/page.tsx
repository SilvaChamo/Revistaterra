import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { GREEN, terra } from '@/lib/terra';

export const metadata = { title: 'Mercados — Revista Terra', robots: { index: false, follow: false } };

export default function Mercados() {
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Mercados' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Arquivo" title="Mercados" lead="Preços e boletins de mercado por província e produto." />
          <div className="grid gap-3 sm:grid-cols-2">
            {terra.mercados.map((m) => {
              const [prov, prod] = m.title.split(' · ');
              return (
                <a key={m.title} href={m.url} className="flex items-center gap-4 bg-white p-4 shadow-sm hover:shadow-md">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center text-lg font-extrabold text-white" style={{ background: GREEN }}>{prov?.[0]}</span>
                  <div><div className="text-[10px] font-bold uppercase" style={{ color: GREEN }}>{prov}</div><div className="font-semibold">{prod ?? m.title}</div></div>
                </a>
              );
            })}
          </div>
        </main>
        <Sidebar only={['cambio', 'newsletter', 'tempo']} />
      </div>
    </SiteShell>
  );
}
