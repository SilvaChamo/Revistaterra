import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { GREEN, terra } from '@/lib/terra';

export const metadata = { title: 'Revista Digital — Revista Terra', robots: { index: false, follow: false } };

const nice = (t: string) => t.replace(/\.(jpg|png)$/i, '').replace(/\b(Final|ED)\b/g, '').replace(/\s+/g, ' ').trim();

export default function RevistaDigital() {
  const cur = terra.cover;
  const eds = terra.editions.filter((e) => e.image && e.image !== cur?.image);
  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Revista Digital" title="Todas as edições da Revista Terra" lead="Leia ou descarregue as edições mensais em PDF, nos formatos digital e impresso." />
          {cur && (
            <div className="grid overflow-hidden bg-white shadow-sm sm:grid-cols-[220px_1fr]">
              {cur.image && <img src={cur.image} alt={cur.title} className="h-full w-full object-cover" />}
              <div className="self-center p-6">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GREEN }}>Edição actual · nº {cur.issue}</span>
                <h2 className="mt-2 text-2xl font-extrabold">{cur.title}</h2>
                <a href={cur.url} className="mt-4 inline-block px-5 py-3 text-xs font-bold uppercase text-white" style={{ background: GREEN }}>Ler edição ↗</a>
              </div>
            </div>
          )}
          <h2 className="border-b-2 pb-1 text-[15px] font-bold uppercase" style={{ color: GREEN, borderColor: GREEN }}>Edições anteriores</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {eds.map((e) => (
              <a key={e.pdf} href={e.pdf} className="group block bg-white shadow-sm hover:shadow-md">
                <img src={e.image!} alt={e.title} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                <span className="block p-2 text-[11px] font-semibold leading-snug group-hover:underline">{nice(e.title)}</span>
              </a>
            ))}
          </div>
        </main>
        <Sidebar only={['newsletter', 'radio', 'tempo']} />
      </div>
    </SiteShell>
  );
}
