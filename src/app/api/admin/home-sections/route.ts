import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/api-guard';
import { homeCategories, homeLayout, homeOptions } from '@/lib/home-config';
import { loadCategories, slugify } from '@/lib/terra-news';

export const dynamic = 'force-dynamic';

// Categorias do formulário de notícias: aparecem no selector mesmo que ainda não tenham notícias.
const BASE = ['Agricultura', 'Mercado', 'Economia', 'Meio Ambiente', 'Clima', 'Tempo', 'Pesca', 'Energia', 'Sociedade', 'Política', 'Internacional', 'Fora de Campo'];

async function categoryOptions() {
  const map = new Map<string, string>();
  for (const name of BASE) map.set(slugify(name), name);
  try {
    for (const c of await loadCategories()) if (c.slug !== 'opiniao') map.set(c.slug, c.name);
  } catch {
    /* sem notícias: ficam as de base */
  }
  return [...map].map(([slug, label]) => ({ slug, label })).sort((a, b) => a.label.localeCompare(b.label, 'pt'));
}

/** Posição, categorias e publicidade das secções da home: as que estão guardadas, sem a cache de 1 hora. */
export async function GET() {
  const guard = await requireAuth('editar_definicoes');
  if ('error' in guard) return guard.error;
  const [layout, categories, options, cats] = await Promise.all([homeLayout.read(), homeCategories.read(), homeOptions.read(), categoryOptions()]);
  return NextResponse.json({ layout, categories, options, categoryOptions: cats });
}

const isObj = (v: unknown) => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Guarda a posição, as categorias e/ou a publicidade das secções da home. `null` volta ao de origem. */
export async function POST(req: NextRequest) {
  const guard = await requireAuth('editar_definicoes');
  if ('error' in guard) return guard.error;

  const body = await req.json().catch(() => ({}));
  const keys = ['layout', 'categories', 'options'] as const;
  if (!keys.some((k) => k in body)) return NextResponse.json({ error: 'Nada para guardar.' }, { status: 400 });
  if (keys.some((k) => k in body && body[k] !== null && !isObj(body[k]))) {
    return NextResponse.json({ error: 'Dados das secções inválidos.' }, { status: 400 });
  }
  try {
    const layout = 'layout' in body ? await homeLayout.save(body.layout) : await homeLayout.read();
    const categories = 'categories' in body ? await homeCategories.save(body.categories) : await homeCategories.read();
    const options = 'options' in body ? await homeOptions.save(body.options) : await homeOptions.read();
    revalidatePath('/'); // a home refaz-se já com a nova ordem, categorias e publicidade
    return NextResponse.json({ ok: true, layout, categories, options });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Não foi possível guardar.' }, { status: 502 });
  }
}
