'use client';

import { useEffect, useRef, useState } from 'react';
import { GREEN } from '@/lib/terra';

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

/** Play/pausa e linha de progresso que se vai preenchendo até ao fim do áudio. Sem fundo. */
export default function PodcastPlayer({ src, duration }: { src?: string; duration?: string }) {
  const a = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);

  useEffect(() => {
    const el = a.current;
    if (!el) return;
    const time = () => setT(el.currentTime);
    const meta = () => setD(el.duration);
    const end = () => { setPlaying(false); setT(el.duration); };
    el.addEventListener('timeupdate', time);
    el.addEventListener('loadedmetadata', meta);
    el.addEventListener('ended', end);
    el.addEventListener('pause', () => setPlaying(false));
    el.addEventListener('play', () => setPlaying(true));
    return () => { el.removeEventListener('timeupdate', time); el.removeEventListener('loadedmetadata', meta); el.removeEventListener('ended', end); };
  }, []);

  const toggle = () => { const el = a.current; if (!el || !src) return; if (el.paused) el.play().catch(() => setPlaying(false)); else el.pause(); };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = a.current; if (!el || !d) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * d;
  };
  const pct = d ? Math.min(100, (t / d) * 100) : 0;

  return (
    <div className="flex items-center gap-4">
      {src && <audio ref={a} src={src} preload="none" />}
      <button onClick={toggle} disabled={!src} aria-label={playing ? 'Pausar' : 'Ouvir'} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-colors enabled:hover:!bg-[#8DF43A] enabled:hover:!text-[#064E3B] disabled:opacity-50" style={{ background: GREEN }}>
        {playing
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 4.5v15l13-7.5z" /></svg>}
      </button>
      <div className="min-w-0 flex-1">
        <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} onClick={seek} className="h-1.5 cursor-pointer bg-neutral-300">
          <div className="h-full" style={{ width: `${pct}%`, background: GREEN }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-neutral-500">
          <span>{fmt(t)}</span>
          <span>{d ? fmt(d) : duration ?? ''}</span>
        </div>
      </div>
    </div>
  );
}
