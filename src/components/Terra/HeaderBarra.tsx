'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, Search, User, X } from 'lucide-react';
import { DARK, DARKER, GREEN, LIME, nav, social } from '@/lib/terra';

const icon = 'flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-[#9BCB3C]';

/** Cabeçalho em barra verde única: logo num bloco branco à esquerda; menu e ícones na própria barra. */
export default function HeaderBarra() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
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
    <header className="shadow-sm" style={{ background: GREEN }}>
      <div className="relative mx-auto flex max-w-[1300px] items-stretch px-3">
        <Link href="/" className="flex shrink-0 items-center bg-white px-4 py-2 sm:px-5" aria-label="Revista Terra — A Voz do Agro e Ambiente">
          <img src="/terra/logo-revista-terra.webp" alt="Revista Terra — A Voz do Agro e Ambiente" width={381} height={190} className="h-[48px] w-auto sm:h-[54px]" />
        </Link>

        <nav className="hidden flex-1 items-stretch px-2 lg:flex" aria-label="Menu principal">
          {nav.map((m) => (
            <Link key={m.href} href={m.href} className="flex items-center px-4 text-xs font-bold uppercase text-white transition-colors hover:text-[#9BCB3C]" style={path === m.href ? { background: DARKER, color: LIME } : undefined}>{m.label}</Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center lg:ml-0">
          <button aria-label={search ? 'Fechar pesquisa' : 'Pesquisar'} aria-expanded={search} onClick={() => { setSearch(!search); setMenu(false); }} className={icon} style={search ? { color: LIME } : undefined}>
            {search ? <X size={18} /> : <Search size={18} />}
          </button>
          {social.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} className={`${icon} hidden lg:flex`}>
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden><path d={s.path} /></svg>
            </a>
          ))}
          <a href="#" aria-label="Entrar" title="Entrar" className={icon}><User size={18} /></a>
          <button aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu} onClick={() => { setMenu(!menu); setSearch(false); }} className={`${icon} lg:hidden`}>
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* pesquisa: desliza por baixo da barra, na largura do conteúdo */}
        <form role="search" onSubmit={(e) => e.preventDefault()} className={`absolute inset-x-3 top-full z-40 overflow-hidden shadow-lg transition-[max-height,opacity] duration-300 ${search ? 'max-h-24 opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`} style={{ background: DARKER }}>
          <div className="flex gap-2 p-3">
            <input ref={input} tabIndex={search ? 0 : -1} type="search" placeholder="O que procura?" className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-neutral-900 outline-none" />
            <button tabIndex={search ? 0 : -1} className="px-4 text-xs font-bold uppercase" style={{ background: LIME, color: DARK }}>Procurar</button>
          </div>
        </form>
      </div>

      {/* menu do telemóvel */}
      <nav className={`overflow-hidden transition-[max-height] duration-300 lg:hidden ${menu ? 'max-h-[420px]' : 'max-h-0'}`} aria-label="Menu principal (telemóvel)" style={{ background: DARKER }}>
        <div className="mx-auto flex max-w-[1300px] flex-col px-3 py-1">
          {nav.map((m) => (
            <Link key={m.href} href={m.href} tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)} className="px-4 py-3 text-xs font-bold uppercase text-white" style={path === m.href ? { color: LIME } : undefined}>{m.label}</Link>
          ))}
        </div>
      </nav>
      <div className="h-1" style={{ background: DARKER }} />
    </header>
  );
}
