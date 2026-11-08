import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Limpa o cache público do site (home, categorias, notícias, páginas e comentários).
 * Usada na limpeza semanal de sábado, no botão "limpar cache" e quando se publica, edita ou apaga uma notícia
 * (a home e as categorias passam a mostrá-la logo).
 */
export function refreshSite() {
  revalidatePath('/', 'layout');
  try {
    // Expira já (e não "max", que serve a versão velha ao 1.º visitante): a notícia publicada aparece logo no site.
    revalidateTag('news', { expire: 0 });
    revalidateTag('comments', { expire: 0 });
    revalidateTag('columnists', { expire: 0 });
  } catch {
    /* fora de um pedido (ex.: scripts): o revalidatePath acima já chega */
  }
}

/** Criar, editar ou apagar uma conta pode mudar os colunistas da home: refaz só esse bloco (a home e a etiqueta `columnists`). */
export function refreshColumnists() {
  try {
    revalidateTag('columnists', { expire: 0 });
    revalidatePath('/');
  } catch {
    /* fora de um pedido */
  }
}
