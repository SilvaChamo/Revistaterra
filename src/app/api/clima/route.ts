import { NextResponse } from 'next/server';
import { loadWeather } from '@/lib/weather';

/** Tempo das províncias (Open-Meteo, um só pedido, em cache de 10 minutos e partilhado por todos os visitantes). */
export async function GET() {
  const data = await loadWeather();
  if (!data) return NextResponse.json(null, { status: 502 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' } });
}
