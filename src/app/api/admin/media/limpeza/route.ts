import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-guard';
import data from '@/data/terra.json';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || process.env.STORAGE_BUCKET || 'revistaterra-media';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';
const SPECIAL = ['_lixo', '_arquivo', 'arquivo', 'partilhado'];
const IMAGE = /\.(jpe?g|png|gif|webp|avif|svg|bmp)$/i;
const PROTECTED = /logo|background|banner|footer|header|brand|capa|revista|edi[cç][aã]o|bilingual|favicon|publicidade/i; // fotos do próprio site (capas da revista incluídas): nunca se propõem para limpar

/** Imagens que o próprio site usa (capas e edições da revista, etc., em src/data/terra.json): ficam sempre de fora da limpeza. */
const SITE_IMAGES = new Set<string>();
(function collect(v: unknown) {
  if (typeof v === 'string') { if (IMAGE.test(v)) SITE_IMAGES.add(decodeURIComponent(v.split('/').pop() ?? '').toLowerCase()); }
  else if (Array.isArray(v)) v.forEach(collect);
  else if (v && typeof v === 'object') Object.values(v).forEach(collect);
})(data);

type Item = { name: string; id: string | null; created_at?: string; metadata?: { size?: number } | null };

async function walk(prefix = ''): Promise<Item[]> {
  const out: Item[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.storage.from(BUCKET).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(error.message);
    for (const it of (data ?? []) as unknown as Item[]) {
      if (it.name.startsWith('.') || it.name === '_pasta.json') continue;
      if (it.id === null) { if (!(prefix === '' && SPECIAL.includes(it.name))) out.push(...(await walk(`${prefix}${it.name}/`))); }
      else out.push({ ...it, name: `${prefix}${it.name}` });
    }
    if (!data || data.length < 1000) break;
  }
  return out;
}

/** Identifica «a mesma foto»: sem pasta, extensão, hora de envio, tamanho (-1024x682, e o «-1» que o segue), «-scaled» nem «-e1707…»; «images-2» e «images» são fotos diferentes. */
const sameKey = (name: string) =>
  (name.split('/').pop() ?? name).toLowerCase()
    .replace(/\.[a-z0-9]+$/, '').replace(/^\d{10,}[-_]/, '').replace(/-e\d{10,}$/, '')
    .replace(/-\d{2,5}x\d{2,5}(-\d{1,2})?/g, '').replace(/-scaled/g, '');

/**
 * Auditoria da biblioteca: para cada foto, em que notícias é usada (foto principal ou dentro do texto), se é usada na
 * configuração do site e se há outras cópias da mesma foto (tamanhos ou versões diferentes). Só quem gere a biblioteca.
 */
export async function GET() {
  const guard = await requireAuth('gerir_biblioteca', 'publicar_artigos');
  if ('error' in guard) return guard.error;
  try {
    const filesP = walk();
    const configP = (async () => {
      let text = '';
      const { data: cfg } = await db.storage.from(BUCKET).list('partilhado/_config', { limit: 100 });
      await Promise.all((cfg ?? []).filter((f) => f.name.endsWith('.json')).map(async (f) => {
        const { data: blob } = await db.storage.from(BUCKET).download(`partilhado/_config/${f.name}`);
        if (blob) text += ` ${await blob.text()}`;
      }));
      return text;
    })();

    // Notícias do site (a base devolve 1000 por pedido). O texto só se pede das que mencionam o bucket: descarregar o texto de todas demora minutos.
    const used = new Map<string, { id: string; title: string }[]>();
    const ref = new RegExp(`/${BUCKET}/([^"'\\s)<>?#]+)`, 'g');
    // No texto só conta o `src` das imagens: o `srcset` (tamanhos alternativos do WordPress) o site não o usa (é retirado ao mostrar a notícia).
    const scan = (n: { id: string; title: string }, text: string, inContent: boolean) => {
      const where = inContent ? [...text.matchAll(/\ssrc\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]).join(' ') : text;
      for (const m of where.matchAll(ref)) {
        let name = m[1];
        try { name = decodeURIComponent(name); } catch { /* fica como está */ }
        const list = used.get(name) ?? [];
        if (!list.some((x) => x.id === n.id)) list.push({ id: n.id, title: n.title });
        used.set(name, list);
      }
    };
    await Promise.all(([['id,title,image_url', null], ['id,title,content', `%/${BUCKET}/%`]] as const).map(async ([cols, filter]) => {
      for (let from = 0; from < 20000; from += 1000) {
        let q = db.from('news').select(cols).eq('site_id', SITE_ID).order('id').range(from, from + 999);
        if (filter) q = q.ilike('content', filter);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        for (const n of (data ?? []) as unknown as { id: string; title: string; image_url?: string; content?: string }[]) scan(n, n.image_url ?? n.content ?? '', n.image_url === undefined);
        if ((data?.length ?? 0) < 1000) break;
      }
    }));

    const [allFiles, config] = await Promise.all([filesP, configP]);
    const files = allFiles.filter((f) => IMAGE.test(f.name));

    const groups = new Map<string, number>();
    for (const f of files) groups.set(sameKey(f.name), (groups.get(sameKey(f.name)) ?? 0) + 1);

    return NextResponse.json({
      files: files.map((f) => ({
        name: f.name,
        url: db.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
        size: f.metadata?.size ?? 0,
        created: f.created_at ?? '',
        news: used.get(f.name) ?? [],
        config: config.includes(f.name) || config.includes(encodeURI(f.name)),
        protegida: PROTECTED.test(f.name) || SITE_IMAGES.has((f.name.split('/').pop() ?? '').toLowerCase()),
        group: sameKey(f.name),
        copies: groups.get(sameKey(f.name)) ?? 1,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao analisar a biblioteca.' }, { status: 500 });
  }
}
