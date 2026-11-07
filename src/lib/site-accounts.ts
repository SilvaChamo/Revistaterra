import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * As contas (Supabase Auth) são partilhadas por vários sites. A Revista Terra só reconhece as suas:
 * as que têm `app_metadata.revistaterra = { role, approved }`. app_metadata só o servidor (chave de serviço)
 * escreve, por isso ninguém se pode dar acesso a si próprio. Contas dos outros sites nunca entram aqui:
 * não entram no painel, não aparecem na lista e não podem ser editadas, repostas nem apagadas.
 */
export const SITE_KEY = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';

/** `colunista`: segundo nível, somado ao papel (ex.: Editor e colunista ao mesmo tempo). */
export type SiteAccess = { role: string; approved: boolean; colunista?: boolean };

export function siteAccess(user: Pick<User, 'app_metadata'> | null | undefined): SiteAccess | null {
  const raw = user?.app_metadata?.[SITE_KEY];
  if (!raw || typeof raw !== 'object') return null;
  const { role, approved, colunista } = raw as { role?: unknown; approved?: unknown; colunista?: unknown };
  return { role: typeof role === 'string' && role ? role : 'Subscritor', approved: approved === true, colunista: colunista === true };
}

export const isSiteAccount = (user: Pick<User, 'app_metadata'> | null | undefined) => siteAccess(user) !== null;

/** app_metadata com a parte do Revista Terra actualizada (o resto, que é de outros sites, fica intacto). */
export function withSiteAccess(user: Pick<User, 'app_metadata'>, patch: Partial<SiteAccess>) {
  const current = siteAccess(user) ?? { role: 'Subscritor', approved: false };
  const raw = (user.app_metadata?.[SITE_KEY] as Record<string, unknown> | undefined) ?? {}; // mantém campos extra (ex.: subscription)
  return { ...(user.app_metadata || {}), [SITE_KEY]: { ...raw, ...current, ...patch } };
}

/** A conta serve só o Revista Terra? (sem dados de outros sites, pode ser apagada de vez; senão só se retira o acesso) */
export function onlyThisSite(user: Pick<User, 'app_metadata'>) {
  const ignore = new Set(['provider', 'providers', SITE_KEY]);
  return Object.keys(user.app_metadata || {}).every((k) => ignore.has(k));
}

/** Utilizador pedido por id, mas só se for conta do Revista Terra; senão `null` (como se não existisse). */
export async function getSiteUser(db: SupabaseClient, id: string): Promise<User | null> {
  const { data, error } = await db.auth.admin.getUserById(id);
  if (error || !data?.user || !isSiteAccount(data.user)) return null;
  return data.user;
}

/** Utilizador do Revista Terra pelo e-mail (null se não existir ou se for de outro site). */
export async function findSiteUserByEmail(db: SupabaseClient, email: string): Promise<User | null> {
  const wanted = email.trim().toLowerCase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data) return null;
    const hit = data.users.find((u) => (u.email || '').toLowerCase() === wanted);
    if (hit) return isSiteAccount(hit) ? hit : null;
    if (data.users.length < 1000) return null;
  }
  return null;
}

/**
 * E-mail da conta deste site que corresponde a um nome de utilizador (user_metadata.username) ou, em alternativa,
 * à parte do e-mail antes do @. Só contas deste site; se houver mais do que uma, não adivinha (null).
 */
export async function findSiteEmailByUsername(db: SupabaseClient, username: string): Promise<string | null> {
  const wanted = username.trim().toLowerCase();
  if (!wanted) return null;
  const byName: User[] = [];
  const byLocal: User[] = [];
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data) return null;
    for (const u of data.users) {
      if (!isSiteAccount(u) || !u.email) continue;
      if (String(u.user_metadata?.username || '').trim().toLowerCase() === wanted) byName.push(u);
      else if (u.email.split('@')[0].toLowerCase() === wanted) byLocal.push(u);
    }
    if (data.users.length < 1000) break;
  }
  const hits = byName.length ? byName : byLocal;
  return hits.length === 1 ? (hits[0].email as string) : null;
}
