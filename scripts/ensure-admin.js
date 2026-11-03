/**
 * Cria ou actualiza o utilizador administrador no Supabase Auth.
 *
 * Uso:
 *   node scripts/ensure-admin.js
 *   ADMIN_EMAIL=o-seu@email ADMIN_PASSWORD='SuaSenha' node scripts/ensure-admin.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const SITE_KEY = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';

if (!email || !password) {
  console.error('Indique ADMIN_EMAIL e ADMIN_PASSWORD (não há valores por defeito).');
  process.exit(1);
}

if (!url || !serviceKey) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY em .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target) {
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = (data.users || []).find(
      (u) => (u.email || '').toLowerCase() === target.toLowerCase()
    );
    if (found) return found;
    if (!data.users || data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  console.log(`A garantir admin: ${email}`);

  const existing = await findUserByEmail(email);

  if (existing) {
    // Conta que já existe (por exemplo a da Revista Terra): só se acrescenta o acesso a este site.
    // A palavra-passe e os dados dos outros sites não se tocam (a menos que ADMIN_RESET_PASSWORD=1).
    const update = {
      email_confirm: true,
      app_metadata: { ...(existing.app_metadata || {}), [SITE_KEY]: { role: 'Administrador', approved: true } },
    };
    if (process.env.ADMIN_RESET_PASSWORD === '1') update.password = password;
    // Nome de utilizador (para entrar só com o nome): só se a conta ainda não tiver um.
    if (process.env.ADMIN_USERNAME && !(existing.user_metadata || {}).username) {
      update.user_metadata = { ...(existing.user_metadata || {}), username: process.env.ADMIN_USERNAME };
    }
    const { error } = await supabase.auth.admin.updateUserById(existing.id, update);
    if (error) throw error;
    console.log(`Acesso de Administrador a "${SITE_KEY}" acrescentado à conta existente.`);
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { [SITE_KEY]: { role: 'Administrador', approved: true } },
      user_metadata: {
        app: SITE_KEY,
        role: 'Administrador',
        full_name: 'Administrador',
        username: 'admin',
      },
    });
    if (error) throw error;
    console.log('Utilizador administrador criado.');
  }

  console.log('');
  console.log('Credenciais de acesso:');
  console.log(`  E-mail: ${email}`);
  console.log('');
  console.log('Login: /login');
}

main().catch((err) => {
  console.error('Falha:', err.message || err);
  process.exit(1);
});
