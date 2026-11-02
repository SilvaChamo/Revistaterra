/**
 * Importa as notícias da Revista Terra (src/data/terra.json) para a tabela `news`, com site_id = revistaterra.
 * O texto completo vem da API pública do site original. Não duplica: salta as que já existem (mesmo slug).
 *
 *   node scripts/importar-noticias-terra.js          # ensaio, não grava nada
 *   node scripts/importar-noticias-terra.js --gravar # grava
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';
const GRAVAR = process.argv.includes('--gravar');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const dados = JSON.parse(fs.readFileSync('src/data/terra.json', 'utf8'));

const clean = (html) => String(html || '').replace(/<(script|style|iframe)\b[\s\S]*?<\/\1>/gi, '').replace(/\son\w+="[^"]*"/gi, '').replace(/\s+/g, ' ').trim();
const strip = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

async function api(tipo, slug) {
  const u = `https://revistaterraonline.com/wp-json/wp/v2/${tipo}?slug=${encodeURIComponent(slug)}&_fields=date,title,content,excerpt`;
  const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!r.ok) return null;
  const j = await r.json();
  return j[0] || null;
}

/** A tabela news exige o site registado na tabela sites (chave estrangeira). */
async function garantirSite() {
  const { error } = await sb.from('sites').upsert({
    id: SITE_ID,
    name: 'Revista Terra',
    domain: 'revistaterraonline.com',
    storage_bucket: process.env.STORAGE_BUCKET || process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'entrecampos-media',
    storage_driver: process.env.STORAGE_DRIVER || 'supabase',
    is_active: true,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error('sites: ' + error.message);
}

(async () => {
  if (GRAVAR) await garantirSite();
  const itens = [];
  const vistos = new Set();
  for (const [grupo, lista] of [['hero', dados.hero], ['cards', dados.cards]]) {
    for (const c of lista) {
      if (vistos.has(c.url)) continue;
      vistos.add(c.url);
      itens.push({ ...c, destaque: grupo === 'hero' });
    }
  }
  const existentes = new Set(((await sb.from('news').select('slug').eq('site_id', SITE_ID)).data || []).map((r) => r.slug));

  const linhas = [];
  let semTexto = 0;
  for (const c of itens) {
    const partes = new URL(c.url).pathname.split('/').filter(Boolean);
    const slug = decodeURIComponent(partes[partes.length - 1] || '');
    if (!slug || existentes.has(slug)) continue;
    let post = null;
    for (const t of [partes[0], 'posts']) { try { post = await api(t, slug); } catch {} if (post) break; }
    if (!post) semTexto++;
    const conteudo = clean(post?.content?.rendered) || `<p>${c.excerpt || c.title}</p>`;
    const resumo = strip(post?.excerpt?.rendered) || c.excerpt || '';
    const categoria = (c.category || 'fora de campo').toLowerCase();
    linhas.push({
      site_id: SITE_ID,
      title: strip(post?.title?.rendered) || c.title,
      slug,
      summary: resumo.slice(0, 400),
      content: conteudo,
      category: categoria,
      categories: [categoria],
      image_url: c.image || null,
      date: (post?.date ? post.date : '2026-01-01T00:00:00').slice(0, 19) + '+00:00',
      status: 'published',
      featured: !!c.destaque,
      author_name: 'Revista Terra',
      views: 0,
    });
  }
  console.log(`notícias a importar: ${linhas.length} | já existiam: ${itens.length - linhas.length - semTexto >= 0 ? existentes.size : 0} | sem texto completo (usado o resumo): ${semTexto}`);
  const media = Math.round(linhas.reduce((s, l) => s + l.content.length, 0) / Math.max(1, linhas.length));
  console.log(`tamanho médio do texto: ${media} caracteres | com imagem: ${linhas.filter((l) => l.image_url).length}`);
  console.log('exemplo:', JSON.stringify({ ...linhas[0], content: linhas[0]?.content.slice(0, 90) + '…' }, null, 1).slice(0, 700));
  if (!GRAVAR) { console.log('\n(ensaio: nada foi gravado. Use --gravar)'); return; }
  let ok = 0;
  for (const l of linhas) {
    const { error } = await sb.from('news').insert(l);
    if (error) console.log('ERRO', l.slug.slice(0, 40), '→', error.message); else ok++;
  }
  console.log(`gravadas: ${ok} de ${linhas.length}`);
})().catch((e) => { console.error('Falha:', e.message); process.exit(1); });
