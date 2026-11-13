import data from '@/data/terra.json';

export const GREEN = '#047857';
export const DARK = '#064E3B'; // tom do texto "TERRA" no logo
export const LIME = '#9BCB3C'; // verde-lima de campo: botões, hovers e etiquetas de categoria
export const TOPBAR = '#084030'; // barra fina de cima (cor medida na referência)
export const DARKER = '#053D2F'; // um pouco mais carregado: linha do menu e item activo

export type Card = { category: string; title: string; excerpt: string; url: string; image: string | null; date?: string; exclusive?: boolean };

/** Endereço de uma notícia no site antigo (revistaterraonline.com): é daí que vêm os títulos de src/data/terra.json. */
const SITE_ANTIGO = /^https?:\/\/(www\.)?revistaterraonline\.com\//i;

/** Slug de uma notícia = último troço do endereço (é o mesmo que scripts/importar-noticias-terra.js grava na base). */
export function slugDoEndereco(url: string): string {
  try {
    const partes = new URL(url).pathname.split('/').filter(Boolean);
    return decodeURIComponent(partes[partes.length - 1] || '');
  } catch {
    return '';
  }
}

/** As notícias abrem neste projecto (/noticias/<slug>), não no site antigo. Outros endereços ficam como estão. */
function interno<T extends { url: string }>(item: T): T {
  const slug = SITE_ANTIGO.test(item.url) ? slugDoEndereco(item.url) : '';
  return slug ? { ...item, url: `/noticias/${encodeURIComponent(slug)}` } : item;
}

/**
 * Endereço original (site antigo) de uma notícia que ainda não foi importada para a base de dados.
 * A página /noticias/<slug> usa-o como reserva até a importação ser feita.
 */
export function enderecoAntigo(slug: string): string | null {
  const todos = [...data.hero, ...data.cards, ...data.authors];
  return todos.find((i) => SITE_ANTIGO.test(i.url) && slugDoEndereco(i.url) === slug)?.url ?? null;
}

export const terra = { ...data, hero: data.hero.map(interno), authors: data.authors.map(interno) };
export const allCards: Card[] = data.cards.map((c) => interno({ ...c, category: c.category || 'Fora de Campo' }));

