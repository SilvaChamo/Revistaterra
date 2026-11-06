import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import RadioPlayer from '@/components/Terra/RadioPlayer';
import { PageTitle, Widget } from '@/components/Terra/Bits';
import RadioGrelha from '@/components/Terra/RadioGrelha';
import { loadRadioSlots } from '@/lib/radio-schedule';

export const metadata = { title: 'Rádio — Revista Terra', robots: { index: false, follow: false } };

export default async function Radio() {
  const { slots } = await loadRadioSlots();
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Rádio' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Rádio +Agro" title="A voz do agro e ambiente" lead="Ouça em directo a rádio da Revista Terra: clima, tecnologia agrária, jovens agricultores e conversas com quem faz o campo." />
          <div className="bg-white p-6 shadow-sm"><RadioPlayer slots={slots} /></div>
          <Widget title="Programação" flush><RadioGrelha slots={slots} semana /></Widget>
        </main>
        <Sidebar only={['tempo', 'newsletter', 'capa']} />
      </div>
    </SiteShell>
  );
}
