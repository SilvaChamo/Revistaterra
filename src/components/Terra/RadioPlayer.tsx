'use client';

import { useEffect, useState } from 'react';
import { GREEN, terra } from '@/lib/terra';
import { useRadio } from './RadioProvider';
const mins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

export function nowOnAir(): { show: string; time: string } | null {
  const d = new Date(), now = ((d.getUTCHours() + 2) % 24) * 60 + d.getUTCMinutes(); // hora de Maputo (CAT)
  const s = terra.radioFull.find((r) => now >= mins(r.time) && now < mins(r.end));
  return s ? { show: s.show, time: `${s.time}–${s.end}` } : null;
}

export default function RadioPlayer({ compact = false }: { compact?: boolean }) {
  // o áudio vive no RadioProvider (raiz do site): continua a tocar ao mudar de página
  const { playing, toggle } = useRadio();
  const [now, setNow] = useState<ReturnType<typeof nowOnAir>>(null);
  useEffect(() => { setNow(nowOnAir()); const id = setInterval(() => setNow(nowOnAir()), 60000); return () => clearInterval(id); }, []);

  return (
    <div className="flex items-center gap-4">
      <span className="relative flex h-14 w-14 shrink-0">
        {!playing && <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: GREEN, animation: 'terra-play 1.8s ease-out infinite' }} />}
        <button onClick={toggle} aria-label={playing ? 'Pausar' : 'Ouvir'} className="relative flex h-14 w-14 items-center justify-center rounded-full text-xl text-white" style={{ background: GREEN }}>{playing ? '❚❚' : '▶'}</button>
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: GREEN }}>{playing ? '● Em directo' : 'Rádio +Agro'}</div>
        <div className={`font-semibold leading-snug ${compact ? 'text-sm' : 'text-lg'}`}>{now ? now.show : 'A voz do agro e ambiente'}</div>
        <div className="text-xs text-neutral-500">{now ? `Agora no ar · ${now.time}` : 'Sintonize em qualquer altura'}</div>
      </div>
    </div>
  );
}
