import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { syncMailbox } from '@/lib/partilhado';
import { mailConfigured } from '@/lib/redaccao-mail';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Sincronização automática do e-mail da redacção (agendador do servidor/Vercel), com `Authorization: Bearer <CRON_SECRET>`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const sent = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const ok = Boolean(secret) && sent.length === secret!.length && timingSafeEqual(Buffer.from(sent), Buffer.from(secret!));
  if (!ok) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  // Sem o e-mail da redacção configurado (IMAP_*), não há nada a sincronizar: responde bem em vez de falhar todos os dias.
  if (!mailConfigured()) return NextResponse.json({ skipped: 'E-mail da redacção ainda não configurado.' });
  try {
    return NextResponse.json(await syncMailbox(25));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 502 });
  }
}
