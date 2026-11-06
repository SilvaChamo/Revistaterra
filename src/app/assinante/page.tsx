import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import AreaAssinante from '@/components/Terra/AreaAssinante';

export const metadata = { title: 'Área de assinantes — Revista Terra', robots: { index: false, follow: false } };

export default async function Assinante({ searchParams }: { searchParams: Promise<{ plano?: string }> }) {
  const { plano } = await searchParams;
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Área de assinantes' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0"><AreaAssinante planoInicial={typeof plano === 'string' ? plano.slice(0, 40) : undefined} /></main>
        <Sidebar only={['tempo', 'radio', 'capa']} />
      </div>
    </SiteShell>
  );
}
