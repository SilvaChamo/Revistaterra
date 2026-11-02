'use client';

import { useEffect, useRef, useState } from 'react';
import { GREEN, terra } from '@/lib/terra';

const STREAM = 'https://stream.zeno.fm/zux5ls5nfw9tv';
const mins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

export function nowOnAir(): { show: string; time: string } | null {
  const d = new Date(), now = ((d.getUTCHours() + 2) % 24) * 60 + d.getUTCMinutes(); // hora de Maputo (CAT)
  const s = terra.radioFull.find((r) => now >= mins(r.time) && now < mins(r.end));
  return s ? { show: s.show, time: `${s.time}–${s.end}` } : null;
}

export default function RadioPlayer({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState<ReturnType<typeof nowOnAir>>(null);
  useEffect(() => { setNow(nowOnAir()); const id = setInterval(() => setNow(nowOnAir()), 60000); return () => clearInterval(id); }, []);

  const toggle = () => {
    const a = ref.current; if (!a) return;
    if (playing) { a.pause(); a.removeAttribute('src'); a.load(); setPlaying(false); }
    else { a.src = STREAM; a.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
  };

  return (
    <div className="flex items-center gap-4">
      <button onClick={toggle} aria-label={playing ? 'Pausar' : 'Ouvir'} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl text-white" style={{ background: GREEN }}>{playing ? '❚❚' : '▶'}</button>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: GREEN }}>{playing ? '● Em directo' : 'Rádio +Agro'}</div>
        <div className={`font-semibold leading-snug ${compact ? 'text-sm' : 'text-lg'}`}>{now ? now.show : 'A voz do agro e ambiente'}</div>
        <div className="text-xs text-neutral-500">{now ? `Agora no ar · ${now.time}` : 'Sintonize em qualquer altura'}</div>
      </div>
      <audio ref={ref} preload="none" />
    </div>
  );
}
