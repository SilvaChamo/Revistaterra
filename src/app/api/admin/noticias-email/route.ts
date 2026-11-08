import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { mailAddress, mailConfigured } from '@/lib/redaccao-mail';
import { loadEmailLog, loadEmailSettings, processMailbox, publishDue, saveEmailSettings } from '@/lib/noticias-email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const guard = await requireAuth('editar_definicoes');
  if ('error' in guard) return guard.error;
  const [settings, log] = await Promise.all([loadEmailSettings(), loadEmailLog()]);
  return NextResponse.json({ configured: mailConfigured(), address: mailAddress(), settings, entries: log.entries });
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth('editar_definicoes');
  if ('error' in guard) return guard.error;
  try {
    const body = (await req.json()) as { action?: string; senders?: unknown; requireVerified?: unknown; share?: unknown };
    if (body.action === 'verificar') {
      const result = await processMailbox(3);
      return NextResponse.json({ result, agendadas: await publishDue() });
    }
    const settings = await saveEmailSettings({
      ...(Array.isArray(body.senders) ? { senders: body.senders as string[] } : {}),
      ...(typeof body.requireVerified === 'boolean' ? { requireVerified: body.requireVerified } : {}),
      ...(typeof body.share === 'boolean' ? { share: body.share } : {}),
    });
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 });
  }
}
