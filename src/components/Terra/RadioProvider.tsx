'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const STREAM = 'https://stream.zeno.fm/zux5ls5nfw9tv';

type RadioCtx = { playing: boolean; toggle: () => void };
const Ctx = createContext<RadioCtx>({ playing: false, toggle: () => {} });
export const useRadio = () => useContext(Ctx);

/**
 * A rádio vive aqui, na raiz do site, e não dentro das páginas: o leitor de áudio não é destruído ao mudar de página,
 * por isso o som continua até a pessoa carregar em pausar. Para que o clique numa ligação interna nunca recarregue
 * a página (o que cortaria o som), as ligações internas passam a navegar sem recarregar.
 */
export default function RadioProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const get = () => (audio.current ??= new Audio());

  const toggle = useCallback(() => {
    const a = get();
    if (!a.paused || a.src) {
      // desligar: pára e solta a ligação, para não continuar a descarregar o directo
      a.pause();
      a.removeAttribute('src');
      a.load();
      setPlaying(false);
    } else {
      a.src = STREAM;
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, []);

  // Se o directo falhar ou terminar, o botão volta ao estado "ouvir".
  useEffect(() => {
    const a = get();
    const off = () => { if (!a.src) return; setPlaying(false); };
    a.addEventListener('error', off);
    a.addEventListener('ended', off);
    return () => { a.removeEventListener('error', off); a.removeEventListener('ended', off); };
  }, []);

  // Ligações internas sem recarregar a página (as que já usam <Link> tratam de si; as <a href> normais passam por aqui).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a');
      if (!link) return;
      const raw = link.getAttribute('href') || '';
      if (!raw || raw.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
      if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      let url: URL;
      try { url = new URL(link.href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname.startsWith('/api/') || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) return; // rotas da API e ficheiros (PDF, imagens...)
      if (url.pathname === location.pathname && url.search === location.search) return; // só muda o #: deixa o navegador tratar
      e.preventDefault();
      router.push(url.pathname + url.search + url.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [router]);

  return <Ctx.Provider value={{ playing, toggle }}>{children}</Ctx.Provider>;
}
