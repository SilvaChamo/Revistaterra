import { NewsCard } from './Bits';
import Paginacao from '../Paginacao';
import type { Card } from '@/lib/terra';

/** Grelha de notícias (cartão principal) e paginação opcional. */
export default function NewsGrid({ cards, page, pages, base }: { cards: Card[]; page?: number; pages?: number; base?: string }) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => <NewsCard key={c.url} c={c} />)}
      </div>
      {pages && base && <Paginacao page={page ?? 1} pages={pages} href={(n) => (n === 1 ? base : `${base}${base.includes('?') ? '&' : '?'}pagina=${n}`)} />}
    </div>
  );
}
