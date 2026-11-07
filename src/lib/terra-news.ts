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
    const { data: rows, error } = await db
      .from('news')
      .select('id,slug,title,summary,content,category,image_url,date,featured,author_name')
      .eq('site_id', SITE_ID)
      .eq('status', 'published')
      .order('date', { ascending: false })
      .limit(200);
    if (error || !rows?.length) throw new Error(error?.message || 'sem notícias');
    return rows.map((r) => ({ ...r, summary: r.summary || '', content: r.content || '', category: r.category || 'fora de campo', featured: !!r.featured, author_name: r.author_name || 'Revista Terra', date: r.date || new Date().toISOString() })) as TerraPost[];
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
  const [posts, exclusivas] = await Promise.all([loadPosts(), loadExclusivas()]);
  return posts.filter(notOpinion).map((p) => ({ ...toCard(p), exclusive: exclusivas.includes(p.slug) }));
});

export const loadHero = cache(async () => {
  const posts = (await loadPosts()).filter(notOpinion);
  const feat = posts.filter((p) => p.featured && p.image_url);
  const pick = feat.length >= 3 ? feat : [...feat, ...posts.filter((p) => !p.featured && p.image_url)];
  return pick.slice(0, 7).map((p) => ({ category: label(p.category), title: p.title, excerpt: p.summary, url: `/noticias/${p.slug}`, image: p.image_url }));
});

export async function loadPost(slug: string) {
  const posts = await loadPosts();
  return posts.find((p) => p.slug === slug) ?? null;
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
export function cleanContent(html: string) {
  return sanitizeHtml(html || '', {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'img', 'figure', 'figcaption', 'hr', 'span'],
    allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: { a: (tag, attribs) => ({ tagName: 'a', attribs: { ...attribs, rel: 'noopener noreferrer', target: '_blank' } }) },
  });
}
