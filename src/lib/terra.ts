import data from '@/data/terra.json';

export const GREEN = '#047857';
export const DARK = '#064E3B'; // tom do texto "TERRA" no logo
export const LIME = '#9BCB3C'; // verde-lima de campo: botões, hovers e etiquetas de categoria
export const DARKER = '#053D2F'; // um pouco mais carregado: linha do menu e item activo

export type Card = { category: string; title: string; excerpt: string; url: string; image: string | null; date?: string };

export const terra = data;
export const allCards: Card[] = data.cards.map((c) => ({ ...c, category: c.category || 'Fora de Campo' }));

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
