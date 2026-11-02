'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DARK, DARKER, GREEN, LIME, nav, social } from '@/lib/terra';

export default function NavAtual() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!search) return;
    input.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setSearch(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [search]);
  return (
    <nav style={{ background: GREEN }} aria-label="Menu principal">
     <div className="relative mx-auto flex max-w-[1300px] items-stretch px-3">
      <div className="min-w-0 flex-1">
      <button className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase text-white sm:hidden" onClick={() => setOpen(!open)}>
        Menu <span>{open ? '✕' : '☰'}</span>
      </button>
      <div className={`${open ? 'flex' : 'hidden'} flex-col sm:flex sm:flex-row sm:flex-wrap`}>
        {nav.map((m) => (
          <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className="px-4 py-3 text-xs font-bold uppercase text-white transition-colors hover:text-[#9BCB3C]" style={path === m.href ? { background: DARKER, color: LIME } : undefined}>{m.label}</Link>
        ))}
      </div>
      </div>
      {/* redes sociais, em frente da lupa */}
      <div className="flex shrink-0 items-stretch">
        {social.map((s) => (
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} className="flex w-10 items-center justify-center text-white transition-colors hover:text-[#9BCB3C]">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden><path d={s.path} /></svg>
          </a>
        ))}
      </div>
      <button aria-label={search ? 'Fechar pesquisa' : 'Pesquisar'} aria-expanded={search} onClick={() => setSearch(!search)} className="flex w-12 shrink-0 items-center justify-center text-white transition-colors hover:text-[#9BCB3C]" style={search ? { background: DARKER, color: LIME } : undefined}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden>{search ? <path d="M5 5l14 14M19 5L5 19" /> : <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></>}</svg>
      </button>
      {/* campo de pesquisa: desliza para baixo, por baixo do ícone, aberto para a esquerda */}
      <form role="search" onSubmit={(e) => e.preventDefault()} className={`absolute inset-x-3 top-full z-40 overflow-hidden shadow-lg transition-[max-height,opacity] duration-300 ${search ? 'max-h-24 opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`} style={{ background: DARKER }}>
        <div className="flex gap-2 p-3">
          <input ref={input} tabIndex={search ? 0 : -1} type="search" placeholder="O que procura?" className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-neutral-900 outline-none" />
          <button tabIndex={search ? 0 : -1} className="px-4 text-xs font-bold uppercase" style={{ background: LIME, color: DARK }}>Procurar</button>
        </div>
      </form>
     </div>
     {/* linha por baixo do menu, na cor do item selecionado */}
     <div className="h-[3px]" style={{ background: DARKER }} />
    </nav>
  );
}