/** Redes sociais da Revista Terra (as únicas que o site actual indica). */
export const social = [
  { name: 'Facebook', href: 'https://web.facebook.com/profile.php?id=100089198332110', path: 'M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3z' },
  { name: 'YouTube', href: 'https://www.youtube.com/@revistaterramz', path: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z' },
];

export const nav = [
  { label: 'Início', href: '/' },
  { label: 'Rádio', href: '/radio' },
  { label: 'Revista Digital', href: '/revista-digital' },
  { label: 'Podcasts', href: '/podcasts' },
  { label: 'Cotações', href: '/cotacoes' },
  { label: 'Quem Somos', href: '/quem-somos' },
  { label: 'Contacto', href: '/contacto' },
];

/** Escolhe notícias ainda não usadas, preferindo as categorias indicadas. */
export function makePicker(cards: Card[] = allCards) {
  const used = new Set<string>();
  return (n: number, prefer: string[] = []): Card[] => {
    const out: Card[] = [];
    const pick = (pred: (c: Card) => boolean) => {
      for (const c of cards) if (out.length < n && !used.has(c.title) && pred(c)) { used.add(c.title); out.push(c); }
    };
    if (prefer.length) pick((c) => prefer.includes(c.category));
    pick(() => true);
    for (let i = 0; out.length < n; i++) out.push(cards[i % cards.length]);
    return out;
  };
}

const MESES: Record<string, number> = { janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11 };
/** "Outubro 15, 2026" → data (0 se não houver data). */
export function parseDate(s?: string): number {
  const m = s?.match(/^(\S+)\s+(\d+),\s+(\d{4})$/);
  if (!m || MESES[m[1].toLowerCase()] === undefined) return 0;
  return new Date(+m[3], MESES[m[1].toLowerCase()], +m[2]).getTime();
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  'agricultura':        { bg: '#047857', fg: '#FFFFFF' },
  'opiniao':            { bg: '#1E3A5F', fg: '#FFFFFF' },
  'comunidade':         { bg: '#C2703E', fg: '#FFFFFF' },
  'agro-negocio':       { bg: '#5B7C3A', fg: '#FFFFFF' },
  'fora-de-campo':      { bg: '#7B5B3A', fg: '#FFFFFF' },
  'curiosidade':        { bg: '#B8860B', fg: '#FFFFFF' },
  'sociedade':          { bg: '#2E7D9B', fg: '#FFFFFF' },
  'sector-agrario':     { bg: '#6B8E23', fg: '#FFFFFF' },
  'fruticultura':       { bg: '#C2185B', fg: '#FFFFFF' },
  'mercado':            { bg: '#8B7D3C', fg: '#FFFFFF' },
  'oportunidades':      { bg: '#7CB342', fg: '#FFFFFF' },
  'tempo':              { bg: '#607D8B', fg: '#FFFFFF' },
  'agro-pecuaria':      { bg: '#558B2F', fg: '#FFFFFF' },
  'ambiente':           { bg: '#2E7D32', fg: '#FFFFFF' },
  'meio-ambiente':      { bg: '#2E7D32', fg: '#FFFFFF' },
  'receitas':           { bg: '#D84315', fg: '#FFFFFF' },
  'meios-de-vida':      { bg: '#A0522D', fg: '#FFFFFF' },
  'energia':            { bg: '#F9A825', fg: '#3E2723' },
  'clima':              { bg: '#0288D1', fg: '#FFFFFF' },
  'politica':           { bg: '#6A1B3D', fg: '#FFFFFF' },
  'internacional':      { bg: '#1565C0', fg: '#FFFFFF' },
  'pesca':              { bg: '#00838F', fg: '#FFFFFF' },
  'economia':           { bg: '#8D6E24', fg: '#FFFFFF' },
  'agro-processamento': { bg: '#4E6B45', fg: '#FFFFFF' },
  'seguranca-alimentar':{ bg: '#C62828', fg: '#FFFFFF' },
  'apicultura':         { bg: '#FFB300', fg: '#3E2723' },
  'entrevista':         { bg: '#6A1B9A', fg: '#FFFFFF' },
};
const DEFAULT_CAT_COLOR = { bg: '#047857', fg: '#FFFFFF' };
function catSlug(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export function categoryColor(category: string): { bg: string; fg: string } {
  return CATEGORY_COLORS[catSlug(category)] ?? DEFAULT_CAT_COLOR;
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  'agricultura':        { bg: '#047857', fg: '#FFFFFF' },
  'opiniao':            { bg: '#1E3A5F', fg: '#FFFFFF' },
  'comunidade':         { bg: '#C2703E', fg: '#FFFFFF' },
  'agro-negocio':       { bg: '#5B7C3A', fg: '#FFFFFF' },
  'fora-de-campo':      { bg: '#7B5B3A', fg: '#FFFFFF' },
  'curiosidade':        { bg: '#B8860B', fg: '#FFFFFF' },
  'sociedade':          { bg: '#2E7D9B', fg: '#FFFFFF' },
  'sector-agrario':     { bg: '#6B8E23', fg: '#FFFFFF' },
  'fruticultura':       { bg: '#C2185B', fg: '#FFFFFF' },
  'mercado':            { bg: '#8B7D3C', fg: '#FFFFFF' },
  'oportunidades':      { bg: '#7CB342', fg: '#FFFFFF' },
  'tempo':              { bg: '#607D8B', fg: '#FFFFFF' },
  'agro-pecuaria':      { bg: '#558B2F', fg: '#FFFFFF' },
  'ambiente':           { bg: '#2E7D32', fg: '#FFFFFF' },
  'meio-ambiente':      { bg: '#2E7D32', fg: '#FFFFFF' },
  'receitas':           { bg: '#D84315', fg: '#FFFFFF' },
  'meios-de-vida':      { bg: '#A0522D', fg: '#FFFFFF' },
  'energia':            { bg: '#F9A825', fg: '#3E2723' },
  'clima':              { bg: '#0288D1', fg: '#FFFFFF' },
  'politica':           { bg: '#6A1B3D', fg: '#FFFFFF' },
  'internacional':      { bg: '#1565C0', fg: '#FFFFFF' },
  'pesca':              { bg: '#00838F', fg: '#FFFFFF' },
  'economia':           { bg: '#8D6E24', fg: '#FFFFFF' },
  'agro-processamento': { bg: '#4E6B45', fg: '#FFFFFF' },
  'seguranca-alimentar':{ bg: '#C62828', fg: '#FFFFFF' },
  'apicultura':         { bg: '#FFB300', fg: '#3E2723' },
  'entrevista':         { bg: '#6A1B9A', fg: '#FFFFFF' },
};
const DEFAULT_CAT_COLOR = { bg: '#047857', fg: '#FFFFFF' };
function catSlug(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export function categoryColor(category: string): { bg: string; fg: string } {
  return CATEGORY_COLORS[catSlug(category)] ?? DEFAULT_CAT_COLOR;
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  'agricultura':        { bg: '#047857', fg: '#FFFFFF' },
  'opiniao':            { bg: '#1E3A5F', fg: '#FFFFFF' },
  'comunidade':         { bg: '#C2703E', fg: '#FFFFFF' },
  'agro-negocio':       { bg: '#5B7C3A', fg: '#FFFFFF' },
  'fora-de-campo':      { bg: '#7B5B3A', fg: '#FFFFFF' },
  'curiosidade':        { bg: '#B8860B', fg: '#FFFFFF' },
  'sociedade':          { bg: '#2E7D9B', fg: '#FFFFFF' },
  'sector-agrario':     { bg: '#6B8E23', fg: '#FFFFFF' },
  'fruticultura':       { bg: '#C2185B', fg: '#FFFFFF' },
  'mercado':            { bg: '#8B7D3C', fg: '#FFFFFF' },
  'oportunidades':      { bg: '#7CB342', fg: '#FFFFFF' },
  'tempo':              { bg: '#607D8B', fg: '#FFFFFF' },
  'agro-pecuaria':      { bg: '#558B2F', fg: '#FFFFFF' },
  'ambiente':           { bg: '#2E7D32', fg: '#FFFFFF' },
  'meio-ambiente':      { bg: '#2E7D32', fg: '#FFFFFF' },
  'receitas':           { bg: '#D84315', fg: '#FFFFFF' },
  'meios-de-vida':      { bg: '#A0522D', fg: '#FFFFFF' },
  'energia':            { bg: '#F9A825', fg: '#3E2723' },
  'clima':              { bg: '#0288D1', fg: '#FFFFFF' },
  'politica':           { bg: '#6A1B3D', fg: '#FFFFFF' },
  'internacional':      { bg: '#1565C0', fg: '#FFFFFF' },
  'pesca':              { bg: '#00838F', fg: '#FFFFFF' },
  'economia':           { bg: '#8D6E24', fg: '#FFFFFF' },
  'agro-processamento': { bg: '#4E6B45', fg: '#FFFFFF' },
  'seguranca-alimentar':{ bg: '#C62828', fg: '#FFFFFF' },
  'apicultura':         { bg: '#FFB300', fg: '#3E2723' },
  'entrevista':         { bg: '#6A1B9A', fg: '#FFFFFF' },
};
const DEFAULT_CAT_COLOR = { bg: '#047857', fg: '#FFFFFF' };
function catSlug(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export function categoryColor(category: string): { bg: string; fg: string } {
  return CATEGORY_COLORS[catSlug(category)] ?? DEFAULT_CAT_COLOR;
}
