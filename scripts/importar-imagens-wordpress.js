/**
 * Importa para o armazenamento deste projecto (bucket revistaterra-media, pasta news/wp/) as fotos que as notícias
 * ainda lêem do WordPress (…/wp-content/uploads/…), na foto de destaque e no texto, e actualiza as notícias para
 * o novo endereço. Assim nada depende do WordPress quando ele for eliminado. Só mexe nas notícias deste site.
 *
 *   node scripts/importar-imagens-wordpress.js           # só mostra o que faria (simulação)
 *   node scripts/importar-imagens-wordpress.js --apply   # copia as fotos e actualiza as notícias
 *
 * Em --apply guarda scripts/migracao-wordpress-mapa.json (endereço antigo -> novo) para se poder reverter.
 * Fotos que já não existem no WordPress ficam como estão e são listadas no fim.
 */
const path = require('path');
const fs = require('fs');

const WP_URL = /https?:\/\/(?:www\.)?(?:revistaterraonline\.com|revistaterra\.co\.mz)\/wp-content\/uploads\/[^\s"'<>)\]\\]+/gi;

/** Endereços de fotos do WordPress que aparecem num texto. */
function findWpUrls(text) {
  return [...new Set(String(text || '').match(WP_URL) || [])];
}

/** Nome do ficheiro no armazenamento: o caminho do WordPress achatado (ano-mês-nome), sem caracteres problemáticos. */
function destName(url) {
  const rel = decodeURIComponent(url.split('/wp-content/uploads/')[1].split(/[?#]/)[0]);
  return 'news/wp/' + rel.replace(/\//g, '-').replace(/[^\w.\-]/g, '_');
}

/** Troca no texto cada endereço antigo pelo novo (os mais compridos primeiro, para um não estragar outro). */
function replaceUrls(text, map) {
  let out = String(text || '');
  for (const old of Object.keys(map).sort((a, b) => b.length - a.length)) out = out.split(old).join(map[old]);
  return out;
}

module.exports = { findWpUrls, destName, replaceUrls };

if (require.main === module) {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local'), quiet: true });
  const { createClient } = require('@supabase/supabase-js');
  const SITE = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';
  const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || process.env.STORAGE_BUCKET || 'revistaterra-media';
  const APPLY = process.argv.includes('--apply');
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  (async () => {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from('news').select('id,slug,image_url,content').eq('site_id', SITE).order('id').range(from, from + 999);
      if (error) throw error;
      rows.push(...data);
      if (data.length < 1000) break;
    }
    const affected = rows.filter((r) => findWpUrls(r.image_url).length || findWpUrls(r.content).length);
    const urls = [...new Set(affected.flatMap((r) => [...findWpUrls(r.image_url), ...findWpUrls(r.content)]))];
    console.log(`${affected.length} notícias com fotos do WordPress, ${urls.length} fotos${APPLY ? '' : ' (simulação, nada é alterado)'}`);
    if (!APPLY) { urls.forEach((u) => console.log(` ${u} -> ${BUCKET}/${destName(u)}`)); return; }

    const map = {};
    const failed = [];
    for (const url of urls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
        const type = res.headers.get('content-type') || '';
        if (!res.ok || !type.startsWith('image/')) throw new Error(`${res.status} ${type}`);
        const dest = destName(url);
        const { error } = await sb.storage.from(BUCKET).upload(dest, Buffer.from(await res.arrayBuffer()), { contentType: type, upsert: true });
        if (error) throw new Error(error.message);
        map[url] = sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
        console.log(` ok ${url}`);
      } catch (e) {
        failed.push(url);
        console.log(` FALHA ${url}: ${e.message}`);
      }
    }
    fs.writeFileSync(path.resolve(__dirname, 'migracao-wordpress-mapa.json'), JSON.stringify(map, null, 2));
    let updated = 0;
    for (const r of affected) {
      const patch = {};
      const img = replaceUrls(r.image_url, map);
      const body = replaceUrls(r.content, map);
      if (img !== r.image_url) patch.image_url = img;
      if (body !== r.content) patch.content = body;
      if (!Object.keys(patch).length) continue;
      const { error } = await sb.from('news').update(patch).eq('id', r.id).eq('site_id', SITE);
      if (error) console.log('FALHA update', r.slug, error.message); else updated++;
    }
    console.log(`${Object.keys(map).length} fotos importadas, ${updated} notícias actualizadas, ${failed.length} fotos por importar.`);
    failed.forEach((u) => console.log(' por importar:', u));
  })().catch((e) => { console.error(e); process.exit(1); });
}
