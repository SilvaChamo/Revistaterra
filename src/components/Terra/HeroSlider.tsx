'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="relative h-[320px] overflow-hidden bg-black sm:h-[380px] lg:h-[430px]" style={{ containerType: 'size' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {items.map((it, k) => (
        <a
          key={it.title}
          href={it.url}
          aria-hidden={k !== i}
          tabIndex={k === i ? 0 : -1}
          className={`absolute inset-0 transition-opacity duration-700 ${k === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          {it.image && <img src={it.image} alt="" decoding="async" loading={k === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10 max-sm:hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent max-sm:from-black/90 max-sm:via-black/35" />
          <div className="absolute inset-x-0 bottom-[92px] px-5 max-sm:inset-y-0 max-sm:flex max-sm:flex-col max-sm:justify-end max-sm:p-[30px] max-sm:pb-[70px] sm:px-14">
            <span className="inline-block self-start whitespace-nowrap px-3 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: LIME, color: DARK }}>{it.category}</span>
            <h2 className="mt-3 line-clamp-3 max-w-[92%] font-bold leading-tight text-white max-sm:max-w-4xl max-sm:!text-[22px] sm:mt-3 sm:line-clamp-none sm:max-w-[78%] sm:font-extrabold" style={{ fontSize: 'clamp(19px, 6.9cqmin, 32px)' }}>{it.title}</h2>
            {it.excerpt && <p className="mt-3 line-clamp-2 max-w-3xl leading-relaxed text-white/85 max-sm:!text-[13px] sm:mt-2 sm:line-clamp-none sm:max-w-[70%] sm:leading-snug" style={{ fontSize: 'clamp(11.5px, 3.1cqmin, 14px)' }}>{it.excerpt}</p>}
          </div>
        </a>
      ))}

      {/* setas quadradas transparentes + Ler artigo, por baixo da descrição */}
      <div className="absolute bottom-9 left-14 z-10 hidden items-center gap-2 sm:flex">
        <button aria-label="Anterior" onClick={() => go(i - 1)} className={arrow}>‹</button>
        <button aria-label="Seguinte" onClick={() => go(i + 1)} className={arrow}>›</button>
        <a href={items[i].url} className="ml-2 flex h-9 items-center px-5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-white" style={{ background: LIME, color: DARK }}>Ler artigo</a>
      </div>

      {/* pontos verticais: à esquerda, antes do título; terminam onde começam os botões (mesma base) e crescem para cima; o activo é maior */}
      <div className="absolute bottom-9 left-5 z-10 hidden h-9 w-5 flex-col-reverse items-center justify-start gap-2 sm:flex">
        {items.map((it, k) => (
          <button key={it.title} aria-label={`Notícia ${k + 1}`} onClick={() => setI(k)} className={`shrink-0 border border-white transition-all ${k === i ? 'h-6 w-2 bg-white' : 'h-2 w-2 bg-transparent hover:bg-white/60'}`} />
        ))}
      </div>
      {/* Telemóvel (layout do EntreCAMPOS): seta, pontos (o activo alonga-se e enche durante o slide) e seta */}
      {n > 1 && (
        <div className="absolute bottom-[30px] left-[30px] z-10 flex items-center gap-2.5 sm:hidden">
          <button type="button" aria-label="Anterior" onClick={() => go(i - 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-black/50 text-white hover:border-[#9BCB3C] hover:bg-[#9BCB3C]"><ChevronLeft className="h-4 w-4" /></button>
          <div className="flex items-center gap-2">
            {items.map((it, k) => (
              <button key={it.title} type="button" aria-label={`Ir para a notícia ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} className={`relative overflow-hidden rounded-full transition-all duration-300 ${k === i ? 'h-1.5 w-12 bg-white/40' : 'h-2 w-2 bg-white/55 hover:bg-white'}`}>
                {k === i && <span key={i} className="ec-dot-fill absolute inset-y-0 left-0 w-full origin-left" style={{ background: LIME, animationDuration: '6000ms', animationPlayState: paused ? 'paused' : 'running' }} />}
              </button>
            ))}
          </div>
          <button type="button" aria-label="Seguinte" onClick={() => go(i + 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-black/50 text-white hover:border-[#9BCB3C] hover:bg-[#9BCB3C]"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
