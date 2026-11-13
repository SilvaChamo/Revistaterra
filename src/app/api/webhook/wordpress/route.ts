import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual, createHmac } from 'crypto';
import { refreshSite } from '@/lib/refresh-site';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

function stripTags(html: string) {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/\s+/g, ' ')
    .trim();
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WEBHOOK_SECRET || process.env.CRON_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  if (expected.length !== signatureHeader.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

function extractImageUrl(fi: unknown): string | null {
  if (!fi || typeof fi !== 'object') return null;
  const obj = fi as Record<string, unknown>;
  return (obj.url as string) || (obj.url_large as string) || null;
}

function extractCategory(cats: unknown): string {
  if (Array.isArray(cats) && cats.length > 0 && cats[0]?.name) {
    return String(cats[0].name);
  }
  return 'Fora de Campo';
}

function extractAuthor(author: unknown): string {
  if (author && typeof author === 'object') {
    const a = author as Record<string, unknown>;
    return String(a.name || 'Redacção').trim();
  }
  return 'Redacção';
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-wp-signature');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido.' }, { status: 400 });
  }

  const action = String(body.action || 'upsert').toLowerCase();
  const title = stripTags(String(body.title || '')).trim();
  const slug = slugify(String(body.slug || title));

  if (!title || !slug) {
    return NextResponse.json({ error: 'Título e slug são obrigatórios.' }, { status: 400 });
  }

  if (action === 'delete' || action === 'trash') {
    const { error } = await supabaseAdmin
      .from('news')
      .update({ status: 'trash' })
      .eq('site_id', SITE_ID)
      .eq('slug', slug);
    if (error) {
      console.error('[webhook/wp] delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    refreshSite();
    return NextResponse.json({ success: true, action: 'trashed', slug });
  }

  const content = String(body.content_html || body.content || '');
  const rawExcerpt = stripTags(String(body.excerpt || ''));
  const summary = rawExcerpt.length > 20
    ? (rawExcerpt.length > 200 ? rawExcerpt.slice(0, 197) + '…' : rawExcerpt)
    : (stripTags(content).slice(0, 197) + '…');

  const category = extractCategory(body.categories);
  const image_url = extractImageUrl(body.featured_image);
  const date = String(body.date || new Date().toISOString());
  const author_name = extractAuthor(body.author);

  const payload: Record<string, unknown> = {
    site_id: SITE_ID,
    title,
    slug,
    content,
    summary,
    category,
    image_url,
    date,
    author_name,
    status: 'published',
  };

  const { data: existing } = await supabaseAdmin
    .from('news')
    .select('id')
    .eq('site_id', SITE_ID)
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from('news')
      .update(payload)
      .eq('id', existing.id);
    if (error) {
      console.error('[webhook/wp] update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    refreshSite();
    return NextResponse.json({ success: true, action: 'updated', slug, id: existing.id });
  } else {
    const { data, error } = await supabaseAdmin
      .from('news')
      .insert([payload])
      .select('id')
      .single();
    if (error) {
      console.error('[webhook/wp] insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    refreshSite();
    return NextResponse.json({ success: true, action: 'created', slug, id: data?.id });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/webhook/wordpress',
    site_id: SITE_ID,
    message: 'Endpoint activo. Envie POST com assinatura HMAC-SHA256.',
  });
}
