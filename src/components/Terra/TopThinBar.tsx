'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { DARK, DARKER, LIME, TOPBAR, social } from '@/lib/terra';

export const THIN_BAR = 36; // altura da barra fina, em px

const WMO: Record<number, string> = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 80: '🌦️', 81: '🌧️', 82: '⛈️', 95: '⛈️', 96: '⛈️', 99: '⛈️' };

/** Temperatura actual em Maputo (Open-Meteo), com uma nova tentativa se o serviço estiver ocupado. */
function MiniTemp() {
  const [t, setT] = useState<{ temp: number; icon: string } | null>(null);
  useEffect(() => {
    let alive = true;
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-25.966&longitude=32.583&current=temperature_2m,weather_code&timezone=auto';
    const load = (left: number) => fetch(url).then((r) => r.json()).then((j) => {
      if (j?.error) throw new Error(j.reason);
      if (alive) setT({ temp: Math.round(j.current.temperature_2m), icon: WMO[j.current.weather_code] ?? '⛅' });
    }).catch(() => { if (alive && left > 0) setTimeout(() => load(left - 1), 3000); });
    load(2);
    return () => { alive = false; };
  }, []);
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap font-semibold" title="Temperatura em Maputo">
      <span aria-hidden>{t ? t.icon : '🌡️'}</span>
      <span>{t ? `${t.temp}°C` : '--°C'}</span>
      <span className="hidden font-normal text-white/70 sm:inline">Maputo</span>
    </span>
  );
}

const ic = 'flex h-9 w-8 items-center justify-center transition-colors hover:text-[#9BCB3C]';

/** Barra fina por cima do cabeçalho (não fica fixa): rádio à esquerda, separador central com os contactos, temperatura, redes e pesquisa à direita. */
export default function TopThinBar() {
  const [search, setSearch] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  // o separador central começa e termina onde começa e termina o menu (largura do menu + folga de cada lado)
  const [tabW, setTabW] = useState<number | null>(null);
  useEffect(() => {
    const nav = document.querySelector('header nav[aria-label="Menu principal"]') as HTMLElement | null;
    if (!nav) return;
    const sync = () => setTabW(nav.getBoundingClientRect().width + 16);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(nav);
    window.addEventListener('resize', sync);
    document.fonts?.ready.then(sync);
    return () => { ro.disconnect(); window.removeEventListener('resize', sync); };
  }, []);
  useEffect(() => {
    if (!search) return;
    input.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setSearch(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [search]);

  return (
    <div className="relative z-[60] text-xs text-white" style={{ height: THIN_BAR, background: TOPBAR }}>
      <div className="relative mx-auto flex h-full max-w-[1300px] items-center justify-between gap-3 px-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/radio" className="flex items-center gap-3 whitespace-nowrap font-medium transition-colors hover:text-[#9BCB3C]">
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full" style={{ background: '#39FF14', animation: 'terra-live 1.4s cubic-bezier(0,0,0.2,1) infinite' }} />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: '#39FF14', boxShadow: '0 0 6px 1px #39FF14' }} />
            </span>
            Rádio ao vivo
          </Link>
        </div>
        {/* separador central, em trapézio, por baixo da barra: morada, e-mail e telemóvel */}
        <div className="pointer-events-auto absolute left-1/2 top-[13px] hidden h-[33px] -translate-x-1/2 items-center justify-center whitespace-nowrap px-4 text-[11px] font-normal xl:flex" style={{ width: tabW ?? undefined, background: TOPBAR, color: '#C9FDD8', clipPath: 'polygon(0 0, 100% 0, 100% 70%, calc(100% - 12px) 100%, 12px 100%, 0 70%)' }}>
          <span>Rua da Resistência, Nº 1642, 3º Andar M</span>
          <span className="mx-2 opacity-60">|</span>
          <a href="mailto:comercial@revistaterra.co.mz" className="transition-colors hover:text-[#9BCB3C]">comercial@revistaterra.co.mz</a>
          <span className="mx-2 opacity-60">|</span>
          <a href="tel:+258821233910" className="transition-colors hover:text-[#9BCB3C]">+258821233910</a>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <MiniTemp />
          <div className="flex items-center">
            {social.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} className={ic}>
                <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden><path d={s.path} /></svg>
              </a>
            ))}
            <button aria-label={search ? 'Fechar pesquisa' : 'Pesquisar'} aria-expanded={search} onClick={() => setSearch(!search)} className={ic} style={search ? { color: LIME } : undefined}>{search ? <X size={15} /> : <Search size={15} />}</button>
          </div>
        </div>
        <form role="search" action="/noticias" method="get" className={`absolute inset-x-3 top-full z-10 overflow-hidden shadow-lg transition-[max-height,opacity] duration-300 ${search ? 'max-h-24 opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`} style={{ background: DARKER }}>
          <div className="flex gap-2 p-3">
            <input ref={input} name="q" required tabIndex={search ? 0 : -1} type="search" placeholder="O que procura?" className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-neutral-900 outline-none" />
            <button type="submit" tabIndex={search ? 0 : -1} className="px-4 text-xs font-bold uppercase" style={{ background: LIME, color: DARK }}>Procurar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
