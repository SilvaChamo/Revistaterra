'use client';

import { useEffect, useState } from 'react';
import { GREEN } from '@/lib/terra';
import { onAirNow, type RadioSlot } from '@/lib/radio-types';
import { useRadio } from './RadioProvider';

export function nowOnAir(slots: RadioSlot[]): { show: string; time: string } | null {
  const s = onAirNow(slots); // hora de Maputo (CAT)
  return s ? { show: s.show, time: `${s.start}–${s.end}` } : null;
}

export default function RadioPlayer({ compact = false, slots = [] }: { compact?: boolean; slots?: RadioSlot[] }) {
  // o áudio vive no RadioProvider (raiz do site): continua a tocar ao mudar de página
  const { playing, loading, toggle } = useRadio();
  const [now, setNow] = useState<ReturnType<typeof nowOnAir>>(null);
  useEffect(() => { setNow(nowOnAir(slots)); const id = setInterval(() => setNow(nowOnAir(slots)), 60000); return () => clearInterval(id); }, [slots]);

  return (
    <div className="flex items-center gap-4">
      <span className="relative flex h-14 w-14 shrink-0">
        {!playing && <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: GREEN, animation: 'terra-play 1.8s ease-out infinite' }} />}
        <button onClick={toggle} aria-label={playing ? 'Pausar' : 'Ouvir'} className="relative flex h-14 w-14 items-center justify-center rounded-full text-xl text-white" style={{ background: GREEN }}>{playing ? '❚❚' : '▶'}</button>
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: GREEN }}>{loading ? 'A ligar…' : playing ? '● Em directo' : 'Rádio +Agro'}</div>
        <div className={`font-semibold leading-snug ${compact ? 'text-sm' : 'text-lg'}`}>{now ? now.show : 'A voz do agro e ambiente'}</div>
        <div className="text-xs text-neutral-500">{now ? `Agora no ar · ${now.time}` : 'Sintonize em qualquer altura'}</div>
      </div>
    </div>
  );
}
