import { NextResponse } from 'next/server';
import { loadCambio } from '@/lib/cambio';

/** Câmbio em meticais, partilhado por todos os visitantes e renovado de hora a hora. */
export async function GET() {
  const data = await loadCambio();
  if (!data) return NextResponse.json(null, { status: 502 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } });
}
