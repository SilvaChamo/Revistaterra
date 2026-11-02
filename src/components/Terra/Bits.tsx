import { GREEN } from '@/lib/terra';
import type { Card } from '@/lib/terra';

export const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block whitespace-nowrap px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide text-white" style={{ background: GREEN }}>{children}</span>
);

/** A letra do título acompanha o tamanho do cartão (cqmin = 1% do lado menor), em vez de ter um tamanho fixo. */
export const Overlay = ({ c, className = '', big = false }: { c: Card; className?: string; big?: boolean }) => (
  <a href={c.url} className={`group relative block overflow-hidden bg-black ${className}`} style={{ containerType: 'size' }}>
    {c.image && <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-[3.2cqmin]">
      <Tag>{c.category}</Tag>
      <h3 className="mt-[1.6cqmin] font-semibold leading-snug text-white" style={{ fontSize: big ? 'clamp(16px, 8.2cqmin, 21px)' : 'clamp(13px, 7.6cqmin, 15px)' }}>{c.title}</h3>
    </div>
  </a>
);

export const Heading = ({ children, href }: { children: React.ReactNode; href?: string }) => (
  <div className="mb-3 mt-8 flex items-end justify-between">
    <h2 className="whitespace-nowrap border-b-2 text-[15px] font-bold uppercase" style={{ color: GREEN, borderColor: GREEN }}>{children}</h2>
    {href && <a href={href} className="text-[11px] font-medium uppercase" style={{ color: GREEN }}>Ver tudo ›</a>}
  </div>
);

export const Widget = ({ title, children, flush = false }: { title: string; children: React.ReactNode; flush?: boolean }) => (
  <div className="mb-5 bg-white shadow-sm">
    <h3 className="whitespace-nowrap border-b border-neutral-300 px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-600">{title}</h3>
    <div className={flush ? '' : 'p-5'}>{children}</div>
  </div>
);

export const PageTitle = ({ kicker, title, lead }: { kicker?: string; title: string; lead?: string }) => (
  <div className="bg-white px-6 py-8 shadow-sm">
    {kicker && <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GREEN }}>{kicker}</span>}
    <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl" style={{ color: '#064E3B' }}>{title}</h1>
    {lead && <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-neutral-600">{lead}</p>}
  </div>
);
