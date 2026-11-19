/**
 * Migra todas as notícias legítimas do WordPress (revistaterraonline.com) para o Supabase.
 * Aplica o mesmo filtro anti-spam do mu-plugin.
 * Usa upsert por slug — não duplica o que já existe.
 *
 * Uso: node scripts/migrar-wp-para-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const WP_SITE   = 'https://revistaterraonline.com';
const SITE_ID   = 'revistaterra';
const PER_PAGE  = 100;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================
// FILTRO ANTI-SPAM (igual ao mu-plugin)
// ============================================================

const SPAM_PATTERN = /casino|kasyno|cazino|cazinou|slot|slots|gokkasten|roulette|poker|bonus|bonussen|betting|apuesta|pbn-preflight|cw-check|khelostar|mrbet|spins|gambling|judi|sbobet|pragmatic|zeus|scatter|jackpot|esportes da sorte|bet365|1xbet|pelican|vox|fatpirate|olympe|winit|kingz|vasy|monixbet|yocasino|skycity|nvcasinos|lowen|zitbet|jeetwin|baji|mostbet|melbet|parimatch|pin-up|aviator|fortune tiger/i;
const FOREIGN_SPAM = /[\u0400-\u04FF\u0900-\u097F\u0980-\u09FF]|roku|graczy|zakładach|wypłaty|grać|juegos|jugadores|ganancias|retirar|apuestas|kaszinó|pénz/u;

function isSpam(title, slug, content = '') {
  if (SPAM_PATTERN.test(title) || SPAM_PATTERN.test(slug)) return true;
  if (FOREIGN_SPAM.test(title)) return true;
  if (SPAM_PATTERN.test(content.slice(0, 1000))) return true;
  return false;
}

// ============================================================
// BUSCAR DO WORDPRESS
// ============================================================

async function fetchPage(page) {
  const url = `${WP_SITE}/wp-json/wp/v2/posts?per_page=${PER_PAGE}&page=${page}&orderby=date&order=desc&status=publish&_embed=wp:featuredmedia,wp:term,author&_fields=id,slug,title,excerpt,content,date_gmt,modified_gmt,status,_embedded,_links`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(60000),
  });
  if (res.status === 400 || res.status === 404) return { rows: [], totalPages: 0 };
  if (!res.ok) throw new Error(`HTTP ${res.status} na página ${page}`);
  const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
  return { rows: await res.json(), totalPages };
}

function extractImageUrl(post) {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (media?.source_url) return media.source_url;
  if (media?.media_details?.sizes?.large?.source_url) return media.media_details.sizes.large.source_url;
  // fallback: primeira imagem no conteúdo
  const match = post.content?.rendered?.match(/src="([^"]+\.(jpg|jpeg|png|webp))"/i);
  return match ? match[1] : null;
}

function extractCategory(post) {
  const terms = post._embedded?.['wp:term'] || [];
  for (const group of terms) {
    for (const term of group) {
      if (term.taxonomy === 'category' && term.slug !== 'uncategorized') {
        return term.name.toLowerCase();
      }
    }
  }
  return 'sem categoria';
}

function extractCategories(post) {
  const terms = post._embedded?.['wp:term'] || [];
  const result = [];
  for (const group of terms) {
    for (const term of group) {
      if (term.taxonomy === 'category' && term.slug !== 'uncategorized') {
        result.push({ id: term.id, name: term.name, slug: term.slug });
      }
    }
  }
  return result;
}

function extractAuthor(post) {
  return post._embedded?.author?.[0]?.name || 'Revista Terra';
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function buildRecord(post) {
  const title   = post.title?.rendered?.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c)) || '';
  const slug    = post.slug || '';
  const content = post.content?.rendered || '';
  const excerpt = stripHtml(post.excerpt?.rendered || '').slice(0, 300) || stripHtml(content).slice(0, 160);

  return {
    site_id:     SITE_ID,
    slug,
    title,
    summary:     excerpt || title,
    content,
    category:    extractCategory(post),
    categories:  extractCategories(post),
    image_url:   extractImageUrl(post),
    author_name: extractAuthor(post),
    date:        post.date_gmt ? `${post.date_gmt}Z` : new Date().toISOString(),
    updated_at:  post.modified_gmt ? `${post.modified_gmt}Z` : new Date().toISOString(),
    status:      'published',
    views:       0,
    featured:    false,
  };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('=== Migração WordPress → Supabase ===\n');

  // Slugs já existentes no Supabase (para evitar duplicados)
  console.log('A carregar slugs existentes no Supabase...');
  const existing = new Set();
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('news')
      .select('slug')
      .eq('site_id', SITE_ID)
      .range(offset, offset + 999);
    if (error) { console.error('Erro Supabase:', error.message); break; }
    if (!data?.length) break;
    data.forEach(r => existing.add(r.slug));
    if (data.length < 1000) break;
    offset += 1000;
  }
  console.log(`  ${existing.size} notícias já existentes no Supabase.\n`);

  // Percorrer todas as páginas do WordPress
  let page = 1;
  let totalPages = 1;
  let inseridos = 0;
  let spam = 0;
  let duplicados = 0;
  let erros = 0;
  const batch = [];

  do {
    process.stdout.write(`Página ${page}/${totalPages}... `);
    let result;
    try {
      result = await fetchPage(page);
    } catch (e) {
      console.error(`Erro: ${e.message}`);
      erros++;
      page++;
      continue;
    }

    const { rows, totalPages: tp } = result;
    totalPages = tp;

    if (!rows.length) break;

    for (const post of rows) {
      const title   = post.title?.rendered || '';
      const slug    = post.slug || '';
      const content = post.content?.rendered || '';

      if (isSpam(title, slug, content)) { spam++; continue; }
      if (existing.has(slug))           { duplicados++; continue; }

      batch.push(buildRecord(post));
    }

    process.stdout.write(`${rows.length} lidos | batch: ${batch.length}\n`);

    // Enviar em lotes de 50
    while (batch.length >= 50) {
      const chunk = batch.splice(0, 50);
      const { error } = await supabase.from('news').upsert(chunk, { onConflict: 'site_id,slug' });
      if (error) {
        console.error(`  ⚠ Erro ao inserir lote: ${error.message}`);
        erros++;
      } else {
        inseridos += chunk.length;
        process.stdout.write(`  ✓ ${inseridos} inseridos até agora\n`);
      }
    }

    page++;
    // Pausa para não sobrecarregar o WP
    await new Promise(r => setTimeout(r, 300));

  } while (page <= totalPages);

  // Enviar o que ficou no batch
  if (batch.length) {
    const { error } = await supabase.from('news').upsert(batch, { onConflict: 'site_id,slug' });
    if (error) {
      console.error(`  ⚠ Erro no lote final: ${error.message}`);
      erros++;
    } else {
      inseridos += batch.length;
    }
  }

  console.log('\n=== Concluído ===');
  console.log(`  Inseridos/actualizados : ${inseridos}`);
  console.log(`  Spam ignorados         : ${spam}`);
  console.log(`  Já existiam            : ${duplicados}`);
  console.log(`  Erros                  : ${erros}`);
}

main().catch(e => { console.error(e); process.exit(1); });
