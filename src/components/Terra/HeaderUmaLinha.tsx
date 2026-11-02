'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, Search, User, X } from 'lucide-react';
import { DARK, DARKER, GREEN, LIME, nav, social } from '@/lib/terra';

/**
 * Cabeçalho principal: uma só linha branca (logo, menu e ícones; 78px + linha verde).
 * Ao fazer scroll passa a barra verde compacta de 60px, fixa no topo. O espaço no topo da página é mantido (sem saltos).
 */
export default function HeaderUmaLinha() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      setScrolled((s) => (s ? y > 20 : y > 70)); // histerese: evita piscar perto do limite
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!search) return;
    input.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setSearch(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [search]);

  const icon = `flex h-10 w-10 items-center justify-center transition-colors hover:text-[#9BCB3C] ${scrolled ? 'text-white' : 'text-neutral-800'}`;

  return (
    <div className="relative h-[68px] lg:h-[82px]">
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`} style={{ background: scrolled ? GREEN : '#fff' }}>
        <div className={`relative mx-auto flex max-w-[1300px] items-stretch px-3 transition-[height] duration-300 ${scrolled ? 'h-[56px]' : 'h-[64px] lg:h-[78px]'}`}>
          <Link href="/" className={`flex shrink-0 items-center bg-white transition-[padding] duration-300 ${scrolled ? 'px-4' : 'pr-4'}`} aria-label="Revista Terra — A Voz do Agro e Ambiente">
            <img src="/terra/logo-revista-terra.webp" alt="Revista Terra — A Voz do Agro e Ambiente" width={381} height={190} className={`w-auto transition-[height] duration-300 ${scrolled ? 'h-[40px]' : 'h-[46px] lg:h-[54px]'}`} />
          </Link>

          <nav className="hidden flex-1 items-stretch px-2 lg:flex" aria-label="Menu principal">
            {nav.map((m) => {
              const active = path === m.href;
              return (
                <Link key={m.href} href={m.href} className={`relative flex items-center px-4 text-xs font-bold uppercase transition-colors hover:text-[#9BCB3C] ${scrolled ? 'text-white' : ''}`} style={scrolled ? (active ? { background: DARKER, color: LIME } : undefined) : { color: active ? GREEN : DARK }}>
                  {m.label}
                  {!scrolled && active && <i className="absolute inset-x-4 bottom-4 h-[3px]" style={{ background: LIME }} />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center lg:ml-0">
            <button aria-label={search ? 'Fechar pesquisa' : 'Pesquisar'} aria-expanded={search} onClick={() => { setSearch(!search); setMenu(false); }} className={icon} style={search ? { color: scrolled ? LIME : GREEN } : undefined}>
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

          <form role="search" onSubmit={(e) => e.preventDefault()} className={`absolute inset-x-3 top-full z-40 overflow-hidden shadow-lg transition-[max-height,opacity] duration-300 ${search ? 'max-h-24 opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`} style={{ background: DARKER }}>
            <div className="flex gap-2 p-3">
              <input ref={input} tabIndex={search ? 0 : -1} type="search" placeholder="O que procura?" className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-neutral-900 outline-none" />
              <button tabIndex={search ? 0 : -1} className="px-4 text-xs font-bold uppercase" style={{ background: LIME, color: DARK }}>Procurar</button>
            </div>
          </form>
        </div>

        <nav className={`overflow-hidden transition-[max-height] duration-300 lg:hidden ${menu ? 'max-h-[420px]' : 'max-h-0'}`} aria-label="Menu principal (telemóvel)" style={{ background: DARKER }}>
          <div className="mx-auto flex max-w-[1300px] flex-col px-3 py-1">
            {nav.map((m) => (
              <Link key={m.href} href={m.href} tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)} className="px-4 py-3 text-xs font-bold uppercase text-white" style={path === m.href ? { color: LIME } : undefined}>{m.label}</Link>
            ))}
          </div>
        </nav>
        <div className="h-1 transition-colors duration-300" style={{ background: scrolled ? DARKER : GREEN }} />
      </header>
    </div>
  );
}
