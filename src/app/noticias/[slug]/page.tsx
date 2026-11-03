import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import NewsGrid from '@/components/Terra/NewsGrid';
import ShareBar from '@/components/Terra/ShareBar';
import CommentsSection from '@/components/Comments/CommentsSection';
import { Heading, Tag } from '@/components/Terra/Bits';
import { GREEN } from '@/lib/terra';
import { cleanContent, label, loadCards, loadPost, longDate, slugify } from '@/lib/terra-news';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await loadPost((await params).slug);
  return { title: p ? `${p.title} — Revista Terra` : 'Notícia — Revista Terra', description: p?.summary, robots: { index: false, follow: false } };
}

export default async function Artigo({ params }: { params: Promise<{ slug: string }> }) {
  const post = await loadPost((await params).slug);
  if (!post) notFound();
  const cat = label(post.category);
  // O resumo só se mostra se o texto não começar já por ele (as notícias do WordPress repetem-no)
  const plain = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const head = plain(post.summary).slice(0, 40).toLowerCase();
  const showSummary = !!post.summary && !plain(post.content).toLowerCase().startsWith(head);
  const related = (await loadCards()).filter((c) => c.category === cat && c.url !== `/noticias/${post.slug}`).slice(0, 3);
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Notícias', href: '/noticias' }, { label: cat, href: `/categoria/${slugify(cat)}` }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          <article className="bg-white shadow-sm">
            {post.image_url && <img src={post.image_url} alt="" className="h-[240px] w-full object-cover sm:h-[400px]" />}
            <div className="border-t-4 p-5 sm:p-8" style={{ borderColor: GREEN }}>
              <Link href={`/categoria/${slugify(cat)}`}><Tag>{cat}</Tag></Link>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight text-[#064E3B] sm:text-[34px]">{post.title}</h1>
              <div className="mt-3 text-xs text-neutral-500">Publicado a {longDate(post.date)} · {post.author_name}</div>
              {showSummary && <p className="mt-5 text-[17px] font-semibold leading-relaxed text-neutral-700">{post.summary}</p>}
              <div className="terra-prose mt-6" dangerouslySetInnerHTML={{ __html: cleanContent(post.content) }} />
              <ShareBar title={post.title} />
              <CommentsSection slug={post.slug} title={post.title} />
            </div>
          </article>
          {related.length > 0 && (
            <>
              <Heading>Notícias relacionadas</Heading>
              <NewsGrid cards={related} />
            </>
          )}
        </main>
        <Sidebar only={['tempo', 'radio', 'lidas', 'recentes']} />
      </div>
    </SiteShell>
  );
}
