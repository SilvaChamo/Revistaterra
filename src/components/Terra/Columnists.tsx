import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { DARK, GREEN } from '@/lib/terra';
import type { Columnist } from '@/lib/columnists';

export type ColumnistItem = { columnist: Columnist; post: { slug: string; title: string } };

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
    <div className="grid gap-x-3 gap-y-12 pt-12 md:grid-cols-2">
      {items.map(({ columnist: c, post }) => (
        <article key={c.id} className="relative flex min-w-0 flex-col items-center bg-white px-4 pb-5 pt-14 text-center shadow-sm">
          {/* Avatar centrado, metade fora do cartão */}
          {c.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.foto} alt={c.nome} loading="lazy" decoding="async" className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] object-cover shadow-md ring-4 ring-white" style={{ borderColor: GREEN }} />
          ) : (
            <span aria-hidden className="absolute left-1/2 top-0 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] bg-[#eef5e1] text-3xl shadow-md ring-4 ring-white" style={{ borderColor: GREEN, color: DARK }}>
              {c.nome.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="w-full min-w-0">
            <div className="truncate text-[13px] font-bold" style={{ color: DARK }}>{c.nome}</div>
            {c.handle && <div className="truncate text-[10px] text-neutral-500">@{c.handle}</div>}
          </div>
          <Socials c={c} />
          <a href={`/noticias/${post.slug}`} className="mt-3 block w-full">
            <h3 className="line-clamp-3 text-[12px] font-semibold leading-snug text-neutral-800 hover:text-[#047857]">{post.title}</h3>
          </a>
          <a href={`/noticias/${post.slug}`} className="mt-3 inline-flex h-8 items-center px-4 text-[10px] font-medium uppercase tracking-wide text-white transition-colors hover:bg-[#064E3B]" style={{ background: GREEN }}>
            Ler artigo
          </a>
        </article>
      ))}
    </div>
  );
}
