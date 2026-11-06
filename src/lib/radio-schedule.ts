import 'server-only';
import { createClient } from '@supabase/supabase-js';
import data from '@/data/terra.json';
import type { RadioSlot } from '@/lib/radio-types';

/** Linha da tabela site_content onde fica a programação definida no painel. */
export const RADIO_SLUG = 'revistaterra_radio';

/** Programação que existia antes do painel (ficheiro do site): serve de ponto de partida e de reserva. */
export function defaultSlots(): RadioSlot[] {
  return (data.radioFull as { time: string; end: string; show: string }[]).map((r, i) => ({
    id: `base-${i + 1}`,
    days: [],
    start: r.time,
    end: r.end,
    show: r.show,
    active: true,
  }));
}

export function radioDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Base de dados sem chaves.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Programação gravada no painel; se ainda não houver nenhuma (ou a base falhar), a que já existia. */
export async function loadRadioSlots(): Promise<{ slots: RadioSlot[]; custom: boolean }> {
  try {
    const { data: row, error } = await radioDb().from('site_content').select('news').eq('site_slug', RADIO_SLUG).maybeSingle();
    if (error) throw error;
    const slots = (row?.news as { slots?: RadioSlot[] } | null)?.slots;
    if (Array.isArray(slots)) return { slots, custom: true };
  } catch {
    /* sem base de dados: usa a reserva */
  }
  return { slots: defaultSlots(), custom: false };
}
