'use client';

import { useEffect, useRef, useState } from 'react';
import { DARK, DARKER, LIME } from '@/lib/terra';
import { SocialGlyph, useSocialLinks } from './SocialProvider';

const circle = 'flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition-colors hover:border-[#9BCB3C] hover:bg-[#9BCB3C] hover:text-[#064E3B]';

/** Redes sociais e pesquisa (à direita do logo). O campo de pesquisa desliza por baixo, na largura do conteúdo. */
export default function HeaderTools() {
  const social = useSocialLinks();
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  return (
    <div className="flex items-center justify-center gap-2 sm:justify-self-end">
      {social.map((s) => (
        <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} className={circle}>
          <SocialGlyph link={s} className="h-4 w-4" />
        </a>
      ))}
      <button aria-label={open ? 'Fechar pesquisa' : 'Pesquisar'} aria-expanded={open} onClick={() => setOpen(!open)} className={circle} style={open ? { background: DARK, borderColor: DARK, color: LIME } : undefined}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>{open ? <path d="M6 6l12 12M18 6L6 18" /> : <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></>}</svg>
      </button>
      <form role="search" onSubmit={(e) => e.preventDefault()} className={`absolute inset-x-3 top-full z-40 overflow-hidden shadow-lg transition-[max-height,opacity] duration-300 ${open ? 'max-h-24 opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`} style={{ background: DARKER }}>
        <div className="flex gap-2 p-3">
          <input ref={input} tabIndex={open ? 0 : -1} type="search" placeholder="O que procura?" className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-neutral-900 outline-none" />
          <button tabIndex={open ? 0 : -1} className="px-4 text-xs font-bold uppercase" style={{ background: LIME, color: DARK }}>Procurar</button>
        </div>
      </form>
    </div>
  );
}
