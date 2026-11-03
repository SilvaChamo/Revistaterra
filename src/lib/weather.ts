import { terra } from '@/lib/terra';

export type Day = { max: number; min: number; code: number; label: string };
export type Now = { temp: number; feels: number; hum: number; wind: number; code: number; days: Day[] };

/** Um só pedido ao Open-Meteo para as 11 províncias (a ordem é a de terra.provinces). Pode ser trocado por WEATHER_API_URL. */
export const WEATHER_URL =
  process.env.WEATHER_API_URL ||
  `https://api.open-meteo.com/v1/forecast?latitude=${terra.provinces.map((p) => p.lat).join(',')}&longitude=${terra.provinces.map((p) => p.lon).join(',')}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=4';

const weekday = (iso: string, i: number) => (i === 0 ? 'Hoje' : new Date(iso + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', ''));

/** Resposta do Open-Meteo → dados por província. Lança erro se vier um erro do serviço. */
export function parseWeather(j: any): Now[] {
  if (j?.error) throw new Error(j.reason);
  const arr = Array.isArray(j) ? j : [j];
  return arr.map((x) => ({
    temp: Math.round(x.current.temperature_2m), feels: Math.round(x.current.apparent_temperature), hum: Math.round(x.current.relative_humidity_2m),
    wind: Math.round(x.current.wind_speed_10m), code: x.current.weather_code,
    days: x.daily.time.map((t: string, k: number) => ({ max: Math.round(x.daily.temperature_2m_max[k]), min: Math.round(x.daily.temperature_2m_min[k]), code: x.daily.weather_code[k], label: weekday(t, k) })),
  }));
}

/**
 * No servidor: o tempo vem guardado em cache (10 minutos) e é partilhado por todos os visitantes e pelos dois sítios que o mostram
 * (barra de cima e cartão). A página já chega com a temperatura, sem esperar por nenhum pedido no navegador.
 */
export async function loadWeather(): Promise<Now[] | null> {
  try {
    const r = await fetch(WEATHER_URL, { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000) });
    if (!r.ok) return null;
    return parseWeather(await r.json());
  } catch {
    return null;
  }
}
