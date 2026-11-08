import { revalidateTag, unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import {
  defaultHomeCategories, defaultHomeLayout, defaultHomeOptions,
  normalizeHomeCategories, normalizeHomeLayout, normalizeHomeOptions,
  type HomeCategories, type HomeLayout, type HomeOptions,
} from '@/lib/home-sections';

/**
 * Posição, categorias e publicidade das secções da página inicial, escolhidas no painel (Página inicial). Cada uma fica num
 * ficheiro pequeno no armazenamento (sem tabelas novas) e na cache de dados com uma etiqueta própria, que gravar limpa.
 */
const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder', {
    auth: { autoRefreshToken: false, persistSession: false },
  });
const BUCKET = () => process.env.NEXT_PUBLIC_STORAGE_BUCKET || process.env.STORAGE_BUCKET || 'revistaterra-media';

function store<T>(file: string, tag: string, fallback: () => T, normalize: (raw: unknown) => T) {
  const path = `partilhado/_config/${file}`;
  async function read(): Promise<T> {
    try {
      const { data } = await db().storage.from(BUCKET()).download(path);
      return data ? normalize(JSON.parse(await data.text())) : fallback();
    } catch {
      return fallback();
    }
  }
  const cached = unstable_cache(read, [tag, 'v1'], { tags: [tag], revalidate: 3600 });
  return {
    /** Para a home (com cache de 1 hora, limpa ao gravar). */
    get: async (): Promise<T> => {
      try {
        return normalize(await cached());
      } catch {
        return fallback();
      }
    },
    /** O que está guardado, sem a cache (para o painel). */
    read,
    /** Grava (já validado) e limpa a cache. `null` volta ao de origem. */
    save: async (value: unknown | null): Promise<T> => {
      const next = value === null ? fallback() : normalize(value);
      const { error } = await db().storage.from(BUCKET()).upload(path, Buffer.from(JSON.stringify(next)), { upsert: true, contentType: 'application/json' });
      if (error) throw new Error(error.message);
      try {
        revalidateTag(tag, { expire: 0 });
      } catch {
        /* fora de um pedido */
      }
      return next;
    },
  };
}

export const homeLayout = store<HomeLayout>('home-seccoes.json', 'home-layout', defaultHomeLayout, normalizeHomeLayout);
export const homeCategories = store<HomeCategories>('home-categorias.json', 'home-categories', defaultHomeCategories, normalizeHomeCategories);
export const homeOptions = store<HomeOptions>('home-opcoes.json', 'home-options', defaultHomeOptions, normalizeHomeOptions);
