import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import RadioPlayer from '@/components/Terra/RadioPlayer';
import { PageTitle, Widget } from '@/components/Terra/Bits';
import { GREEN, terra } from '@/lib/terra';

export const metadata = { title: 'Rádio — Revista Terra', robots: { index: false, follow: false } };

export default function Radio() {
  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Rádio +Agro" title="A voz do agro e ambiente" lead="Ouça em directo a rádio da Revista Terra: clima, tecnologia agrária, jovens agricultores e conversas com quem faz o campo." />
          <div className="bg-white p-6 shadow-sm"><RadioPlayer /></div>
          <Widget title="Hoje na rádio" flush>
            <ul>
              {terra.radioFull.map((r) => (
                <li key={r.time + r.show} className="flex items-center gap-4 border-b border-neutral-100 px-5 py-4 last:border-0">
                  <b className="w-28 shrink-0 text-sm" style={{ color: GREEN }}>{r.time} – {r.end}</b>
                  <div><div className="font-bold">{r.show}</div><div className="text-xs text-neutral-500">Radio +Agro</div></div>
                </li>
              ))}
            </ul>
          </Widget>
        </main>
        <Sidebar only={['tempo', 'newsletter', 'capa']} />
      </div>
    </SiteShell>
  );
}
