/**
 * Visitas que não são da Revista Terra: páginas do painel, ferramentas de desenvolvimento e
 * pedidos feitos a partir de um servidor local. Não se registam nem contam nas estatísticas.
 */
const OWN_PATHS = /^\/(admin|api|partilha\/|vhost:|pre-visualizacao)/i;
const LOCAL_HOST = /^(localhost|127\.|0\.0\.0\.0|\[::1\]|.*\.local|.*\.localhost)$/i;

export const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'revistaterra';
export const OWN_HOSTS = ['revistaterraonline.com', 'revistaterra.co.mz'];

export const isForeignPath = (path: string) => OWN_PATHS.test(path);
/** `host` pode trazer porta (localhost:3014). */
export const isLocalHost = (host: string) => LOCAL_HOST.test((host || '').replace(/:\d+$/, '')) || /^127\./.test(host || '');
export const isOwnHost = (host: string) => OWN_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
