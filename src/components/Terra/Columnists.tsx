import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { DARK, GREEN } from '@/lib/terra';
import type { Columnist } from '@/lib/columnists';

/** `href` só se o artigo não for do próprio site (por defeito abre /noticias/<slug>). */
export type ColumnistItem = { columnist: Columnist; post: { slug: string; title: string; href?: string; summary?: string } };

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'x', label: 'X', Icon: Twitter },
] as const;

function Socials({ c }: { c: Columnist }) {
  const list = SOCIALS.filter((s) => c[s.key]);
  if (list.length === 0) return null;
  return (
    <div className="mt-2 flex items-center justify-center gap-1.5">
      {list.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={c[key]}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label={`${label} de ${c.nome}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-[#047857] hover:bg-[#047857] hover:text-white"
        >
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
}

/**
 * Colunistas da home, no estilo dos cartões da Terra (fundo branco, sombra leve, cantos rectos): duas colunas
 * (uma no telemóvel). O avatar fica centrado e sai por cima do cartão; por baixo vêm o nome, o @, as redes sociais,
 * o título do artigo de Opinião e o botão «Ler artigo».
 */
export default function Columnists({ items }: { items: ColumnistItem[] }) {
  return (
    <div className={`grid gap-4 pt-12 ${items.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : items.length % 3 === 0 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
      {items.map(({ columnist: c, post }) => {
        const href = post.href ?? `/noticias/${post.slug}`;
        return (
          <article key={c.id || c.nome} className="relative flex min-w-0 flex-col items-center bg-white p-5 pt-14 text-center shadow-sm">
            {/* Avatar centrado com anel */}
            {c.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.foto} alt={c.nome} loading="lazy" decoding="async" className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] object-cover shadow-md ring-4 ring-[#eaf3ed]" style={{ borderColor: GREEN }} />
            ) : (
              <span aria-hidden className="absolute left-1/2 top-0 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] bg-[#eef5e1] text-2xl shadow-md ring-4 ring-[#eaf3ed]" style={{ borderColor: GREEN, color: DARK }}>
                {c.nome.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="w-full min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#047857]">{c.nome}</span>
            </div>
            <Socials c={c} />
            <a href={href} className="mt-2 block w-full">
              <h3 className="line-clamp-3 text-[13px] font-bold leading-snug text-neutral-900 hover:text-[#047857]">{post.title}</h3>
            </a>
            {post.summary && (
              <p className="mt-2 line-clamp-4 text-[11px] leading-relaxed text-neutral-500">{post.summary}</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
