'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GREEN, terra } from '@/lib/terra';

type Day = { max: number; min: number; code: number; label: string };
type Now = { temp: number; feels: number; hum: number; wind: number; code: number; days: Day[] };

const WMO: Record<number, [string, string]> = {
  0: ['Céu limpo', '☀️'], 1: ['Pouco nublado', '🌤️'], 2: ['Parcialmente nublado', '⛅'], 3: ['Nublado', '☁️'],
  45: ['Nevoeiro', '🌫️'], 48: ['Nevoeiro', '🌫️'], 51: ['Chuvisco leve', '🌦️'], 53: ['Chuvisco', '🌦️'], 55: ['Chuvisco forte', '🌧️'],
  61: ['Chuva fraca', '🌧️'], 63: ['Chuva', '🌧️'], 65: ['Chuva forte', '🌧️'], 80: ['Aguaceiros', '🌦️'], 81: ['Aguaceiros', '🌧️'],
  82: ['Aguaceiros fortes', '⛈️'], 95: ['Trovoada', '⛈️'], 96: ['Trovoada', '⛈️'], 99: ['Trovoada forte', '⛈️'],
};
const wmo = (c: number) => WMO[c] ?? ['Variável', '⛅'];
const weekday = (iso: string, i: number) => (i === 0 ? 'Hoje' : new Date(iso + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', ''));

/** Norte → sul, de Cabo Delgado a Maputo. */
const ORDER = ['cabo-delgado', 'niassa', 'nampula', 'zambezia', 'tete', 'manica', 'sofala', 'inhambane', 'gaza', 'maputo-provincia', 'maputo-cidade'];
const places = terra.provinces.map((p, idx) => ({ ...p, idx })).sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

export default function Weather() {
  const [data, setData] = useState<Now[] | null>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    const src = terra.provinces;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${src.map((p) => p.lat).join(',')}&longitude=${src.map((p) => p.lon).join(',')}` +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=4';
    const load = (left: number) => fetch(url).then((r) => r.json()).then((j) => {
      if (j?.error) throw new Error(j.reason);
      const arr = Array.isArray(j) ? j : [j];
      if (!alive) return;
      setFailed(false);
      setData(arr.map((x) => ({
        temp: Math.round(x.current.temperature_2m), feels: Math.round(x.current.apparent_temperature), hum: Math.round(x.current.relative_humidity_2m),
        wind: Math.round(x.current.wind_speed_10m), code: x.current.weather_code,
        days: x.daily.time.map((t: string, k: number) => ({ max: Math.round(x.daily.temperature_2m_max[k]), min: Math.round(x.daily.temperature_2m_min[k]), code: x.daily.weather_code[k], label: weekday(t, k) })),
      })));
    }).catch(() => {
      if (!alive) return;
      if (left > 0) setTimeout(() => load(left - 1), 3000);
      else setFailed(true);
    });
    load(3);
    return () => { alive = false; };
  }, [attempt]);

  // posição do fundo verde: segue o botão activo (e reajusta se a largura mudar)
  const tabs = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const box = tabs.current;
    if (!box || !data) return;
    const place = () => {
      const b = box.querySelectorAll('button')[i] as HTMLElement | undefined;
      if (b) setPill({ x: b.offsetLeft, y: b.offsetTop, w: b.offsetWidth, h: b.offsetHeight });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(box);
    return () => ro.disconnect();
  }, [i, data]);

  useEffect(() => {
    if (!data || paused) return;
    const id = setInterval(() => setI((n) => (n + 1) % places.length), 4500);
    return () => clearInterval(id);
  }, [data, paused]);

  if (failed) return <div className="p-5 text-sm text-neutral-500">Não foi possível carregar o tempo agora. <button onClick={() => { setFailed(false); setAttempt((n) => n + 1); }} className="font-bold underline" style={{ color: GREEN }}>Tentar de novo</button></div>;
  if (!data) return <p className="p-5 text-sm text-neutral-500">A carregar o clima nacional…</p>;
  const p = places[i], w = data[p.idx], [cond, icon] = wmo(w.code);

  return (
    <div className="flex h-full flex-col" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Entre a linha do cabeçalho e a linha antes dos dias da semana (altura fixa: nada se desloca) */}
      <div className="relative h-[152px] shrink-0 overflow-hidden lg:h-auto lg:min-h-[152px] lg:flex-1 border-b border-neutral-300 bg-[#0e1a26] text-white">
        <img src="/terra/clima-bg.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-[#0b1a2b]/55 to-[#0b1a2b]/80" />
        <div className="relative flex h-full flex-col">
          {/* nuvem e dados: centrados entre a linha de cima (cabeçalho) e a linha de baixo */}
          <div className="flex flex-1 items-center gap-4 px-5">
            <span className="text-5xl leading-none drop-shadow" aria-hidden>{icon}</span>
            <div className="min-w-0 flex-1">
              <div className="whitespace-nowrap text-[10px] font-bold uppercase tracking-normal text-emerald-300 drop-shadow">{p.label} · {p.province}</div>
              <div className="text-4xl font-extrabold leading-tight">{w.temp}<span className="text-lg font-semibold">°C</span></div>
              <div className="whitespace-nowrap text-xs text-white/90">{cond}</div>
            </div>
          </div>
          {/* linha de lado a lado, transparente */}
          <div className="flex gap-x-3 whitespace-nowrap border-t border-white/30 px-5 py-3 text-[11px] text-white/90"><span>Sensação {w.feels}°C</span><span>Humidade {w.hum}%</span><span>Vento {w.wind} km/h</span></div>
        </div>
      </div>
      <div className="p-5">
        <div className="grid h-[72px] grid-cols-4 gap-1 text-center text-[11px]">
          {w.days.map((d) => (
            <div key={d.label}><div className="capitalize text-neutral-500">{d.label}</div><div className="text-lg" title={wmo(d.code)[0]}>{wmo(d.code)[1]}</div><b>{d.max}°</b> <span className="text-neutral-400">{d.min}°</span></div>
          ))}
        </div>
        <div ref={tabs} className="relative mt-4 flex flex-wrap gap-1">
          {/* fundo verde único que desliza até à província escolhida */}
          <span aria-hidden className={`pointer-events-none absolute left-0 top-0 ${pill ? 'transition-all duration-300 ease-out' : ''}`} style={{ background: GREEN, opacity: pill ? 1 : 0, width: pill?.w, height: pill?.h, transform: `translate(${pill?.x ?? 0}px, ${pill?.y ?? 0}px)` }} />
          {places.map((x, k) => (
            <button key={x.key} onClick={() => setI(k)} className={`relative whitespace-nowrap px-2 py-1 text-[10px] transition-colors duration-300 ${k === i ? 'text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-[#9BCB3C] hover:text-[#064E3B]'}`} style={k === i && pill ? { background: 'transparent' } : k === i ? { background: GREEN } : undefined}>{x.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
