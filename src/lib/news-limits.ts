/** Limites de texto de uma notícia: no cartão principal o título (15px, negrito, ~32 caracteres por linha) ocupa no máximo 3 linhas e a descrição (12px, ~43 por linha) 2, numa largura de ~260px. */
export const TITLE_MAX = 90;
export const SUMMARY_MAX = 90;

/** Mensagem de erro se o título ou o resumo faltarem ou passarem o limite; `null` se estiver tudo certo. */
/** `summary` undefined = o pedido não toca na descrição (edição rápida): só se valida o título. */
export function checkNewsText(title: unknown, summary: unknown): string | null {
  const t = typeof title === 'string' ? title.trim() : '';
  const s = typeof summary === 'string' ? summary.trim() : '';
  if (!t) return 'A notícia precisa de título para ser publicada.';
  if (summary === undefined) return t.length > TITLE_MAX ? `O título tem ${t.length} caracteres; o máximo é ${TITLE_MAX} (3 linhas no cartão).` : null;
  if (!s) return 'A notícia precisa de uma descrição (resumo) para ser publicada.';
  if (t.length > TITLE_MAX) return `O título tem ${t.length} caracteres; o máximo é ${TITLE_MAX} (3 linhas no cartão).`;
  if (s.length > SUMMARY_MAX) return `A descrição tem ${s.length} caracteres; o máximo é ${SUMMARY_MAX} (2 linhas no cartão).`;
  return null;
}
