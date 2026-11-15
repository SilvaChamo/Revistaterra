import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { findWpUrls, destName, replaceUrls } = createRequire(import.meta.url)('../scripts/importar-imagens-wordpress.js');

const html = '<p><img src="https://revistaterraonline.com/wp-content/uploads/2026/10/Retoma.jpg" alt="x"></p><img src=\'http://revistaterra.co.mz/wp-content/uploads/2021/06/A%20b.jpg\'><img src="https://xyz.supabase.co/storage/v1/object/public/m/ok.jpg">';

test('encontra só fotos do WordPress', () => {
  assert.deepEqual(findWpUrls(html), [
    'https://revistaterraonline.com/wp-content/uploads/2026/10/Retoma.jpg',
    'http://revistaterra.co.mz/wp-content/uploads/2021/06/A%20b.jpg',
  ]);
});

test('nome no armazenamento é seguro', () => {
  assert.equal(destName('https://revistaterraonline.com/wp-content/uploads/2026/10/Retoma.jpg'), 'news/wp/2026-10-Retoma.jpg');
});

test('troca os endereços antigos pelos novos', () => {
  const u = 'https://revistaterraonline.com/wp-content/uploads/2026/10/Retoma.jpg';
  assert.ok(!replaceUrls(html, { [u]: 'https://s/news/wp/2026-10-Retoma.jpg' }).includes(u));
});
