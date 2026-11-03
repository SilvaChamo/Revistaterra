'use client';

import { useEffect, useState } from 'react';
import { DARK, LIME } from '@/lib/terra';

export type HeroItem = { category: string; title: string; excerpt: string; url: string; image: string | null };

const arrow = 'flex h-9 w-9 items-center justify-center border border-white/60 bg-white/10 text-lg leading-none text-white backdrop-blur-[1px] transition-colors hover:border-[#9BCB3C] hover:bg-[#9BCB3C] hover:text-[#064E3B]';

export default function HeroSlider({ items }: { items: HeroItem[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  const go = (k: number) => setI(((k % n) + n) % n);

  useEffect(() => {
    if (paused || n < 2) return;
    const id = setTimeout(() => setI((x) => (x + 1) % n), 6000);
    return () => clearTimeout(id);
  }, [i, paused, n]);

  return (
    <div className="relative h-[390px] overflow-hidden bg-black sm:h-[380px] lg:h-[430px]" style={{ containerType: 'size' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-[104px] pl-9 pr-5 sm:bottom-[92px] sm:px-14">
            <span className="inline-block whitespace-nowrap px-3 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: LIME, color: DARK }}>{it.category}</span>
            <h2 className="mt-4 max-w-[92%] max-sm:line-clamp-3 font-extrabold leading-tight text-white sm:max-w-[78%]" style={{ fontSize: 'clamp(19px, 6.9cqmin, 32px)' }}>{it.title}</h2>
            {it.excerpt && <p className="mt-2 max-w-[92%] line-clamp-3 leading-snug text-white/85 sm:line-clamp-none sm:max-w-[70%]" style={{ fontSize: 'clamp(11.5px, 3.1cqmin, 14px)' }}>{it.excerpt}</p>}
          </div>
        </a>
      ))}

      {/* setas quadradas transparentes + Ler artigo, por baixo da descrição */}
      <div className="absolute bottom-6 left-9 z-10 flex items-center gap-2 sm:bottom-9 sm:left-14">
        <button aria-label="Anterior" onClick={() => go(i - 1)} className={arrow}>‹</button>
        <button aria-label="Seguinte" onClick={() => go(i + 1)} className={arrow}>›</button>
        <a href={items[i].url} className="ml-2 flex h-9 items-center px-5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-white" style={{ background: LIME, color: DARK }}>Ler artigo</a>
      </div>

      {/* pontos verticais: à esquerda, antes do título; terminam onde começam os botões (mesma base) e crescem para cima; o activo é maior */}
      <div className="absolute bottom-6 left-3 z-10 flex h-9 w-4 flex-col-reverse items-center justify-start gap-2 sm:bottom-9 sm:left-5 sm:w-5">
        {items.map((it, k) => (
          <button key={it.title} aria-label={`Notícia ${k + 1}`} onClick={() => setI(k)} className={`w-2 shrink-0 border border-white transition-all ${k === i ? 'h-6 bg-white' : 'h-2 bg-transparent hover:bg-white/60'}`} />
        ))}
      </div>
    </div>
  );
}
