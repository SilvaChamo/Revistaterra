'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GREEN } from '@/lib/terra';

export type CategoryCardItem = { slug: string; name: string; image: string | null; desc: string };

const PAGE = 6; // 2 linhas de 3 colunas
const arrow = 'flex h-7 w-7 items-center justify-center border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-[#9BCB3C] hover:bg-[#9BCB3C] hover:text-[#064E3B]';

/** Um cartão por categoria (foto da notícia mais recente, nome e descrição); 6 por página, com setas para ver as outras categorias. */
export default function CategoryCards({ title, items }: { title: string; items: CategoryCardItem[] }) {
  const [page, setPage] = useState(0);
  const pages = Array.from({ length: Math.ceil(items.length / PAGE) }, (_, k) => items.slice(k * PAGE, (k + 1) * PAGE));
  const go = (d: number) => setPage((p) => (p + d + pages.length) % pages.length);
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="whitespace-nowrap border-b-2 pb-1.5 text-[15px] font-bold uppercase" style={{ color: GREEN, borderColor: GREEN }}>{title}</h2>
        {pages.length > 1 && (
          <div className="flex gap-1">
            <button aria-label="Anterior" onClick={() => go(-1)} className={arrow}><ChevronLeft size={16} /></button>
            <button aria-label="Seguinte" onClick={() => go(1)} className={arrow}><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
      <div className="overflow-hidden">
        <div className="flex items-start transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${page * 100}%)` }}>
          {pages.map((list, k) => (
            <div key={k} aria-hidden={k !== page} className="grid w-full shrink-0 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {list.map((c) => (
                <a key={c.slug} href={`/categoria/${c.slug}`} tabIndex={k === page ? 0 : -1} className="group relative block h-[190px] overflow-hidden bg-black">
                  {c.image && <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="text-[17px] font-semibold leading-tight text-white">{c.name}</h3>
                    {c.desc && <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/85">{c.desc}</p>}
                  </div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
