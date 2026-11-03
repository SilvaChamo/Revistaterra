'use client';

import { useState } from 'react';
import { GREEN, terra } from '@/lib/terra';

/** Série do vídeo (mostrada por baixo do título na lista). */
const serie = (t: string) => (/paulina/i.test(t) ? 'Conversas' : /mais agro/i.test(t) ? 'Mais Agro' : 'Revista Terra');

const Play = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 4.5v15l13-7.5z" /></svg>
);

export default function VideoSpotlight() {
  const vids = terra.videos;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const v = vids[i];
  const pick = (k: number) => { setI(k); setPlaying(true); };
  return (
    <div className="grid overflow-hidden bg-neutral-900 shadow-sm md:grid-cols-[1fr_340px]">
      {/* vídeo activo: capa com botão de play; ao clicar, toca aqui mesmo */}
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe key={v.id} className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`} title={v.title} allow="autoplay; accelerometer; encrypted-media; picture-in-picture; web-share" allowFullScreen />
        ) : (
          <button onClick={() => setPlaying(true)} aria-label={`Ver ${v.title}`} className="group absolute inset-0 h-full w-full">
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white shadow-lg transition-colors group-hover:!bg-[#8DF43A] group-hover:text-[#064E3B]" style={{ background: GREEN }}><Play size={26} /></span>
          </button>
        )}
      </div>

      {/* lista: o vídeo activo em verde no topo, os outros por baixo */}
      <div className="relative min-h-0 max-md:max-h-[360px]">
        <div className="max-md:max-h-[360px] md:absolute md:inset-0 overflow-y-auto">
          <div className="flex items-center gap-3 px-3 py-4 text-white" style={{ background: GREEN }}>
            <Play size={20} />
            <span className="min-w-0 truncate text-[12px] font-bold" title={v.title}>{v.title}</span>
          </div>
          <ul>
            {vids.map((x, k) => k === i ? null : (
              <li key={x.id} className="border-b border-white/10 last:border-b-0">
                <button onClick={() => pick(k)} className="flex w-full items-center gap-2.5 px-3 py-3 text-left transition-colors hover:bg-white/10">
                  <img src={`https://i.ytimg.com/vi/${x.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-10 w-[60px] shrink-0 object-cover" />
                  <span className="min-w-0 flex-1">
                    {/* linha 1: botão play + série; linha 2: título (só duas linhas no cartão) */}
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-white" style={{ background: GREEN }}><Play size={10} /></span>
                      <span className="truncate text-[11px] text-neutral-400">{serie(x.title)}</span>
                    </span>
                    <span className="mt-1 block truncate text-[12px] font-semibold text-white" title={x.title}>{x.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
