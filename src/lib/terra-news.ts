import 'server-only';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import sanitizeHtml from 'sanitize-html';
import data from '@/data/terra.json';
import type { Card } from '@/lib/terra';
import { loadExclusivas } from '@/lib/assinaturas';

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export type TerraPost = {
  id: string; slug: string; title: string; summary: string; content: string;
  category: string; image_url: string | null; date: string; featured: boolean; author_name: string;
};

export const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
/** "meio ambiente" → "Meio Ambiente" */
export const label = (c: string) => (c || 'Fora de Campo').split(/\s+/).map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
/** "Outubro 15, 2026" (o formato que o resto do site já usa) */
export function cardDate(iso: string) {
  const d = new Date(iso);
  return isNaN(+d) ? '' : `${MESES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
export function longDate(iso: string) {
  const d = new Date(iso);
  return isNaN(+d) ? '' : `${d.getUTCDate()} de ${MESES[d.getUTCMonth()].toLowerCase()} de ${d.getUTCFullYear()}`;
}

/** Artigos de opinião (muitos sem foto) não se misturam com as notícias da home: só aparecem no bloco Colunistas e na categoria Opinião. */
const notOpinion = (p: TerraPost) => slugify(p.category) !== 'opiniao';

const toCard = (p: TerraPost): Card => ({ category: label(p.category), title: p.title, excerpt: p.summary, url: `/noticias/${p.slug}`, image: p.image_url, date: cardDate(p.date) });

/** Notícias publicadas deste site, da mais recente para a mais antiga. Se a base de dados falhar, usa o ficheiro de reserva. */
export const loadPosts = cache(async (): Promise<TerraPost[]> => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('sem chaves');
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    // Sem o texto (pesado): serve as listas, categorias e cartões. O texto de cada notícia vem em loadPost.
    // A base devolve no máximo 1000 linhas por pedido, por isso lê-se por páginas.
    const rows: Record<string, any>[] = [];
    for (let from = 0; from < 10000; from += 1000) {
      const { data, error } = await db
        .from('news')
        .select('id,slug,title,summary,category,image_url,date,featured,author_name')
        .eq('site_id', SITE_ID)
        .eq('status', 'published')
        .order('date', { ascending: false })
        .range(from, from + 999);
      if (error) throw new Error(error.message);
      rows.push(...(data ?? []));
      if ((data?.length ?? 0) < 1000) break;
    }
    if (!rows.length) throw new Error('sem notícias');
    return rows.map((r) => ({ ...r, summary: r.summary || '', content: '', category: r.category || 'fora de campo', featured: !!r.featured, author_name: r.author_name || 'Revista Terra', date: r.date || new Date().toISOString() })) as TerraPost[];
  } catch {
    return fallbackPosts();
  }
});

function fallbackPosts(): TerraPost[] {
  const seen = new Set<string>();
  const out: TerraPost[] = [];
  for (const [g, list] of [['hero', data.hero], ['cards', data.cards]] as const) {
    for (const c of list as any[]) {
      if (seen.has(c.url)) continue;
      seen.add(c.url);
      const slug = decodeURIComponent(new URL(c.url).pathname.split('/').filter(Boolean).pop() || '');
      out.push({ id: slug, slug, title: c.title, summary: c.excerpt || '', content: `<p>${c.excerpt || c.title}</p>`, category: (c.category || 'fora de campo').toLowerCase(), image_url: c.image, date: new Date().toISOString(), featured: g === 'hero', author_name: 'Revista Terra' });
    }
  }
  return out;
}

export const loadCards = cache(async (): Promise<Card[]> => {
  // O selo «exclusiva» não decide acessos: se a lista falhar, os cartões saem sem selo em vez de a página cair.
  const [posts, exclusivas] = await Promise.all([loadPosts(), loadExclusivas().catch(() => [] as string[])]);
  return posts.filter(notOpinion).map((p) => ({ ...toCard(p), exclusive: exclusivas.includes(p.slug) }));
});

/** Banner principal: as 5 notícias mais recentes (com foto) de todas as categorias, menos Opinião. */
export const loadHero = cache(async () => {
  const posts = (await loadPosts()).filter((p) => notOpinion(p) && p.image_url);
  return posts.slice(0, 5).map((p) => ({ category: label(p.category), title: p.title, excerpt: p.summary, url: `/noticias/${p.slug}`, image: p.image_url, date: cardDate(p.date) }));
});

export async function loadPost(slug: string) {
  const post = (await loadPosts()).find((p) => p.slug === slug) ?? null;
  if (!post) return null;
  // O texto completo só se pede para a notícia que se está a ler.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return post;
  try {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await db.from('news').select('content').eq('site_id', SITE_ID).eq('slug', slug).eq('status', 'published').maybeSingle();
    return data?.content ? { ...post, content: data.content as string } : post;
  } catch {
    return post;
  }
}

export async function loadCategories() {
  const posts = await loadPosts();
  const m = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of posts) {
    const name = label(p.category), slug = slugify(name);
    const e = m.get(slug) ?? { name, slug, count: 0 };
    e.count++; m.set(slug, e);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

/** HTML do artigo, limpo: só marcas de texto, ligações e imagens. */
/** Largura em píxeis de uma foto antiga → % do texto (680 px), entre 10 e 100; sem largura, 40 (igual ao editor). */
const legacyWidth = (px?: string) => {
  const w = parseInt(px || '', 10);
  return w ? Math.min(100, Math.max(10, Math.round((w / 680) * 100))) : 40;
};

export function cleanContent(html: string) {
  return sanitizeHtml(html || '', {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'img', 'figure', 'figcaption', 'hr', 'span', 'div'],
    allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'class', 'style'], figure: ['class', 'style'], div: ['class'] },
    // Foto à esquerda/direita e a sua largura em % (como o editor as grava) e a caixa de destaque.
    allowedClasses: { figure: ['ec-fig-left', 'ec-fig-right'], img: ['ec-img-left', 'ec-img-right', 'ec-img-center'], div: ['ec-callout', 'ec-fig-row'] },
    allowedStyles: { figure: { width: [/^\d{1,3}(?:\.\d+)?%$/] }, img: { width: [/^\d{1,3}(?:\.\d+)?%$/] } },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: (tag, attribs) => ({ tagName: 'a', attribs: { ...attribs, rel: 'noopener noreferrer', target: '_blank' } }),
      // Fotos antigas (do WordPress) trazem alignleft/alignright e a largura em píxeis: lêem-se como o editor as lê (percentagem do texto).
      img: (tag, attribs) => {
        const { class: cls = '', style: _style, ...rest } = attribs;
        const side = /\balignleft\b/.test(cls) ? 'left' : /\balignright\b/.test(cls) ? 'right' : /\baligncenter\b/.test(cls) ? 'center' : '';
        if (!side) return { tagName: 'img', attribs: rest };
        if (side === 'center') return { tagName: 'img', attribs: { ...rest, class: 'ec-img-center' } };
        return { tagName: 'img', attribs: { ...rest, class: `ec-img-${side}`, style: `width:${legacyWidth(attribs.width)}%` } };
      },
      figure: (tag, attribs) => {
        const cls = attribs.class || '';
        const side = /\balignleft\b/.test(cls) ? 'left' : /\balignright\b/.test(cls) ? 'right' : '';
        if (!side || /\bec-fig-/.test(cls)) return { tagName: 'figure', attribs };
        return { tagName: 'figure', attribs: { class: `ec-fig-${side}`, style: `width:${legacyWidth(/width:\s*(\d+)px/.exec(attribs.style || '')?.[1])}%` } };
      },
    },
  });
}
