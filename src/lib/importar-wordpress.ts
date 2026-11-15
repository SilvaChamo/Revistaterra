import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Importa para o armazenamento deste projecto as fotos que as notícias ainda lêem do WordPress (…/wp-content/uploads/…),
 * na foto de destaque e no texto, e actualiza as notícias. Só mexe nas notícias deste site. Corre-se aos poucos (um lote
 * por pedido), a partir do painel, com as chaves que o próprio site já tem.
 */
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';
const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || process.env.STORAGE_BUCKET || 'revistaterra-media';
const MAX_BYTES = 15 * 1024 * 1024;

const WP_URL = /https?:\/\/(?:www\.)?(?:revistaterraonline\.com|revistaterra\.co\.mz)\/wp-content\/uploads\/[^\s"'<>)\]\\]+/gi;

export const findWpUrls = (text: unknown): string[] => [...new Set(String(text ?? '').match(WP_URL) ?? [])];

/** Nome no armazenamento: o caminho do WordPress achatado (ano-mês-nome), sem caracteres problemáticos. */
export function destName(url: string) {
  const rel = decodeURIComponent(url.split('/wp-content/uploads/')[1].split(/[?#]/)[0]);
  return 'news/wp/' + rel.replace(/\//g, '-').replace(/[^\w.\-]/g, '_');
}

/** Troca no texto cada endereço antigo pelo novo (os mais compridos primeiro, para um não estragar outro). */
export function replaceUrls(text: unknown, map: Record<string, string>) {
  let out = String(text ?? '');
  for (const old of Object.keys(map).sort((a, b) => b.length - a.length)) out = out.split(old).join(map[old]);
  return out;
}

const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const WP_FILTER = 'image_url.ilike.%wp-content%,content.ilike.%wp-content/uploads%';

export type LoteResultado = { importadas: number; actualizadas: number; falhadas: string[]; ids_com_falha: string[]; restantes: number };

/** Importa um lote de notícias. `skip` = notícias que já falharam (para não voltarem a ser tentadas). */
export async function importarLote(limit = 4, skip: string[] = []): Promise<LoteResultado> {
  const sb = db();
  let q = sb.from('news').select('id,slug,image_url,content').eq('site_id', SITE_ID).or(WP_FILTER).order('id').limit(limit);
  if (skip.length) q = q.not('id', 'in', `(${skip.join(',')})`);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);

  const falhadas: string[] = [];
  const ids_com_falha: string[] = [];
  let importadas = 0;
  let actualizadas = 0;
  for (const r of rows ?? []) {
    const map: Record<string, string> = {};
    let falhou = false;
    for (const url of [...findWpUrls(r.image_url), ...findWpUrls(r.content)]) {
      if (map[url]) continue;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
        const type = res.headers.get('content-type') || '';
        if (!res.ok || !type.startsWith('image/') || Number(res.headers.get('content-length') || 0) > MAX_BYTES) throw new Error(`${res.status}`);
        const dest = destName(url);
        const { error: ue } = await sb.storage.from(BUCKET).upload(dest, Buffer.from(await res.arrayBuffer()), { contentType: type, upsert: true });
        if (ue) throw new Error(ue.message);
        map[url] = sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
        importadas++;
      } catch {
        falhou = true;
        falhadas.push(url);
      }
    }
    const patch: Record<string, string> = {};
    const img = replaceUrls(r.image_url, map);
    const body = replaceUrls(r.content, map);
    if (img !== r.image_url) patch.image_url = img;
    if (body !== r.content) patch.content = body;
    if (Object.keys(patch).length) {
      const { error: e2 } = await sb.from('news').update(patch).eq('id', r.id).eq('site_id', SITE_ID);
      if (e2) falhou = true; else actualizadas++;
    }
    if (falhou) ids_com_falha.push(String(r.id));
  }

  let rest = sb.from('news').select('id', { count: 'exact', head: true }).eq('site_id', SITE_ID).or(WP_FILTER);
  const nao = [...skip, ...ids_com_falha];
  if (nao.length) rest = rest.not('id', 'in', `(${nao.join(',')})`);
  const { count } = await rest;
  return { importadas, actualizadas, falhadas, ids_com_falha, restantes: count ?? 0 };
}
