'use client';

import { useEffect, useState } from 'react';
import { GREEN } from '@/lib/terra';
import { DIAS_CURTOS, DIAS_LONGOS, ORDEM_DIAS, maputoNow, onAirNow, slotsOfDay, type RadioSlot } from '@/lib/radio-types';

/** Lista da programação da rádio. `semana` mostra os separadores dos dias; sem ele mostra só o dia de hoje. */
export default function RadioGrelha({ slots, semana = false }: { slots: RadioSlot[]; semana?: boolean }) {
  const [hoje, setHoje] = useState(() => maputoNow().day);
  const [dia, setDia] = useState(hoje);
  const [noAr, setNoAr] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      setHoje(maputoNow().day);
      setNoAr(onAirNow(slots)?.id ?? null);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [slots]);

  const verDia = semana ? dia : hoje;
  const lista = slotsOfDay(slots, verDia);

  return (
    <div>
      {semana && (
        <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-3 py-3" role="tablist" aria-label="Dia da semana">
          {ORDEM_DIAS.map((d) => (
            <button
              key={d}
              role="tab"
              aria-selected={d === dia}
              onClick={() => setDia(d)}
              className={`shrink-0 px-3 py-1.5 text-xs font-bold ${d === dia ? 'text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
              style={d === dia ? { background: GREEN } : undefined}
            >
              {DIAS_CURTOS[d]}{d === hoje ? ' •' : ''}
            </button>
          ))}
        </div>
      )}
      {semana && <div className="px-5 pt-3 text-xs font-bold uppercase tracking-wide text-neutral-500">{DIAS_LONGOS[dia]}{dia === hoje ? ' (hoje)' : ''}</div>}
      {lista.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-neutral-500">Sem programas neste dia.</p>
      ) : (
        <ul className={semana ? '' : 'text-[13px]'}>
          {lista.map((r) => {
            const agora = verDia === hoje && r.id === noAr;
            return semana ? (
              <li key={r.id} className={`flex items-center gap-4 border-b border-neutral-100 px-5 py-4 last:border-0 ${agora ? 'bg-[#eaf3ed]' : ''}`}>
                <b className="w-28 shrink-0 text-sm" style={{ color: GREEN }}>{r.start} – {r.end}</b>
                <div className="min-w-0">
                  <div className="font-bold">{r.show}{agora && <span className="ml-2 text-[10px] font-bold uppercase" style={{ color: GREEN }}>● No ar</span>}</div>
                  <div className="text-xs text-neutral-500">{r.description || 'Radio +Agro'}</div>
                </div>
              </li>
            ) : (
              <li key={r.id} className={`flex gap-3 border-b border-neutral-300 px-5 py-2 last:border-b-0 ${agora ? 'bg-[#eaf3ed]' : ''}`}>
                <b className="w-[100px] shrink-0 whitespace-nowrap text-xs" style={{ color: GREEN }}>{r.start}–{r.end}</b>
                <span className="sm:whitespace-nowrap">{r.show}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
