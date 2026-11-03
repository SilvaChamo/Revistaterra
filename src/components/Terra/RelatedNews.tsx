import type { Card } from '@/lib/terra';

/**
 * Lista de notícias (título e data), numa só coluna, sem fundo e separadas apenas por linhas horizontais.
 * Ficou de fora dos cartões das Notícias recentes: serve para usar noutro sítio.
 * Uso: <RelatedNews items={cartoes.filter((x) => x.category === categoria).slice(0, 3)} />
 */
export default function RelatedNews({ items, className = '' }: { items: Pick<Card, 'title' | 'url' | 'date'>[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={`divide-y divide-neutral-300 border-b border-neutral-300 ${className}`}>
      {items.map((n) => (
        <li key={n.url} className="px-1 py-2.5">
          <a href={n.url} className="line-clamp-2 text-[12px] font-semibold leading-snug text-neutral-900 hover:text-[#047857]">{n.title}</a>
          {n.date && <div className="mt-1 text-[11px] text-neutral-500">{n.date}</div>}
        </li>
      ))}
    </ul>
  );
}
