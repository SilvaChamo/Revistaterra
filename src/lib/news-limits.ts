/** Limite do título: no cartão principal (15px, negrito, ~32 caracteres por linha) ocupa no máximo 3 linhas. A descrição não tem limite: os cartões cortam-na com reticências. */
export const TITLE_MAX = 90;

/** Mensagem de erro se o título ou o resumo faltarem ou passarem o limite; `null` se estiver tudo certo. */
/** `summary` undefined = o pedido não toca na descrição (edição rápida): só se valida o título. */
export function checkNewsText(title: unknown, summary: unknown): string | null {
  const t = typeof title === 'string' ? title.trim() : '';
  const s = typeof summary === 'string' ? summary.trim() : '';
  if (!t) return 'A notícia precisa de título para ser publicada.';
  if (summary === undefined) return t.length > TITLE_MAX ? `O título tem ${t.length} caracteres; o máximo é ${TITLE_MAX} (3 linhas no cartão).` : null;
  if (!s) return 'A notícia precisa de uma descrição (resumo) para ser publicada.';
  if (t.length > TITLE_MAX) return `O título tem ${t.length} caracteres; o máximo é ${TITLE_MAX} (3 linhas no cartão).`;
  return null;
}
