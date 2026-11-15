/**
 * Categorias de base da Revista Terra, definidas neste projecto (nada é lido do WordPress).
 * Cada site tem as suas: o Entrecampos usa as dele, noutro projecto. Aqui não entra nada de outros sites.
 */
export type SiteCategory = { slug: string; name: string; description: string };

export const slugifyCategory = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const DEFAULT_CATEGORIES: SiteCategory[] = [
  { name: 'Agricultura', description: 'Produção, campanhas e sector agrícola' },
  { name: 'Clima', description: 'Clima, ciclones e eventos climáticos' },
  { name: 'Economia', description: 'Economia e finanças' },
  { name: 'Entrevista', description: 'Entrevistas' },
  { name: 'Estudos', description: 'Estudos e relatórios' },
  { name: 'Internacional', description: 'Notícias do mundo' },
  { name: 'Meio Ambiente', description: 'Ambiente e sustentabilidade' },
  { name: 'Mercado', description: 'Preços e mercados' },
  { name: 'Política', description: 'Política e legislação' },
  { name: 'Reportagem', description: 'Reportagens' },
  { name: 'Sociedade', description: 'Sociedade e comunidades' },
].map((c) => ({ ...c, slug: slugifyCategory(c.name) }));

/** Lista guardada no painel: limpa, sem repetições nem Opinião (essa é só dos colunistas). */
export function normalizeSiteCategories(raw: unknown): SiteCategory[] {
  if (!Array.isArray(raw)) return DEFAULT_CATEGORIES;
  const seen = new Set<string>();
  const out: SiteCategory[] = [];
  for (const r of raw as Record<string, unknown>[]) {
    const name = String(r?.name ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
    const slug = slugifyCategory(name);
    if (!slug || slug === 'opiniao' || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, name, description: String(r?.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 120) });
  }
  return out;
}
