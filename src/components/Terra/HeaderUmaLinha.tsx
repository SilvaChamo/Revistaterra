'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, User, X } from 'lucide-react';
import { DARK, DARKER, GREEN, LIME, nav } from '@/lib/terra';
import TopThinBar, { THIN_BAR } from './TopThinBar';

/**
 * Cabeçalho principal: uma só linha branca (logo, menu e ícones; 78px + linha verde).
 * Ao fazer scroll passa a barra verde compacta de 60px, fixa no topo. O espaço no topo da página é mantido (sem saltos).
 * Por cima fica uma barra fina que não fixa (e-mail, rádio, temperatura, pesquisa e redes); a principal sobe até ao topo e fica.
 */
export default function HeaderUmaLinha() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [top, setTop] = useState(THIN_BAR);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      setTop(Math.max(0, THIN_BAR - y)); // a barra principal sobe com a página até ao topo e aí fica
      setScrolled((s) => (s ? y > 20 : y > 70)); // histerese: evita piscar perto do limite
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const icon = `flex h-10 w-10 items-center justify-center transition-colors hover:text-[#9BCB3C] ${scrolled ? 'text-white' : 'text-neutral-800'}`;

  return (
    <>
    <TopThinBar />
    <div className="relative h-[68px] lg:h-[82px]">
      <header className={`fixed inset-x-0 z-50 transition-[background-color,box-shadow] duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`} style={{ background: scrolled ? GREEN : '#fff', top }}>
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
            <a href="#" aria-label="Entrar" className="flex h-9 items-center gap-2 whitespace-nowrap px-4 text-xs font-bold uppercase tracking-wide transition-colors hover:opacity-90" style={scrolled ? { background: LIME, color: '#064E3B' } : { background: '#064E3B', color: '#fff' }}><User size={16} aria-hidden />Entrar</a>
            <button aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu} onClick={() => setMenu(!menu)} className={`${icon} lg:hidden`}>
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

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
    </>
  );
}
