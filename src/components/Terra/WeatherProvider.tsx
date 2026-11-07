'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Now } from '@/lib/weather';

type Ctx = { data: Now[] | null; failed: boolean; retry: () => void };
const WeatherCtx = createContext<Ctx>({ data: null, failed: false, retry: () => {} });
export const useWeather = () => useContext(WeatherCtx);

/**
 * Dados do tempo partilhados pela barra de cima e pelo cartão. Chegam já com a página (vindos do servidor, em cache);
 * o navegador só os actualiza de 10 em 10 minutos e, se falhar, continua a mostrar os últimos valores.
 * Se o servidor não conseguiu os dados, o navegador tenta (3 vezes) como antes.
 */
export default function WeatherProvider({ initial, children }: { initial: Now[] | null; children: React.ReactNode }) {
  const [data, setData] = useState<Now[] | null>(initial);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const refresh = useCallback((left: number): Promise<void> =>
    fetch('/api/clima').then((r) => (r.ok ? r.json() : Promise.reject(new Error('clima')))).then((j: Now[]) => { setData(j); setFailed(false); })
      .catch(() => { if (left > 0) return new Promise<void>((res) => setTimeout(() => res(refresh(left - 1)), 3000)); setFailed(true); }), []);

  useEffect(() => { if (!initial) refresh(3); }, [initial, attempt, refresh]);
  useEffect(() => { const id = setInterval(() => refresh(0).then(() => setFailed(false)), 600000); return () => clearInterval(id); }, [refresh]);

  return <WeatherCtx.Provider value={{ data, failed: failed && !data, retry: () => { setFailed(false); setAttempt((n) => n + 1); } }}>{children}</WeatherCtx.Provider>;
}
