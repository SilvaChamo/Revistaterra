import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Mail, Share2 } from 'lucide-react';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { Heading, Tag } from '@/components/Terra/Bits';
import { PostCard, dataPt } from '@/components/Terra/Posts';
import PrintButton from '@/components/Site/PrintButton';
import CommentsSection from '@/components/Comments/CommentsSection';
import { getAllPosts, getPost, getRelated } from '@/lib/news-data';
import { shareNetworks } from '@/lib/share';
import { DARK, GREEN, enderecoAntigo } from '@/lib/terra';

export const revalidate = 60;

/** Origem usada nos links de partilha. Fixa (sem ler os cabeçalhos do pedido) para a página poder ficar em cache. */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://revistaterra.co.mz').replace(/\/$/, '');

/** As notícias mais recentes ficam geradas no deploy; as restantes geram-se no primeiro acesso e ficam em cache. */
export async function generateStaticParams() {
  const { posts } = await getAllPosts();
  return posts.slice(0, 20).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) return { title: 'Notícia não encontrada — Revista Terra' };
  return {
    title: `${post.title} — Revista Terra`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.image ? [post.image] : [] },
  };
}

/** Modelo único de leitura: serve todas as notícias (/noticias/<slug>). */
export default async function PaginaDeLeitura({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const post = await getPost(slug);
  if (!post) {
    // Notícia da home que ainda não foi importada para a base de dados (scripts/importar-noticias-terra.js):
    // até lá abre no site antigo, em vez de dar 404.
    const antigo = enderecoAntigo(slug);
    if (antigo) redirect(antigo);
    notFound();
  }

  const related = await getRelated(post, 4);
  const url = encodeURIComponent(`${SITE_URL}/noticias/${encodeURIComponent(post.slug)}`);
  const text = encodeURIComponent(post.title);
  const shares = shareNetworks(url, text);

  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          <article className="bg-white shadow-sm">
            {post.image && (
              <div className="border-b-[6px]" style={{ borderColor: GREEN }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image} alt={post.title} className="max-h-[420px] w-full object-cover" />
              </div>
            )}
            <div className="px-5 pb-8 pt-6 sm:px-7">
              <nav aria-label="Caminho" className="mb-3 text-[11px] text-neutral-500">
                <Link href="/" className="hover:underline" style={{ color: GREEN }}>Início</Link> ›{' '}
                <Link href="/noticias" className="hover:underline" style={{ color: GREEN }}>Notícias</Link> ›{' '}
                <Link href={`/categoria/${post.categorySlug}`} className="hover:underline" style={{ color: GREEN }}>{post.category}</Link>
              </nav>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/categoria/${post.categorySlug}`}><Tag>{post.category}</Tag></Link>
                {post.extraCategories.map((c) => (
                  <Link key={c.slug} href={`/categoria/${c.slug}`}><Tag>{c.label}</Tag></Link>
                ))}
              </div>
              <h1 className="mt-3 text-[26px] font-extrabold leading-tight sm:text-[32px]" style={{ color: DARK }}>{post.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-neutral-200 pb-3 text-[13px] text-neutral-600">
                <span>{post.edited ? 'Editado a' : 'Publicado a'} {dataPt(post.edited || post.date)}</span>
                <span>Por {post.author}</span>
              </div>

              <div
                className="blog-details mt-6 text-[15px] leading-7 text-neutral-600 [&_a]:text-[#047857] [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-8">
                <h3 className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-[16px] font-bold uppercase" style={{ color: GREEN }}>
                  <Share2 className="h-5 w-5" />
                  Partilhar
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {shares.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Partilhar no ${s.label}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${s.bg} text-white hover:opacity-90`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d={s.icon} />
                      </svg>
                    </a>
                  ))}
                  <a
                    href={`mailto:?subject=${text}&body=${url}`}
                    aria-label="Partilhar por email"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ea4335] text-white hover:opacity-90"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  <PrintButton />
                </div>
              </div>

              <CommentsSection slug={post.slug} title={post.title} />
            </div>
          </article>

          {related.length > 0 && (
            <>
              <Heading>Também pode ler</Heading>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{related.map((p) => <PostCard key={p.slug} post={p} />)}</div>
            </>
          )}
        </main>
        <Sidebar only={['tempo', 'radio', 'cambio']} />
      </div>
    </SiteShell>
  );
}
