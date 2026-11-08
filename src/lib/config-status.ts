import 'server-only';
import { loadPlanos } from '@/lib/assinaturas';

/** Uma configuração em falta: o que é preciso definir (nomes das variáveis, nunca valores) e para quê. */
export type ConfigItem = { vars?: string[]; text: string };
export type ConfigArea = 'dashboard' | 'newsletter' | 'partilhado' | 'subscricoes' | 'planos' | 'utilizadores' | 'comentarios';

const has = (...names: string[]) => names.every((n) => Boolean(process.env[n]));
const hasAny = (...names: string[]) => names.some((n) => Boolean(process.env[n]));

const smtp = (): ConfigItem[] =>
  has('SMTP_HOST', 'SMTP_USER', 'SMTP_PASS') ? [] : [{ vars: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'], text: 'Servidor de e-mail (SMTP) por ligar: sem ele não seguem e-mails.' }];
const cron = (para: string): ConfigItem[] => (has('CRON_SECRET') ? [] : [{ vars: ['CRON_SECRET'], text: `Chave das tarefas automáticas em falta: ${para}.` }]);
const siteUrl = (para: string): ConfigItem[] => (has('NEXT_PUBLIC_SITE_URL') ? [] : [{ vars: ['NEXT_PUBLIC_SITE_URL'], text: `Endereço público do site por definir: ${para}.` }]);

/** O que falta configurar em cada área do painel. Lista vazia = tudo a funcionar. */
export async function configMissing(area: ConfigArea): Promise<ConfigItem[]> {
  switch (area) {
    case 'dashboard':
      return [
        ...(has('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET')
          ? []
          : [{ vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'], text: 'Entrada com Google desligada: crie as credenciais OAuth na Google e junte o endereço /api/auth/google/callback como endereço de retorno.' }]),
        ...cron('a limpeza semanal da cache (sábados) não corre'),
        ...siteUrl('os links de partilha e dos e-mails podem sair errados'),
      ];
    case 'newsletter':
      return [
        ...smtp(),
        ...(hasAny('NEWSLETTER_EMAIL_FROM') ? [] : [{ vars: ['NEWSLETTER_EMAIL_FROM'], text: 'Remetente da newsletter por definir: está a ser usado o remetente por defeito.' }]),
        ...cron('o envio diário e os envios agendados não correm'),
        ...siteUrl('os links da newsletter e do cancelamento de subscrição'),
      ];
    case 'partilhado':
      return [
        ...(has('IMAP_HOST', 'IMAP_USER', 'IMAP_PASS')
          ? []
          : [{ vars: ['IMAP_HOST', 'IMAP_PORT', 'IMAP_USER', 'IMAP_PASS'], text: 'Caixa de e-mail da redacção por ligar: sem ela não chegam ficheiros novos a esta página.' }]),
        ...(hasAny('CLAMD_URL', 'CLAMD_HOST', 'CLAMD_SOCKET', 'ANTIVIRUS_OPCIONAL')
          ? []
          : [{ vars: ['CLAMD_URL', 'CLAMD_TOKEN'], text: 'Antivírus por ligar (ClamAV, em alternativa CLAMD_HOST ou CLAMD_SOCKET): só as imagens são importadas, os PDF, ZIP e documentos ficam retidos.' }]),
        ...cron('a sincronização diária da caixa de e-mail não corre'),
      ];
    case 'planos': {
      const itens: ConfigItem[] = [];
      const { plans, payment } = await loadPlanos();
      const semPreco = plans.filter((p) => p.active && p.price == null).length;
      if (semPreco) itens.push({ text: `${semPreco} plano(s) activo(s) sem preço: no site aparecem como “Brevemente” e não podem ser subscritos. Defina o preço de cada um e guarde.` });
      if (!payment.trim()) itens.push({ text: 'Falta preencher “Como pagar” (M-Pesa, e-Mola, transferência): o leitor não sabe para onde pagar a subscrição. Preencha e guarde.' });
      return itens;
    }
    case 'subscricoes': {
      const itens = await configMissing('planos');
      return [...itens, ...smtp().map((i) => ({ ...i, text: 'Servidor de e-mail (SMTP) por ligar: os avisos aos subscritores não seguem.' }))];
    }
    case 'utilizadores':
      return [
        ...smtp().map((i) => ({ ...i, text: 'Servidor de e-mail (SMTP) por ligar: a recuperação de palavra-passe não envia e-mails.' })),
        ...(has('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET') ? [] : [{ vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'], text: 'Entrada com Google desligada: os utilizadores só entram com e-mail e palavra-passe.' }]),
      ];
    case 'comentarios':
      return has('TURNSTILE_SECRET_KEY', 'NEXT_PUBLIC_TURNSTILE_SITE_KEY')
        ? []
        : [{ vars: ['NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'], text: 'Protecção anti-spam (Cloudflare Turnstile) por ligar: os comentários e formulários ficam só com a protecção básica.' }];
  }
}

export const CONFIG_AREAS: ConfigArea[] = ['dashboard', 'newsletter', 'partilhado', 'subscricoes', 'planos', 'utilizadores', 'comentarios'];
