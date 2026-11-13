/**
 * scripts/importar-xml-limpo.js
 *
 * Importa APENAS notícias 100% legítimas da Revista Terra a partir dos ficheiros XML.
 * Filtra automaticamente:
 * - Posts de spam, casinos, slots, apostas, roleta, etc.
 * - Posts em idiomas estrangeiros (polaco, finlandês, russo, etc.)
 * - Janela temporal em que ocorreu o ataque de spam (agosto/setembro de 2026)
 *
 * Uso:
 *   node scripts/importar-xml-limpo.js          # Modo ensaio (lista as notícias limpas)
 *   node scripts/importar-xml-limpo.js --gravar # Grava directamente no Supabase
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';
const GRAVAR = process.argv.includes('--gravar');

const ATTACHMENT_FILES = [
  path.join(__dirname, '../wpxml/img.WP.2026-04-24.xml'),
  '/Volumes/Arquivo/WEB/APP/REVISTATERRA/XML/b51f03fc-88d1-44fb-bfeb-26d3ea7bfc7d.xml',
];

const POST_FILES = [
  path.join(__dirname, '../wpxml/noticias.WP.2026-04-24.xml'),
  '/Volumes/Arquivo/WEB/APP/REVISTATERRA/XML/b51f03fc-88d1-44fb-bfeb-26d3ea7bfc7d.xml',
];

const SPAM_REGEX = /\b(casino|casinos|cassino|cassinos|kasyno|cazino|cazinou|slot|slots|poker|roulette|roleta|baccarat|bacará|betting|aposta|apostas|apostar|aposte|spins|gambling|mrbet|khelostar|pelican|book of ra|starburst|realsbet|betnacional|bingo|stake|blaze|pbn|cw-check|mega-sena|lotofacil|gate777)\b/i;
const FOREIGN_SPAM = /[\u0400-\u04FF\u0900-\u097F\u0980-\u09FF\u0600-\u06FF\u4E00-\u9FFF]|\b(roku|graczy|zakładach|wypłaty|grać|gra|juego|juegos|jugadores|ganancias|retirar|dinero|en línea|retraits|joueurs|avis|jeux|kaszinó|pénz|letöltés|online kaszino|suomalainen|nettikasinot|kierratysta|arvostelu|peliautomaatti|trucos)\b/i;

function cleanString(str) {
  return String(str || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text) {
  return cleanString(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 200);
}

function isSpam(title, slug, date, content) {
  if (!title || title.length < 5) return true;
  if (SPAM_REGEX.test(title) || SPAM_REGEX.test(slug)) return true;
  if (FOREIGN_SPAM.test(title)) return true;
  if (SPAM_REGEX.test(content.slice(0, 1000))) return true;

  // Janela em que o WordPress foi inundado por bots de spam
  if (date.startsWith('2026-08') || date.startsWith('2026-09')) return true;

  // Verificação de Língua Portuguesa
  const sample = (title + ' ' + content.slice(0, 500)).toLowerCase();
  const hasPtConnectors = / [a-z]+ (de|da|do|em|na|no|para|com|por|que) [a-z]+/i.test(sample);
  if (!hasPtConnectors) return true;

  return false;
}

function loadAttachments() {
  const map = {};
  for (const file of ATTACHMENT_FILES) {
    if (!fs.existsSync(file)) continue;
    console.log(`Carregando imagens de anexo: ${path.basename(file)} ...`);
    const content = fs.readFileSync(file, 'utf8');
    const items = content.match(/<item>[\s\S]*?<\/item>/g) || [];
    for (const item of items) {
      const type = (item.match(/<wp:post_type>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/wp:post_type>/) || [])[1];
      if (type === 'attachment') {
        const id = (item.match(/<wp:post_id>(\d+)<\/wp:post_id>/) || [])[1];
        const url = (item.match(/<wp:attachment_url>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/wp:attachment_url>/) || item.match(/<guid isPermaLink="false">(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/guid>/) || [])[1];
        if (id && url) map[id] = cleanString(url);
      }
    }
  }
  return map;
}

function extractPostsFromFile(filePath, attachmentsMap) {
  if (!fs.existsSync(filePath)) return [];
  console.log(`Carregando notícias de: ${path.basename(filePath)} ...`);
  const content = fs.readFileSync(filePath, 'utf8');
  const items = content.match(/<item>[\s\S]*?<\/item>/g) || [];
  const valid = [];

  for (const item of items) {
    const type = (item.match(/<wp:post_type>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/wp:post_type>/) || [])[1];
    if (type !== 'post') continue;

    const status = (item.match(/<wp:status>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/wp:status>/) || [])[1];
    if (status !== 'publish' && status !== 'draft') continue;

    const rawTitle = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const title = cleanString(rawTitle);

    const rawSlug = (item.match(/<wp:post_name>([\s\S]*?)<\/wp:post_name>/) || [])[1] || '';
    let slug = cleanString(rawSlug);
    if (!slug) slug = slugify(title);

    const rawContent = (item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/) || [])[1] || '';
    const postContent = String(rawContent).replace(/<!\[CDATA\[|\]\]>/g, '').trim();

    const dateMatch = item.match(/<wp:post_date>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/wp:post_date>/)
      || item.match(/<pubDate>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pubDate>/);
    const postDate = dateMatch ? cleanString(dateMatch[1]) : new Date().toISOString();

    // 🛡️ Filtro Anti-Lixo rigoroso
    if (isSpam(title, slug, postDate, postContent)) continue;

    const rawExcerpt = (item.match(/<excerpt:encoded>([\s\S]*?)<\/excerpt:encoded>/) || [])[1] || '';
    let summary = cleanString(rawExcerpt);
    if (!summary) summary = stripHtml(postContent).slice(0, 350);

    const creatorMatch = item.match(/<dc:creator>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/dc:creator>/);
    const authorName = creatorMatch ? cleanString(creatorMatch[1]) : 'Revista Terra';

    // Imagem destacada
    let imageUrl = null;
    const thumbMatch = item.match(/<wp:meta_key>(?:<!\[CDATA\[)?_thumbnail_id(?:\]\]>)?<\/wp:meta_key>\s*<wp:meta_value>(?:<!\[CDATA\[)?(\d+)(?:\]\]>)?<\/wp:meta_value>/);
    if (thumbMatch && attachmentsMap[thumbMatch[1]]) {
      imageUrl = attachmentsMap[thumbMatch[1]];
    } else {
      const imgInContent = postContent.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
      if (imgInContent) imageUrl = imgInContent[1];
    }

    const catMatch = item.match(/<category domain="category"[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/category>/);
    let category = catMatch ? cleanString(catMatch[1]).toLowerCase() : 'agricultura';
    if (category === 'uncategorized' || !category) category = 'agricultura';

    valid.push({
      site_id: SITE_ID,
      slug,
      title,
      summary,
      content: postContent || `<p>${summary || title}</p>`,
      category,
      categories: [category],
      image_url: imageUrl,
      date: new Date(postDate).toISOString(),
      status: 'published',
      featured: false,
      author_name: authorName === 'admin' ? 'Revista Terra' : authorName,
      views: 0,
    });
  }

  return valid;
}

async function main() {
  console.log('============================================================');
  console.log('   IMPORTADOR LIMPO DE NOTÍCIAS (ANTI-LIXO) - REVISTA TERRA');
  console.log('============================================================\n');

  const attachmentsMap = loadAttachments();
  console.log(` Imagens de anexos mapeadas: ${Object.keys(attachmentsMap).length}\n`);

  const uniquePosts = {};
  for (const f of POST_FILES) {
    const list = extractPostsFromFile(f, attachmentsMap);
    for (const p of list) {
      if (!uniquePosts[p.slug]) {
        uniquePosts[p.slug] = p;
      }
    }
  }

  const posts = Object.values(uniquePosts).sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`\n Total de notícias LEGÍTIMAS da Revista Terra: ${posts.length}`);
  console.log(` Notícias com foto/imagem destacada: ${posts.filter(p => p.image_url).length}`);

  console.log('\n--- Lista de Notícias Legítimas a Importar ---');
  posts.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.date.slice(0, 10)}] ${p.title} (${p.category})`);
  });

  if (!GRAVAR) {
    console.log('\n⚠️  MODO ENSAIO: Nenhuma notícia foi gravada no Supabase.');
    console.log('Para gravar tudo no Supabase, execute:\n');
    console.log('   node scripts/importar-xml-limpo.js --gravar\n');
    return;
  }

  // Gravação real no Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Credenciais do Supabase não encontradas em .env.local');
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  console.log('\n Gravando notícias no Supabase...');
  let gravadas = 0;
  let erros = 0;

  for (const post of posts) {
    const { error } = await sb.from('news').upsert(post, { onConflict: 'site_id,slug' });
    if (error) {
      const { error: err2 } = await sb.from('news').upsert(post);
      if (err2) {
        console.error(`❌ Erro em "${post.title.slice(0, 30)}...":`, err2.message);
        erros++;
        continue;
      }
    }
    gravadas++;
  }

  console.log(`\n🎉 Concluído com sucesso! ${gravadas} notícias gravadas no Supabase (${erros} erros).`);
}

main().catch(err => {
  console.error('Falha:', err.message);
  process.exit(1);
});
