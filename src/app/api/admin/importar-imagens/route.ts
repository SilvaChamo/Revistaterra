import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isUuid } from '@/lib/api-guard';
import { importarLote } from '@/lib/importar-wordpress';
import { refreshSite } from '@/lib/refresh-site';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Importa um lote de notícias com fotos do WordPress para o armazenamento deste projecto. Repetir até `restantes` ser 0. */
export async function POST(req: NextRequest) {
  const guard = await requireAuth('acesso_total');
  if ('error' in guard) return guard.error;
  const body = await req.json().catch(() => ({}));
  const skip = Array.isArray(body.skip) ? (body.skip as unknown[]).map(String).filter(isUuid).slice(0, 500) : [];
  try {
    const out = await importarLote(4, skip);
    if (out.actualizadas) refreshSite();
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Não foi possível importar.' }, { status: 500 });
  }
}
