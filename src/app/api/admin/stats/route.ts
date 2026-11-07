import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-guard';
import { SITE_ID, isForeignPath, isLocalHost } from '@/lib/site-hits';

export const dynamic = 'force-dynamic';

const PAGE = 1000;
const MAX_ROWS = 40000;
const TZ = 'Africa/Maputo';
const ENGINES: [string, RegExp][] = [
  ['Google', /(^|\.)google\./i],
  ['Bing', /(^|\.)bing\./i],
  ['Yahoo', /(^|\.)yahoo\./i],
  ['DuckDuckGo', /duckduckgo\./i],
  ['Yandex', /yandex\./i],
  ['Ecosia', /ecosia\./i],
  ['Baidu', /baidu\./i],
];

type Hit = { path: string; news_slug: string | null; visitor: string; country: string | null; device: string | null; referrer: string | null; created_at: string };

const dayOf = (iso: string | number | Date) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: TZ }); // AAAA-MM-DD
const top = <T extends string>(map: Map<T, number>, n = 10) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

/**
 * Estatísticas reais da Revista Terra (visitas registadas em `site_hits` deste site, sem páginas do painel nem de
 * desenvolvimento). Devolve o último ano: o painel escolhe o período do gráfico. Só quem vê estatísticas.
 */
export async function GET(req: NextRequest) {
  const guard = await requireAuth('ver_estatisticas', 'acesso_total');
  if ('error' in guard) return guard.error;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get('dias')) || 30, 1), 365);
  const periodo = Math.min(Math.max(Number(req.nextUrl.searchParams.get('periodo')) || 30, 1), 365); // período das listas (páginas, países, origens)

  const rows: Hit[] = [];
  const since = new Date(Date.now() - 366 * 86400000).toISOString();
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await supabase
      .from('site_hits')
      .select('path,news_slug,visitor,country,device,referrer,created_at')
      .eq('site_id', SITE_ID)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    rows.push(...(data as Hit[]));
    if (!data || data.length < PAGE) break;
  }
  const hits = rows.filter((h) => !isForeignPath(h.path) && !(h.referrer && isLocalHost(h.referrer)));

  const now = Date.now();
  const today = dayOf(now);
  const yesterday = dayOf(now - 86400000);
  const year = today.slice(0, 4);
  const cut = (n: number) => dayOf(now - (n - 1) * 86400000); // primeiro dia do período de n dias
  const from7 = cut(7);
  const from30 = cut(30);
  const fromP = cut(periodo);
  const fiveMin = now - 5 * 60000;

  type Period = { views: number; visitors: Set<string> };
  const mk = (): Period => ({ views: 0, visitors: new Set() });
  const periods = { today: mk(), yesterday: mk(), last7: mk(), last30: mk(), year: mk(), total: mk() };
  const daily = new Map<string, { views: number; visitors: Set<string> }>();
  const slugs = new Map<string, number>();
  const pagesMap = new Map<string, number>();
  const countries = new Map<string, Set<string>>();
  const devices = new Map<string, number>();
  const referrers = new Map<string, number>();
  const engines = new Map<string, number>();
  const sessions = new Map<string, { first: number; last: number; n: number }>(); // por dia+visitante
  const online = new Set<string>();

  for (const h of hits) {
    const t = new Date(h.created_at).getTime();
    const d = dayOf(t);
    const add = (p: Period) => { p.views++; p.visitors.add(h.visitor); };
    add(periods.total);
    if (d.startsWith(year)) add(periods.year);
    if (d >= from30) add(periods.last30);
    if (d >= from7) add(periods.last7);
    if (d === today) add(periods.today);
    if (d === yesterday) add(periods.yesterday);

    const day = daily.get(d) ?? mk();
    day.views++; day.visitors.add(h.visitor); daily.set(d, day);
    if (t >= fiveMin) online.add(h.visitor);

    const key = `${d}|${h.visitor}`;
    const s = sessions.get(key);
    sessions.set(key, s ? { first: Math.min(s.first, t), last: Math.max(s.last, t), n: s.n + 1 } : { first: t, last: t, n: 1 });

    if (d < fromP) continue;
    pagesMap.set(h.path, (pagesMap.get(h.path) ?? 0) + 1);
    if (h.news_slug) slugs.set(h.news_slug, (slugs.get(h.news_slug) ?? 0) + 1);
    const c = h.country || '??';
    (countries.get(c) ?? countries.set(c, new Set()).get(c)!).add(h.visitor + d);
    const dv = h.device || 'desktop';
    devices.set(dv, (devices.get(dv) ?? 0) + 1);
    if (h.referrer) {
      referrers.set(h.referrer, (referrers.get(h.referrer) ?? 0) + 1);
      const eng = ENGINES.find(([, re]) => re.test(h.referrer!));
      if (eng) engines.set(eng[0], (engines.get(eng[0]) ?? 0) + 1);
    }
  }

  const all = [...sessions.values()];
  const bounce = all.length ? Math.round((all.filter((s) => s.n === 1).length / all.length) * 1000) / 10 : 0;
  const multi = all.filter((s) => s.n > 1);
  const avgSession = multi.length ? Math.round(multi.reduce((a, s) => a + (s.last - s.first), 0) / multi.length / 1000) : 0;

  const topSlugs = top(slugs);
  const titles = new Map<string, string>();
  if (topSlugs.length) {
    const { data } = await supabase.from('news').select('slug,title').eq('site_id', SITE_ID).in('slug', topSlugs.map(([s]) => s));
    for (const n of (data ?? []) as { slug: string; title: string }[]) titles.set(n.slug, n.title);
  }

  const out = (p: Period) => ({ views: p.views, visitors: p.visitors.size });
  const series: { day: string; views: number; visitors: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = dayOf(now - i * 86400000);
    const v = daily.get(d);
    series.push({ day: d, views: v?.views ?? 0, visitors: v?.visitors.size ?? 0 });
  }

  return NextResponse.json({
    online: online.size,
    daily: series,
    summary: {
      today: out(periods.today), yesterday: out(periods.yesterday), last7: out(periods.last7),
      last30: out(periods.last30), year: out(periods.year), total: out(periods.total),
      bounceRate: bounce, avgSessionSeconds: avgSession,
    },
    searchEngines: [...engines.entries()].sort((a, b) => b[1] - a[1]).map(([name, total]) => ({ name, total })),
    searchEnginesTotal: [...engines.values()].reduce((a, b) => a + b, 0),
    pages: top(pagesMap, 15).map(([path, views]) => ({ path, views })),
    news: topSlugs.map(([slug, views]) => ({ slug, title: titles.get(slug) || slug, views })),
    countries: top(new Map([...countries].map(([k, v]) => [k, v.size] as [string, number])), 50).map(([country, visitors]) => ({ country, visitors })),
    devices: top(devices).map(([device, views]) => ({ device, views })),
    referrers: top(referrers).map(([referrer, views]) => ({ referrer, views })),
    recent: hits.slice(0, 200).map((h) => ({ path: h.path, country: h.country, device: h.device, referrer: h.referrer, at: h.created_at })),
  });
}
