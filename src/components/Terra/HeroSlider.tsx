'use client';

import { useEffect, useState } from 'react';
import { DARK, GREEN } from '@/lib/terra';

export type HeroItem = { category: string; title: string; excerpt: string; url: string; image: string | null };

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block whitespace-nowrap rounded-br-md rounded-tl-md px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: GREEN }}>{children}</span>
);

/** Banner + 4 miniaturas por baixo (a primeira é a notícia activa, com barra de progresso). Altura total: 442px em ecrãs largos. */
export default function HeroSlider({ items }: { items: HeroItem[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => {
    if (paused || n < 2) return;
    const id = setTimeout(() => setI((x) => (x + 1) % n), 6000);
    return () => clearTimeout(id);
  }, [i, paused, n]);

  const next = Array.from({ length: Math.min(4, n) }, (_, k) => (i + k) % n);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[250px] overflow-hidden rounded-md bg-black sm:h-[300px] lg:h-[334px]">
        {items.map((it, k) => (
          <a
            key={it.title}
            href={it.url}
            aria-hidden={k !== i}
            tabIndex={k === i ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ${k === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            {it.image && <img src={it.image} alt="" decoding="async" loading={k === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-14 sm:pb-9">
              <Pill>{it.category}</Pill>
              <h2 className="mt-3 max-w-[92%] text-[22px] font-extrabold leading-tight text-white sm:max-w-[78%] sm:text-[32px]">{it.title}</h2>
              <span className="mt-3 inline-block text-xs font-semibold text-white/85">Ler artigo →</span>
            </div>
          </a>
        ))}
        {/* pontos verticais */}
        <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2 sm:left-5">
          {items.map((it, k) => (
            <button key={it.title} aria-label={`Notícia ${k + 1}`} onClick={() => setI(k)} className={`h-2 w-2 rounded-full border border-white ${k === i ? 'bg-white' : 'bg-transparent'}`} />
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:h-[96px] lg:grid-cols-4">
        {next.map((k, pos) => (
          <button
            key={items[k].title}
            onClick={() => setI(k)}
            className="relative flex h-full min-h-[84px] flex-col justify-between overflow-hidden rounded-md border bg-white px-3 pb-2 pt-2.5 text-left"
            style={{ borderColor: GREEN }}
          >
            {pos === 0 && (
              <span key={i} className="absolute left-0 top-0 h-[3px]" style={{ background: GREEN, animation: 'terra-progress 6s linear forwards', animationPlayState: paused ? 'paused' : 'running' }} />
            )}
            <span className="text-[11.5px] font-bold leading-[1.25]" style={{ color: DARK }}>{items[k].title}</span>
            <span className="mt-0.5 whitespace-nowrap text-[11px]" style={{ color: GREEN }}>{items[k].category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
