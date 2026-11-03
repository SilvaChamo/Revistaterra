import Link from 'next/link';
import { Overlay } from './Bits';
import { GREEN } from '@/lib/terra';
import type { Card } from '@/lib/terra';

/** Grelha de notícias (cartões com a foto e o título por cima) e paginação opcional. */
export default function NewsGrid({ cards, page, pages, base }: { cards: Card[]; page?: number; pages?: number; base?: string }) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div key={c.url}>
            <Overlay c={c} className="h-[200px]" />
            {c.date && <div className="bg-white px-3 py-2 text-[11px] text-neutral-500 shadow-sm">{c.date}</div>}
          </div>
        ))}
      </div>
      {pages && pages > 1 && base && (
        <nav className="mt-6 flex flex-wrap gap-1" aria-label="Páginas">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={n === 1 ? base : `${base}${base.includes('?') ? '&' : '?'}pagina=${n}`} className={`flex h-9 min-w-9 items-center justify-center px-3 text-sm font-bold ${n === page ? 'text-white' : 'bg-white text-neutral-700 hover:bg-[#9BCB3C] hover:text-[#064E3B]'}`} style={n === page ? { background: GREEN } : undefined}>{n}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
