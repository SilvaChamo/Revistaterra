import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import Newsletter from '@/components/Terra/Newsletter';
import { PageTitle, Widget } from '@/components/Terra/Bits';

export const metadata = { title: 'Newsletter — Revista Terra', robots: { index: false, follow: false } };

export default function NewsletterPage() {
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Newsletter' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Newsletter" title="Receba o Agro no E-mail" lead="O resumo das notícias, análises e conteúdos agro-ambientais da Revista Terra, directamente na sua caixa de correio. Gratuito, e pode sair quando quiser." />
          <Widget title="Subscrever"><div className="max-w-xl"><Newsletter /></div></Widget>
        </main>
        <Sidebar only={['tempo', 'capa']} />
      </div>
    </SiteShell>
  );
}
