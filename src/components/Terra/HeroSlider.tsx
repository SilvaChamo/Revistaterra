'use client';

import { useEffect, useState } from 'react';

export type HeroItem = { category: string; title: string; excerpt: string; url: string; image: string | null };

export default function HeroSlider({ items }: { items: HeroItem[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const go = (n: number) => setI((n + items.length) % items.length);

  return (
    <div
      className="relative h-[300px] overflow-hidden bg-black sm:h-[410px] lg:h-[470px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((it, n) => (
        <a
          key={it.title}
          href={it.url}
          aria-hidden={n !== i}
          tabIndex={n === i ? 0 : -1}
          className={`absolute inset-0 transition-opacity duration-700 ${n === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 pb-10 sm:p-8 sm:pb-12">
            <span className="mb-3 inline-block bg-[#047857] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{it.category}</span>
            <h2 className="max-w-[90%] text-xl font-semibold leading-tight text-white sm:text-3xl">{it.title}</h2>
            <p className="mt-2 hidden max-w-[80%] text-sm text-white/80 sm:block">{it.excerpt}</p>
          </div>
        </a>
      ))}
      <button aria-label="Anterior" onClick={() => go(i - 1)} className="absolute bottom-3 left-3 z-10 h-7 w-7 bg-black/50 text-white hover:bg-[#047857]">‹</button>
      <button aria-label="Seguinte" onClick={() => go(i + 1)} className="absolute bottom-3 right-3 z-10 h-7 w-7 bg-black/50 text-white hover:bg-[#047857]">›</button>
      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
        {items.map((it, n) => (
          <button key={it.title} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)} className={`h-2 w-2 rounded-full ${n === i ? 'bg-[#047857]' : 'bg-white/60'}`} />
        ))}
      </div>
    </div>
  );
}
