'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DARK, GREEN, LIME } from '@/lib/terra';
import type { Card } from '@/lib/terra';
import ShareLink from './ShareLink';

export type RecentSet = { id: string; label: string; feature: Card[] };

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block whitespace-nowrap px-3 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: LIME, color: DARK }}>{children}</span>
);

const arrow = 'flex h-7 w-7 items-center justify-center border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-[#9BCB3C] hover:bg-[#9BCB3C] hover:text-[#064E3B]';

/** Carrossel em ciclo infinito: uma notícia por slide, 3 visíveis (1 no telemóvel). */
export default function RecentNews({ sets }: { sets: RecentSet[] }) {
  const [tab, setTab] = useState(sets[0].id);
  const s = sets.find((x) => x.id === tab) ?? sets[0];
  const items = s.feature;
  const n = items.length;

  const [vis, setVis] = useState(3);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setVis(mq.matches ? 3 : 1);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // clones nas pontas para o ciclo ser contínuo
  const ext = [...items.slice(-vis), ...items, ...items.slice(0, vis)];
  const [idx, setIdx] = useState(vis);
  const [anim, setAnim] = useState(false);
  const [paused, setPaused] = useState(false);
  const busy = useRef(false);

  useEffect(() => { setAnim(false); setIdx(vis); }, [tab, vis]);
  useEffect(() => { if (!anim) { const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true))); return () => cancelAnimationFrame(id); } }, [anim]);

  const go = useCallback((d: number) => { if (busy.current) return; busy.current = true; setIdx((i) => i + d); }, []);
  const settle = () => {
    busy.current = false;
    if (idx < vis) { setAnim(false); setIdx(idx + n); }
    else if (idx >= n + vis) { setAnim(false); setIdx(idx - n); }
  };

  useEffect(() => {
    if (paused || n < 2) return;
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
  }, [paused, n, go]);

  return (
    <section className="mt-8" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
        <h2 className="whitespace-nowrap border-b-2 pb-1.5 text-[15px] font-bold uppercase" style={{ color: GREEN, borderColor: GREEN }}>Notícias recentes</h2>
        <div className="flex items-center gap-4 text-sm max-sm:w-full max-sm:justify-between">
          <div className="flex gap-4 max-sm:gap-3">
            {sets.map((x) => (
              <button key={x.id} onClick={() => setTab(x.id)} className={`relative whitespace-nowrap pb-1 ${x.id === tab ? 'font-semibold text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}>
                {x.label}
                {x.id === tab && <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: GREEN }} />}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button aria-label="Anterior" onClick={() => go(-1)} className={arrow}><ChevronLeft size={16} /></button>
            <button aria-label="Seguinte" onClick={() => go(1)} className={arrow}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="-mx-2.5 overflow-hidden">
        <div className="flex" onTransitionEnd={settle} style={{ transform: `translateX(calc(-${idx} * 100% / ${vis}))`, transition: anim ? 'transform 500ms ease' : 'none' }}>
          {ext.map((c, k) => (
            <div key={k} className="box-border shrink-0 px-2.5" style={{ width: `${100 / vis}%` }}>
              <div className="group block" style={{ containerType: 'inline-size' }}>
                <a href={c.url} className="block">
                  <div className="relative h-[210px] overflow-hidden bg-black">
                    {c.image && <img src={c.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  </div>
                </a>
                {/* o cartão de texto entra pela foto (margem negativa) e sai por baixo */}
                <div className="relative z-10 mx-4 -mt-14 border-t-2 bg-white text-center shadow-sm" style={{ borderColor: GREEN }}>
                  <div className="px-4">
                    <div className="-mt-3"><Pill>{c.category}</Pill></div>
                    {/* no máximo 3 linhas de título, para os cartões não desalinharem o carrossel */}
                    <h3 className="mt-2 line-clamp-3 font-bold leading-snug text-neutral-900" style={{ fontSize: 'clamp(12.5px, 4.7cqw, 15px)', minHeight: '4.125em' }}><a href={c.url}>{c.title}</a></h3>
                  </div>
                  {/* linha a separar o título: data à esquerda e Partilhar à direita */}
                  <div className="mt-3 flex items-center justify-between border-t border-neutral-200 px-4 py-2 text-[11px] text-neutral-500">
                    <span>{c.date}</span>
                    <ShareLink path={c.url} title={c.title} className="text-neutral-500" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
