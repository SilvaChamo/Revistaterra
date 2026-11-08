/**
 * Secções da página inicial e as zonas onde podem estar (código partilhado pelo painel e pela home: sem nada de servidor).
 */
export type HomeZone = 'top' | 'main' | 'side' | 'bottom';
export const HOME_ZONES: { id: HomeZone; label: string; hint: string }[] = [
  { id: 'top', label: 'Topo', hint: 'largura total, por cima das colunas' },
  { id: 'main', label: 'Coluna principal', hint: 'coluna larga, à esquerda' },
  { id: 'side', label: 'Barra lateral', hint: 'coluna estreita, à direita' },
  { id: 'bottom', label: 'Fim', hint: 'largura total, por baixo das colunas' },
];

/** Todas as secções da home. `zone` é a zona de origem (a ordem em que estão aqui é a ordem de origem). */
export const HOME_SECTIONS: { id: string; label: string; zone: HomeZone }[] = [
  { id: 'destaque', label: 'Destaque (slide principal)', zone: 'main' },
  { id: 'ultimas', label: 'Notícias recentes (separadores)', zone: 'main' },
  { id: 'ambiente', label: 'Ambiente e Clima', zone: 'main' },
  { id: 'videos', label: 'Vídeos', zone: 'main' },
  { id: 'sociedade', label: 'Sociedade', zone: 'main' },
  { id: 'fora', label: 'Fora de Campo', zone: 'main' },
  { id: 'colunistas', label: 'Colunistas', zone: 'main' },
  { id: 'mais', label: 'Mais notícias', zone: 'main' },
  { id: 'tempo', label: 'Tempo · Moçambique', zone: 'side' },
  { id: 'radio', label: 'Rádio +Agro', zone: 'side' },
  { id: 'cambio', label: 'Câmbio', zone: 'side' },
  { id: 'capa', label: 'Edição actual da revista', zone: 'side' },
  { id: 'lidas', label: 'Mais lidas', zone: 'side' },
  { id: 'recentes', label: 'Recentes', zone: 'side' },
];

/** Espaço de publicidade posto numa zona (como um bloco do Gutenberg): o `id` entra na lista de secções da zona. */
export const isAdId = (id: string) => /^pub-[a-z0-9]{4,12}$/.test(id);

/** Medida exacta (e peso de referência) do anúncio em cada zona: a mesma tabela da página dos espaços de publicidade. */
export const HOME_AD_SIZES: Record<HomeZone, { name: string; w: number; h: number; kb: number }> = {
  top: { name: 'Topo do site', w: 728, h: 90, kb: 100 },
  main: { name: 'Entre as notícias', w: 680, h: 150, kb: 100 },
  side: { name: 'Barra lateral', w: 120, h: 200, kb: 120 },
  bottom: { name: 'Em cima do rodapé', w: 728, h: 90, kb: 100 },
};

export type HomeLayout = Record<HomeZone, string[]>;

const emptyLayout = (): HomeLayout => ({ top: [], main: [], side: [], bottom: [] });

/** A ordem de origem da página (a de antes de haver esta configuração). */
export function defaultHomeLayout(): HomeLayout {
  const out = emptyLayout();
  for (const s of HOME_SECTIONS) out[s.zone].push(s.id);
  return out;
}

/**
 * Valida o que está guardado: só secções que existem, cada uma uma só vez e na sua zona de origem (as secções só mudam de
 * posição dentro da zona; os espaços de publicidade podem estar em qualquer uma); as que faltarem (secção nova no código)
 * ficam no fim da sua zona. Assim a home nunca perde uma secção nem repete outra.
 */
export function normalizeHomeLayout(raw: unknown): HomeLayout {
  const origin = new Map(HOME_SECTIONS.map((s) => [s.id, s.zone]));
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const seen = new Set<string>();
  const out = emptyLayout();
  for (const zone of HOME_ZONES.map((z) => z.id)) {
    const list = Array.isArray(r[zone]) ? (r[zone] as unknown[]) : [];
    for (const id of list) {
      if (typeof id !== 'string' || seen.has(id)) continue;
      if (isAdId(id) || origin.get(id) === zone) {
        seen.add(id);
        out[zone].push(id);
      }
    }
  }
  for (const s of HOME_SECTIONS) if (!seen.has(s.id)) out[s.zone].push(s.id);
  return out;
}

/**
 * Categorias que cada secção mostra, escolhidas no painel. `multi` = a secção junta várias categorias (por ordem de
 * preferência); `defaults` = as de origem. O título de uma secção com uma só categoria acompanha a categoria escolhida.
 */
export const HOME_CATEGORY_SLOTS: { key: string; section: string; label: string; multi: boolean; defaults: string[] }[] = [
  { key: 'ambiente', section: 'ambiente', label: 'Categorias', multi: true, defaults: ['meio-ambiente', 'tempo', 'clima'] },
  { key: 'sociedade', section: 'sociedade', label: 'Categoria', multi: false, defaults: ['sociedade'] },
  { key: 'fora', section: 'fora', label: 'Categoria', multi: false, defaults: ['fora-de-campo'] },
  { key: 'mais', section: 'mais', label: 'Categorias', multi: true, defaults: ['pesca', 'energia', 'internacional', 'politica', 'economia'] },
];

export type HomeCategories = Record<string, string[]>;

export function defaultHomeCategories(): HomeCategories {
  return Object.fromEntries(HOME_CATEGORY_SLOTS.map((s) => [s.key, [...s.defaults]]));
}

/** Valida o que está guardado: só lugares que existem, categorias em forma de endereço, sem repetir; o que faltar volta ao de origem. */
export function normalizeHomeCategories(raw: unknown): HomeCategories {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out = defaultHomeCategories();
  for (const slot of HOME_CATEGORY_SLOTS) {
    const list = Array.isArray(r[slot.key]) ? (r[slot.key] as unknown[]) : [];
    const clean = list.filter((c, i): c is string => typeof c === 'string' && /^[a-z0-9-]{1,60}$/.test(c) && list.indexOf(c) === i).slice(0, slot.multi ? 12 : 1);
    if (clean.length > 0) out[slot.key] = clean;
  }
  return out;
}

/** Dados dos espaços de publicidade: só aparecem no site quando têm imagem. */
export type HomeAd = { id: string; image: string; link: string };
export type HomeOptions = { ads: HomeAd[] };

export const defaultHomeOptions = (): HomeOptions => ({ ads: [] });

const okUrl = (u: string) => u === '' || (u.length <= 500 && (/^https?:\/\/\S+$/i.test(u) || /^\/[^\s/]\S*$/.test(u)));

export function normalizeHomeOptions(raw: unknown): HomeOptions {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const ads: HomeAd[] = [];
  for (const a of Array.isArray(r.ads) ? (r.ads as unknown[]) : []) {
    const o = (a && typeof a === 'object' ? a : {}) as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id : '';
    const image = typeof o.image === 'string' ? o.image.trim() : '';
    const link = typeof o.link === 'string' ? o.link.trim() : '';
    if (isAdId(id) && !ads.some((x) => x.id === id) && okUrl(image) && okUrl(link) && ads.length < 20) ads.push({ id, image, link });
  }
  return { ads };
}
