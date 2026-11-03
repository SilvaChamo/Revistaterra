import Link from 'next/link';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import VideoSpotlight from '@/components/Terra/VideoSpotlight';
import { PageTitle } from '@/components/Terra/Bits';
import { terra } from '@/lib/terra';

export const metadata = { title: 'Podcasts — Revista Terra', robots: { index: false, follow: false } };

export default function Podcasts() {
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Podcasts' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Mais Agro" title="Podcasts" lead="Conversas e programas da Revista Terra para ouvir e ver quando quiser." />
          <div className="grid gap-4 md:grid-cols-2">
            {terra.podcasts.map((p) => (
              <Link key={p.title} href={`/podcasts/${p.url.replace(/\/+$/, '').split('/').pop()}`} className="group block bg-white shadow-sm hover:shadow-md">
                {p.image && <img src={p.image} alt="" className="aspect-video w-full object-cover" />}
                <div className="p-4"><span className="text-[10px] font-bold uppercase text-[#047857]">Podcast</span><h3 className="mt-1 font-bold group-hover:underline">{p.title}</h3></div>
              </Link>
            ))}
          </div>
          <VideoSpotlight />
        </main>
        <Sidebar only={['radio', 'newsletter', 'capa']} />
      </div>
    </SiteShell>
  );
}
