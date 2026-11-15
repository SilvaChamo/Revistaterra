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

/** Copia uma foto do WordPress para o armazenamento do projecto e devolve o novo endereço público. */
async function copiarFoto(sb: ReturnType<typeof db>, url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.startsWith('image/') || Number(res.headers.get('content-length') || 0) > MAX_BYTES) throw new Error(`${res.status}`);
  const dest = destName(url);
  const { error } = await sb.storage.from(BUCKET).upload(dest, Buffer.from(await res.arrayBuffer()), { contentType: type, upsert: true });
  if (error) throw new Error(error.message);
  return sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
}

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
        map[url] = await copiarFoto(sb, url);
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

// ---------------------------------------------------------------------------------------------------------------------
// Notícias: passam do WordPress para a tabela `news` deste site (texto, categoria, data e fotos), para ficarem aqui.
// ---------------------------------------------------------------------------------------------------------------------

const WP_API = 'https://revistaterraonline.com/wp-json/wp/v2';
/** Tipos de conteúdo do WordPress que são notícias (os outros — publicações de casinos, páginas, rádio… — não entram). */
export const TIPOS = ['destaques', 'noticias', 'fora-de-campo', 'opiniao'] as const;
const PER_PAGE = 4;

const strip = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const limpar = (html: string) =>
  html.replace(/<(script|style|iframe)\b[\s\S]*?<\/\1>/gi, '').replace(/\son\w+="[^"]*"/gi, '').replace(/\s+/g, ' ').trim();

export type Cursor = { t: number; p: number };
export type LoteNoticias = { criadas: number; jaExistiam: number; fotos: number; erros: string[]; proximo: Cursor | null; tipo: string; total: number };

/** Importa uma página de notícias do WordPress. Devolve o cursor seguinte (`null` quando acabou tudo). */
export async function importarNoticias(cursor: Cursor = { t: 0, p: 1 }): Promise<LoteNoticias> {
  const sb = db();
  const tipo = TIPOS[cursor.t];
  const res = await fetch(`${WP_API}/${tipo}?per_page=${PER_PAGE}&page=${cursor.p}&orderby=date&order=desc&_embed=wp:featuredmedia,wp:term,author`, { signal: AbortSignal.timeout(30_000) });
  // Página além do fim (400): passa ao tipo seguinte.
  const total = Number(res.headers.get('x-wp-total') || 0);
  const pages = Number(res.headers.get('x-wp-totalpages') || 0);
  const items: Record<string, any>[] = res.ok ? await res.json() : [];
  const out: LoteNoticias = { criadas: 0, jaExistiam: 0, fotos: 0, erros: [], proximo: null, tipo, total };

  for (const it of items) {
    const slug = decodeURIComponent(String(it.slug || ''));
    if (!slug) continue;
    const { data: ja } = await sb.from('news').select('id').eq('site_id', SITE_ID).eq('slug', slug).maybeSingle();
    if (ja) { out.jaExistiam++; continue; }

    let content = limpar(String(it.content?.rendered || ''));
    const emb = it._embedded || {};
    const featured: string = emb['wp:featuredmedia']?.[0]?.source_url || '';
    const map: Record<string, string> = {};
    for (const url of new Set([...findWpUrls(featured), ...findWpUrls(content)])) {
      try { map[url] = await copiarFoto(sb, url); out.fotos++; } catch { out.erros.push(`foto: ${url}`); }
    }
    content = replaceUrls(content, map);
    const image = replaceUrls(featured, map) || (content.match(/<img[^>]+src="([^"]+)"/i)?.[1] ?? null);

    const opiniao = tipo === 'opiniao';
    const term: string = (emb['wp:term']?.[0]?.[0]?.name || '').trim();
    const category = opiniao ? 'Opinião' : (term || (tipo === 'fora-de-campo' ? 'fora de campo' : 'sem categoria')).toLowerCase();
    const author = opiniao ? term || 'Revista Terra' : emb.author?.[0]?.name || 'Revista Terra';
    const text = strip(content);
    const { error } = await sb.from('news').insert({
      site_id: SITE_ID,
      title: strip(String(it.title?.rendered || slug)),
      slug,
      summary: text.slice(0, 300),
      content: content || `<p>${strip(String(it.title?.rendered || ''))}</p>`,
      category,
      categories: [opiniao ? 'opiniao' : category],
      image_url: image,
      date: `${String(it.date_gmt || it.date).slice(0, 19)}+00:00`,
      status: 'published',
      featured: false,
      author_name: author,
      views: 0,
    });
    if (error) out.erros.push(`${slug.slice(0, 40)}: ${error.message}`); else out.criadas++;
  }

  if (cursor.p < pages) out.proximo = { t: cursor.t, p: cursor.p + 1 };
  else if (cursor.t + 1 < TIPOS.length) out.proximo = { t: cursor.t + 1, p: 1 };
  return out;
}
