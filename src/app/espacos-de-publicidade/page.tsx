import type { Metadata } from 'next';
import Link from 'next/link';
import SiteShell from '@/components/Terra/SiteShell';
import { PageTitle } from '@/components/Terra/Bits';
import AdSpacesPopup from '@/components/Newsletter/AdSpacesPopup';
import PageProtection from '@/components/Newsletter/PageProtection';
import { loadAds } from '@/lib/newsletter-ads';

export const metadata: Metadata = { title: 'Espaços de publicidade — Revista Terra', robots: { index: false, follow: false } };

/** Página do site com os espaços de publicidade: os da newsletter (por omissão) e, no botão do cabeçalho, os do site. */
export default async function PublicidadePage({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const site = (await searchParams).ver === 'site';
  const { prices } = await loadAds();
  const link = (
    <Link href={site ? '/espacos-de-publicidade' : '/espacos-de-publicidade?ver=site'} className="flex h-9 items-center justify-center border border-neutral-300 bg-white px-4 text-[13px] text-[#1d2327] hover:text-[#047857]">
      {site ? 'Publicidade na newsletter' : 'Publicidade no site'}
    </Link>
  );
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Espaços de publicidade' }]}>
      <PageProtection />
      <main className="space-y-5">
        <PageTitle kicker="Publicidade" title="Espaços de publicidade" lead="Onde a sua marca pode aparecer na newsletter e no site da Revista Terra, com a medida e o custo de cada espaço." />
        <div className="mx-auto w-full max-w-[760px] shadow-sm">
          <AdSpacesPopup prices={prices} headerLink={link} view={site ? 'site' : 'newsletter'} />
        </div>
      </main>
    </SiteShell>
  );
}
