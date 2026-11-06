import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/api-guard';
import { RADIO_SLUG, defaultSlots, loadRadioSlots, radioDb } from '@/lib/radio-schedule';
import { validarGrelha } from '@/lib/radio-types';

const PERMISSIONS = ['editar_paginas'];

/** Programação actual da rádio (a do painel ou, se ainda não houver, a que já estava no site). */
export async function GET() {
  const guard = await requireAuth(...PERMISSIONS);
  if ('error' in guard) return guard.error;
  const { slots, custom } = await loadRadioSlots();
  return NextResponse.json({ slots, custom });
}

/** Guarda a programação inteira (`slots`) ou volta à programação base (`reset: true`). */
export async function PUT(req: NextRequest) {
  const guard = await requireAuth(...PERMISSIONS);
  if ('error' in guard) return guard.error;
  try {
    const body = (await req.json()) as { slots?: unknown; reset?: boolean };
    const result = body.reset ? { ok: true as const, slots: defaultSlots() } : validarGrelha(body.slots);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    const { error } = await radioDb()
      .from('site_content')
      .upsert({ site_slug: RADIO_SLUG, news: { slots: result.slots }, categories: [], documents: [], updated_at: new Date().toISOString() }, { onConflict: 'site_slug' });
    if (error) throw error;

    try {
      revalidatePath('/', 'layout');
    } catch {
      /* o site actualiza-se na visita seguinte */
    }
    return NextResponse.json({ ok: true, slots: result.slots });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao guardar a programação.' }, { status: 500 });
  }
}
