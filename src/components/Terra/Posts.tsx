import Link from 'next/link';
import { GREEN } from '@/lib/terra';
import { Tag } from './Bits';
import type { Post } from '@/lib/news-data';

export const dataPt = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Maputo' }) : '';

/** Cartão de notícia das listas (arquivo, categorias, "também pode ler"). */
export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/noticias/${encodeURIComponent(post.slug)}`} className="group flex flex-col bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute bottom-0 left-0 p-3"><Tag>{post.category}</Tag></div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[14px] font-semibold leading-snug">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-500">{post.excerpt}</p>}
        <span className="mt-auto pt-3 text-[11px] text-neutral-500">{dataPt(post.date)}</span>
      </div>
    </Link>
  );
}

/** Paginação das listas: anterior, números à volta da página actual e seguinte. */
export function Pager({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (n: number) => string }) {
  if (pages <= 1) return null;
  const numeros = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2);
  const base = 'flex h-9 min-w-9 items-center justify-center px-3 text-xs font-bold';
  return (
    <nav aria-label="Páginas" className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && <Link href={hrefFor(page - 1)} className={`${base} bg-white shadow-sm hover:text-[#9BCB3C]`} style={{ color: GREEN }}>‹ Anterior</Link>}
      {numeros.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - numeros[i - 1] > 1 && <span className="text-neutral-400">…</span>}
          {n === page ? (
            <span aria-current="page" className={`${base} text-white`} style={{ background: GREEN }}>{n}</span>
          ) : (
            <Link href={hrefFor(n)} className={`${base} bg-white shadow-sm hover:text-[#9BCB3C]`} style={{ color: GREEN }}>{n}</Link>
          )}
        </span>
      ))}
      {page < pages && <Link href={hrefFor(page + 1)} className={`${base} bg-white shadow-sm hover:text-[#9BCB3C]`} style={{ color: GREEN }}>Seguinte ›</Link>}
    </nav>
  );
}
