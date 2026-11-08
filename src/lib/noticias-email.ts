import { createClient } from '@supabase/supabase-js';
import sanitizeHtml from 'sanitize-html';
import { compressImageBuffer } from '@/lib/compress-image-server';
import { fetchNewsMails, mailConfigured, type NewsMail } from '@/lib/redaccao-mail';
import { parseNewsDocx, plainText, type ParsedNews } from '@/lib/noticias-docx';
import { NETWORKS, loadSettings, readRow, shareNews, writeRow } from '@/lib/social';
import { refreshSite } from '@/lib/refresh-site';

/**
 * Notícias por e-mail: a redacção envia um Word no modelo fixo; cada notícia é criada no site.
 *  - com foto, verificada e sem dúvidas → publicada já, ou agendada se tiver data futura;
 *  - sem foto, ou com qualquer dúvida → fica nos pendentes, para pôr a foto e publicar;
 *  - ao publicar (já ou na hora agendada), segue para as redes sociais ligadas.
 */

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';
const SETTINGS_SLUG = 'revistaterra_noticias_email';
const LOG_SLUG = 'revistaterra_noticias_email_log';
const BUCKET = () => process.env.NEXT_PUBLIC_STORAGE_BUCKET || process.env.STORAGE_BUCKET || 'revistaterra-media';

export type EmailSettings = {
  /** Remetentes autorizados: um endereço completo ou «@dominio.com». */
  senders: string[];
  /** Só publica sozinho se o servidor de e-mail confirmar o remetente (SPF/DKIM); senão fica nos pendentes. */
  requireVerified: boolean;
  /** Partilha nas redes sociais ligadas ao publicar. */
  share: boolean;
};
export type LogItem = { title: string; status: 'published' | 'scheduled' | 'pending' | 'erro'; note: string };
export type LogEntry = { at: string; from: string; subject: string; items: LogItem[]; note?: string };
type Log = { done: string[]; entries: LogEntry[] };

export async function loadEmailSettings(): Promise<EmailSettings> {
  const row = await readRow<Partial<EmailSettings>>(SETTINGS_SLUG);
  return {
    senders: Array.isArray(row?.senders) ? row!.senders.map((s) => String(s).trim().toLowerCase()).filter(Boolean).slice(0, 30) : [],
    requireVerified: row?.requireVerified !== false,
    share: row?.share !== false,
  };
}

export async function saveEmailSettings(input: Partial<EmailSettings>): Promise<EmailSettings> {
  const cur = await loadEmailSettings();
  const senders = Array.isArray(input.senders)
    ? [...new Set(input.senders.map((s) => String(s).trim().toLowerCase()).filter((s) => /^(@[a-z0-9.-]+\.[a-z]{2,}|[^\s@]+@[a-z0-9.-]+\.[a-z]{2,})$/.test(s)))].slice(0, 30)
    : cur.senders;
  const next: EmailSettings = { senders, requireVerified: input.requireVerified ?? cur.requireVerified, share: input.share ?? cur.share };
  await writeRow(SETTINGS_SLUG, next);
  return next;
}

export async function loadEmailLog(): Promise<Log> {
  const row = await readRow<Partial<Log>>(LOG_SLUG);
  return { done: Array.isArray(row?.done) ? row!.done : [], entries: Array.isArray(row?.entries) ? row!.entries : [] };
}

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });

const KNOWN = ['Agricultura', 'Mercado', 'Economia', 'Meio Ambiente', 'Clima', 'Tempo', 'Pesca', 'Energia', 'Sociedade', 'Política', 'Internacional', 'Fora de Campo'];
const key = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const slugify = (v: string) => key(v).slice(0, 80) || 'noticia';

async function uniqueSlug(base: string): Promise<string> {
  const { data } = await db().from('news').select('slug').eq('site_id', SITE_ID).like('slug', `${base}%`).limit(200);
  const taken = new Set((data ?? []).map((r) => String(r.slug)));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 500; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  return `${base}-${Date.now()}`;
}

async function uploadPhoto(buf: Buffer, contentType: string, slug: string): Promise<string | null> {
  if (!/^image\/(jpe?g|png|webp)$/i.test(contentType)) return null;
  try {
    const packed = await compressImageBuffer(buf, contentType.toLowerCase());
    const name = `${slug}-${Math.random().toString(36).slice(2, 7)}.${packed.ext}`;
    const store = db().storage.from(BUCKET());
    const { error } = await store.upload(name, packed.buffer, { contentType: packed.mime, upsert: false, cacheControl: '31536000' });
    if (error) return null;
    return store.getPublicUrl(name).data.publicUrl;
  } catch {
    return null;
  }
}

/** Grava; se a tabela não tem alguma coluna opcional, repete sem ela. */
async function insertNews(row: Record<string, unknown>) {
  const body = { ...row };
  for (let i = 0; i < 6; i++) {
    const res = await db().from('news').insert([body]).select('id,slug').single();
    const col = /Could not find the '([^']+)' column/i.exec(res.error?.message || '')?.[1];
    if (!res.error || !col || !(col in body) || col === 'status') return res;
    delete body[col];
  }
  return { data: null, error: { message: 'Colunas em falta na tabela news.' } };
}

async function shareEverywhere(id: string): Promise<string> {
  try {
    const s = await loadSettings();
    const wanted = NETWORKS.filter((n) => s[n]);
    if (!wanted.length) return '';
    const res = await shareNews(id, wanted);
    const ok = res.filter((r) => r.status === 'ok').length;
    const bad = res.filter((r) => r.status === 'erro').length;
    return ok || bad ? ` Redes: ${ok} publicada(s)${bad ? `, ${bad} com erro` : ''}.` : '';
  } catch {
    return ' Redes: falhou o envio.';
  }
}

