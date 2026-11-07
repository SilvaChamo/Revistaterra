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

function Socials({ c, className = '' }: { c: Columnist; className?: string }) {
  const list = SOCIALS.filter((s) => c[s.key]);
  if (list.length === 0) return null;
  return (
    <div className={`items-center gap-1.5 ${className}`}>
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
 * (uma no telemóvel). A foto redonda sobrepõe-se ao cartão escuro com o nome e o @; por baixo vêm o título do
 * artigo de Opinião e o botão «Ler artigo». No telemóvel as redes sociais passam para junto do botão.
 */
export default function Columnists({ items }: { items: ColumnistItem[] }) {
  return (
    <div className="grid gap-x-3 gap-y-8 md:grid-cols-2">
      {items.map(({ columnist: c, post }) => (
        <article key={c.id} className="min-w-0 pt-10 sm:pt-12">
          <div className="relative bg-white px-4 pb-4 pt-11 shadow-sm sm:pl-[88px] sm:pt-12">
            {/* Cartão do nome: nasce por baixo da foto e passa a linha de cima do cartão. */}
            <div className="absolute -top-6 left-[56px] right-3 z-10 flex items-center gap-3 sm:-top-7 sm:left-[84px]">
              <div className="flex h-10 min-w-0 flex-col justify-center pl-[46px] pr-4 sm:h-12 sm:pl-[46px]" style={{ background: DARK }}>
                <div className="truncate text-[13px] font-semibold leading-tight text-white sm:text-sm">{c.nome}</div>
                {c.handle && <div className="truncate text-[10px] leading-tight text-white/70">@{c.handle}</div>}
              </div>
              <Socials c={c} className="hidden sm:flex" />
            </div>
            {/* Foto: dentro do cartão, afastada da esquerda, sobre o cartão do nome. */}
            {c.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.foto} alt={c.nome} loading="lazy" decoding="async" className="absolute -top-10 left-3 z-20 h-[72px] w-[72px] rounded-full border-2 object-cover ring-4 ring-[#dcebc0] sm:-top-12 sm:left-6 sm:h-[88px] sm:w-[88px]" style={{ borderColor: DARK }} />
            ) : (
              <span aria-hidden className="absolute -top-10 left-3 z-20 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 bg-[#eef5e1] text-2xl ring-4 ring-[#dcebc0] sm:-top-12 sm:left-6 sm:h-[88px] sm:w-[88px]" style={{ borderColor: DARK, color: DARK }}>
                {c.nome.charAt(0).toUpperCase()}
              </span>
            )}
            <a href={`/noticias/${post.slug}`} className="block">
              <h3 className="line-clamp-3 text-[13px] font-bold leading-snug text-neutral-900 hover:text-[#047857]">{post.title}</h3>
            </a>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a href={`/noticias/${post.slug}`} className="inline-flex h-8 items-center px-4 text-[11px] font-medium uppercase tracking-wide text-white transition-colors hover:bg-[#064E3B]" style={{ background: GREEN }}>
                Ler artigo
              </a>
              <Socials c={c} className="flex sm:hidden" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
