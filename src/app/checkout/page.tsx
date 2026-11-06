import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import Checkout from '@/components/Terra/Checkout';

export const metadata = { title: 'Finalizar subscrição — Revista Terra', robots: { index: false, follow: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plano?: string }> }) {
  const { plano } = await searchParams;
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Planos', href: '/planos' }, { label: 'Finalizar subscrição' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0"><Checkout planoId={typeof plano === 'string' ? plano.slice(0, 40) : ''} /></main>
        <Sidebar only={['tempo', 'capa']} />
      </div>
    </SiteShell>
  );
}