async function createOne(n: ParsedNews, mail: NewsMail, settings: EmailSettings): Promise<LogItem> {
  const title = n.title || '(sem título)';
  try {
    const problems = [...n.problems];
    if (/^opini[aã]o$/i.test(n.category.trim())) problems.push('Opinião é só para colunistas');
    if (!n.title || problems.some((p) => /Sem título|Sem texto|Opinião/.test(p))) {
      return { title, status: 'erro', note: `Não criada: ${problems.join('; ')}.` };
    }
    const label = KNOWN.find((c) => key(c) === key(n.category)) ?? (n.category.trim() ? n.category.trim() : 'Agricultura');
    const slug = await uniqueSlug(slugify(n.title));

    let photoUrl: string | null = null;
    if (n.photo) photoUrl = await uploadPhoto(n.photo.buffer, n.photo.contentType, slug);
    else if (n.photoName) {
      const wanted = n.photoName.trim().toLowerCase();
      const file = mail.images.find((f) => f.filename.toLowerCase() === wanted) ?? mail.images.find((f) => f.filename.toLowerCase().startsWith(wanted.replace(/\.[a-z]+$/, '')));
      if (file) photoUrl = await uploadPhoto(file.buffer, file.contentType, slug);
      else problems.push(`Foto «${n.photoName}» não veio anexada ao e-mail`);
    }
    if (!photoUrl) problems.push('Sem foto');

    const trusted = !settings.requireVerified || mail.verified;
    if (!trusted) problems.push('Remetente não confirmado pelo servidor de e-mail (SPF/DKIM)');

    const now = new Date();
    const later = n.when && Date.parse(n.when) > now.getTime() ? n.when : null;
    const status = problems.length ? 'pending' : later ? 'scheduled' : 'published';
    const summary = n.summary || plainText(n.html).slice(0, 200);
    const cat = label.toLowerCase();
    const { data, error } = await insertNews({
      site_id: SITE_ID,
      title: n.title,
      slug,
      content: sanitizeHtml(n.html),
      summary,
      category: cat,
      categories: [cat],
      image_url: photoUrl || '',
      date: status === 'scheduled' ? later : now.toISOString(),
      status,
      featured: false,
      author_name: 'Redacção',
    });
    if (error || !data) return { title, status: 'erro', note: `Não gravada: ${error?.message ?? 'erro'}` };

    refreshSite();
    if (status === 'published') return { title, status, note: `Publicada.${settings.share ? await shareEverywhere(String((data as { id: string }).id)) : ''}` };
    if (status === 'scheduled') return { title, status, note: `Agendada (${new Date(later!).toLocaleString('pt-PT', { timeZone: 'Africa/Maputo' })}); segue para as redes quando for publicada.` };
    return { title, status, note: `Nos pendentes: ${problems.join('; ')}.${n.when ? ` Data pedida: ${new Date(n.when).toLocaleString('pt-PT', { timeZone: 'Africa/Maputo' })}.` : ''}` };
  } catch (e) {
    return { title, status: 'erro', note: e instanceof Error ? e.message : 'Erro' };
  }
}

export type ProcessResult = { configured: boolean; senders: number; mails: number; created: number; pending: number; failed: number };

/** Lê os e-mails novos dos remetentes autorizados e cria as notícias dos Word. */
export async function processMailbox(max = 3): Promise<ProcessResult> {
  const settings = await loadEmailSettings();
  const result: ProcessResult = { configured: mailConfigured(), senders: settings.senders.length, mails: 0, created: 0, pending: 0, failed: 0 };
  if (!result.configured || !settings.senders.length) return result;

  const log = await loadEmailLog();
  const mails = await fetchNewsMails(settings.senders, new Set(log.done), max);
  for (const mail of mails) {
    const entry: LogEntry = { at: new Date().toISOString(), from: mail.from, subject: mail.subject, items: [] };
    try {
      for (const doc of mail.docs) {
        const parsed = await parseNewsDocx(doc.buffer);
        if (!parsed.length) entry.items.push({ title: doc.filename, status: 'erro', note: 'Nenhuma notícia encontrada: o documento deve ter «Título:», «Categoria:», «Descrição:», «Foto:», «Data:» e «Texto:».' });
        for (const n of parsed) entry.items.push(await createOne(n, mail, settings));
      }
    } catch (e) {
      entry.note = e instanceof Error ? e.message : 'Erro ao ler o documento.';
    }
    result.mails += 1;
    for (const i of entry.items) {
      if (i.status === 'erro') result.failed += 1;
      else if (i.status === 'pending') result.pending += 1;
      else result.created += 1;
    }
    log.done = [...log.done, mail.key].slice(-300);
    log.entries = [entry, ...log.entries].slice(0, 40);
    await writeRow(LOG_SLUG, log);
  }
  return result;
}

/** Publica as agendadas cuja hora já chegou e partilha-as nas redes. */
export async function publishDue(): Promise<{ published: number }> {
  const { data } = await db().from('news').select('id').eq('site_id', SITE_ID).eq('status', 'scheduled').lte('date', new Date().toISOString()).limit(20);
  const ids = (data ?? []).map((r) => String(r.id));
  if (!ids.length) return { published: 0 };
  const { error } = await db().from('news').update({ status: 'published' }).eq('site_id', SITE_ID).in('id', ids);
  if (error) throw new Error(error.message);
  refreshSite();
  const settings = await loadEmailSettings();
  if (settings.share) for (const id of ids) await shareEverywhere(id);
  return { published: ids.length };
}
