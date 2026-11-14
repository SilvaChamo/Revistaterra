import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DARK, GREEN, LIME, catSlug, categoryColor } from '@/lib/terra';
import type { Card } from '@/lib/terra';
import ShareLink from './ShareLink';

/** Etiqueta das notícias exclusivas para assinantes. */
export const ExclusivaTag = () => (
  <span className="inline-block whitespace-nowrap px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide text-white" style={{ background: GREEN }}>★ Exclusiva</span>
);

export const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block whitespace-nowrap px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide" style={{ background: categoryColor(String(children)).bg, color: categoryColor(String(children)).fg }}>{children}</span>
);

/** A letra do título acompanha o tamanho do cartão (cqmin = 1% do lado menor), em vez de ter um tamanho fixo. */
export const Overlay = ({ c, className = '', big = false, desc = false }: { c: Card; className?: string; big?: boolean; desc?: boolean }) => (
  <a href={c.url} className={`group relative block overflow-hidden bg-black ${className}`} style={{ containerType: 'size' }}>
    {c.image && <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
    <div className={`absolute inset-x-0 bottom-0 ${desc ? 'p-5' : 'p-[3.2cqmin]'}`}>
      <div className="flex flex-wrap items-center gap-1"><Tag>{c.category}</Tag>{c.exclusive && <ExclusivaTag />}</div>
      <h3 className="mt-[1.6cqmin] font-semibold leading-snug text-white" style={{ fontSize: big ? 'clamp(14px, 6.6cqmin, 17px)' : 'clamp(13px, 7.6cqmin, 15px)' }}>{c.title}</h3>
      {desc && c.excerpt && <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-white/85">{c.excerpt}</p>}
    </div>
  </a>
);

/**
 * Cartão de notícia com o texto por baixo da foto: etiqueta, título (até 3 linhas),
 * linha separadora e, por baixo, a data à esquerda e o ícone de partilha à direita.
 * Todo o espaço interior é 16px (p-4 / gap-3), como no carrossel das Notícias recentes.
 */
export const NewsCard = ({ c, imageClassName = 'h-[170px]' }: { c: Card; imageClassName?: string }) => (
  <article className="group flex h-full flex-col bg-white shadow-sm">
    <a href={c.url} className={`relative block shrink-0 overflow-hidden bg-black ${imageClassName}`}>
      {c.image && <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
    </a>
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-1"><Link href={`/categoria/${catSlug(c.category)}`} title={`Ver notícias de ${c.category}`} className="transition-opacity hover:opacity-80"><Tag>{c.category}</Tag></Link>{c.exclusive && <ExclusivaTag />}</div>
      {/* só etiqueta, título (até 3 linhas), data e partilha; na mesma linha da grelha os cartões têm a mesma altura. */}
      <h3 className="line-clamp-3 text-[15px] font-bold leading-snug text-neutral-900"><a href={c.url} className="hover:text-[#047857]">{c.title}</a></h3>
    </div>
    <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-[11px] text-neutral-500">
      <span>{c.date || 'Revista Terra'}</span>
      <ShareLink path={c.url} title={c.title} iconOnly className="text-neutral-500" />
    </div>
  </article>
);

export const Heading = ({ children, href, more = 'Ver tudo' }: { children: React.ReactNode; href?: string; more?: string }) => (
  <div className="mb-3 mt-8 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
    <h2 className="whitespace-nowrap border-b-2 text-[15px] font-bold uppercase" style={{ color: GREEN, borderColor: GREEN }}>{children}</h2>
    {href && (
      <a href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: GREEN }}>
        <span className="relative">
          {more}
          {/* a linha corre para a direita ao apontar */}
          <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full" style={{ background: GREEN }} />
        </span>
        <ChevronRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </a>
    )}
  </div>
);

/** fill: em ecrãs largos tem a mesma altura do slide principal (430px). */
export const Widget = ({ title, children, flush = false, fill = false, dark = false, green = false }: { title: string; children: React.ReactNode; flush?: boolean; fill?: boolean; dark?: boolean; green?: boolean }) => (
  <div className={`mb-5 bg-white shadow-sm ${fill ? 'lg:flex lg:h-[430px] lg:flex-col' : ''}`}>
    <h3 className={`whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider ${green ? 'border-b-2 border-[#8DF43A] text-white' : dark ? 'text-white' : 'border-b border-neutral-300 text-neutral-600'}`} style={green ? { background: GREEN } : dark ? { background: '#084030' } : undefined}>{title}</h3>
    <div className={`${flush ? '' : 'p-5'} ${fill ? 'lg:min-h-0 lg:flex-1' : ''}`}>{children}</div>
  </div>
);

export const PageTitle = ({ kicker, title, lead }: { kicker?: string; title: string; lead?: string }) => (
  <div className="bg-white px-6 py-8 shadow-sm">
    {kicker && <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GREEN }}>{kicker}</span>}
    <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl" style={{ color: '#064E3B' }}>{title}</h1>
    {lead && <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-neutral-600">{lead}</p>}
  </div>
);
