'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { GREEN } from '@/lib/terra';
import type { Card } from '@/lib/terra';
import { NewsCard } from './Bits';

export type CategoryTab = { id: string; label: string; items: Card[] };

const PAGE = 6;
const MAX_TABS = 5; // acima disto as categorias vão para um selector
const arrow = 'flex h-8 w-8 items-center justify-center border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-[#9BCB3C] hover:bg-[#9BCB3C] hover:text-[#064E3B]';

/** Secção com as categorias na linha do título (separadores, ou selector se forem muitas); 6 notícias por página (2 linhas de 3), com slide se houver mais. */
export default function CategoryTabs({ title, tabs }: { title: string; tabs: CategoryTab[] }) {
  const [tab, setTab] = useState(tabs[0].id);
  const [page, setPage] = useState(0);
  const t = tabs.find((x) => x.id === tab) ?? tabs[0];
  const pages = Array.from({ length: Math.ceil(t.items.length / PAGE) }, (_, k) => t.items.slice(k * PAGE, (k + 1) * PAGE));
  const choose = (id: string) => { setTab(id); setPage(0); };
  const go = (d: number) => setPage((p) => (p + d + pages.length) % pages.length);

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
        <h2 className="whitespace-nowrap border-b-2 pb-1.5 text-[15px] font-bold uppercase" style={{ color: GREEN, borderColor: GREEN }}>{title}</h2>
        <div className={`flex items-center text-sm max-sm:w-full ${tabs.length > MAX_TABS ? 'gap-2' : 'gap-4 max-sm:justify-between'}`}>
          {tabs.length > MAX_TABS ? (
            <div className="relative">
              <select aria-label="Categoria" value={t.id} onChange={(e) => choose(e.target.value)} className="h-8 min-w-[150px] cursor-pointer appearance-none border border-neutral-300 bg-white pl-3 pr-9 text-sm text-neutral-800 outline-none transition-colors hover:border-[#9BCB3C] focus:border-[#047857]">
                {tabs.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select>
              <ChevronDown size={16} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            </div>
          ) : tabs.length > 1 ? (
            <div className="flex gap-4 max-sm:gap-3 max-sm:overflow-x-auto">
              {tabs.map((x) => (
                <button key={x.id} onClick={() => choose(x.id)} className={`relative whitespace-nowrap pb-1 ${x.id === t.id ? 'font-semibold text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}>
                  {x.label}
                  {x.id === t.id && <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: GREEN }} />}
                </button>
              ))}
            </div>
          ) : null}
          {pages.length > 1 && (
            <div className="flex gap-2">
              <button aria-label="Anterior" onClick={() => go(-1)} className={arrow}><ChevronLeft size={16} /></button>
              <button aria-label="Seguinte" onClick={() => go(1)} className={arrow}><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex items-start transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${page * 100}%)` }}>
          {pages.map((items, k) => (
            <div key={k} aria-hidden={k !== page} className="grid w-full shrink-0 gap-3 md:grid-cols-3">{items.map((c) => <NewsCard key={c.title} c={c} />)}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
