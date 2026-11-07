'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Facebook, Home, Mail, Menu, Mic, Radio, TrendingUp, User, Users } from 'lucide-react';
import { DARKER, GREEN, LIME, nav, social } from '@/lib/terra';
import TopThinBar, { THIN_BAR } from './TopThinBar';
import HeaderConta from './HeaderConta';

const NAV_ICONS: Record<string, typeof Home> = { '/': Home, '/radio': Radio, '/revista-digital': BookOpen, '/podcasts': Mic, '/cotacoes': TrendingUp, '/quem-somos': Users, '/contacto': Mail };

/**
 * Cabeçalho principal: uma só linha branca (logo, menu e ícones; 78px + linha verde).
 * Ao fazer scroll passa a barra compacta de 56px, sempre com fundo branco. O espaço no topo da página é mantido (sem saltos).
 * Por cima fica a barra fina (rádio, temperatura, pesquisa e redes, com o separador em trapézio a espreitar sobre o menu): também fica fixa, por isso o efeito mantém-se com o menu fixo.
 */
export default function HeaderUmaLinha() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [top, setTop] = useState(THIN_BAR);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      setTop(Math.max(0, THIN_BAR - y)); // a barra de cima sobe com a página (e o menu sobe atrás dela) até ao topo
      setScrolled((s) => (s ? y > 20 : y > 70)); // histerese: evita piscar perto do limite
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const icon = `flex items-center justify-center transition-colors hover:text-[#9BCB3C] text-neutral-800`;

  return (
    <>
    <TopThinBar offset={THIN_BAR - top} />
    <div className="relative h-[66px] lg:h-[80px]">
      <header className={`fixed inset-x-0 z-50 transition-[background-color,box-shadow] duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`} style={{ background: '#fff', top }}>
        <div className={`relative mx-auto flex max-w-[1300px] items-stretch px-3 lg:grid lg:grid-cols-[1fr_auto_1fr] transition-[height] duration-300 ${scrolled ? 'h-[56px]' : 'h-[64px] lg:h-[78px]'}`}>
          {/* Telemóvel: logótipo encostado à esquerda */}
          <Link href="/" className="flex shrink-0 items-center self-center bg-white lg:hidden" aria-label="Revista Terra — A Voz do Agro e Ambiente">
            <img src="/terra/logo-revista-terra.webp" alt="Revista Terra — A Voz do Agro e Ambiente" width={446} height={220} className="h-9 w-auto sm:h-10" />
          </Link>
          <Link href="/" className={`hidden shrink-0 items-center justify-self-start bg-white transition-[padding] duration-300 lg:flex ${scrolled ? 'px-4' : 'pr-4'}`} aria-label="Revista Terra — A Voz do Agro e Ambiente">
            <img src="/terra/logo-revista-terra.webp" alt="Revista Terra — A Voz do Agro e Ambiente" width={446} height={220} className={`w-auto transition-[height] duration-300 ${scrolled ? 'h-[40px]' : 'h-[46px] lg:h-[54px]'}`} />
          </Link>

          {/* xl:pt-[10px]: o menu começa por baixo do separador em trapézio da barra de cima, ficando centrado na parte visível da barra */}
          <nav className="hidden items-stretch lg:flex xl:pt-[10px]" aria-label="Menu principal">
            {nav.map((m) => {
              const active = path === m.href;
              return (
                <Link key={m.href} href={m.href} aria-current={active ? 'page' : undefined} className={`group relative flex items-center px-2.5 text-xs font-bold uppercase transition-colors duration-300 ${scrolled && active ? 'text-white' : active ? 'text-[#9BCB3C]' : 'text-[#064E3B] hover:text-[#9BCB3C]'}`}>
                  {/* só o item activo do menu fixo (com scroll) leva o fundo verde */}
                  {scrolled && active && <i aria-hidden className="pointer-events-none absolute inset-0" style={{ background: GREEN }} />}
                  {/* o hover é sempre uma linha por baixo do item; no item activo sem scroll a linha fica fixa */}
                  {!(scrolled && active) && <i aria-hidden className={`pointer-events-none absolute inset-x-2.5 ${scrolled ? 'bottom-2' : 'bottom-4'} h-[3px] origin-left transition-transform duration-200 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ background: LIME }} />}
                  <span className="relative">{m.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Telemóvel, da esquerda para a direita: pesquisa, Entrar e Menu (o último, encostado à direita) */}
          <div className={`ml-auto flex shrink-0 items-center gap-2.5 lg:hidden text-gray-700`}>
            <HeaderConta mobile />
            <button type="button" onClick={() => setMenu(!menu)} aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu} className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-colors hover:border-[#9BCB3C] hover:text-[#9BCB3C] border-gray-400`}><Menu className="h-5 w-5" /></button>
          </div>
          <div className="ml-auto hidden items-center justify-self-end lg:ml-0 lg:flex">
            <HeaderConta />
          </div>

        </div>

        <div className="h-0.5" style={{ background: GREEN }} />
      </header>
    </div>
    {/* Telemóvel: painel do menu à direita, por cima do conteúdo (220px), com fundo que o fecha */}
    {menu && <button type="button" aria-label="Fechar menu" onClick={() => setMenu(false)} className="fixed inset-0 z-[70] bg-black/50 lg:hidden" />}
    <aside aria-label="Menu principal (telemóvel)" aria-hidden={!menu} className={`fixed inset-y-0 right-0 z-[80] flex w-[220px] flex-col border-l-2 text-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${menu ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: DARKER, borderColor: LIME }}>
      <Link href="/" onClick={() => setMenu(false)} aria-label="Revista Terra — início" tabIndex={menu ? 0 : -1} className="relative block h-[66px] shrink-0">
        <img src="/terra/logo-revista-terra.webp" alt="Revista Terra" width={446} height={220} className="absolute left-3 top-8 h-[52px] w-auto -translate-y-1/2 bg-white px-1" />
      </Link>
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        {nav.map((m) => {
          const Icon = NAV_ICONS[m.href] ?? Home;
          const active = path === m.href;
          return (
            <Link key={m.href} href={m.href} tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)} aria-current={active ? 'page' : undefined} className={`flex items-center text-[12px] font-medium uppercase tracking-wide hover:bg-white/5 hover:text-[#9BCB3C] ${active ? 'bg-white/5 text-[#9BCB3C]' : 'text-gray-200'}`}>
              <span className="flex h-[37px] w-16 shrink-0 items-center justify-center"><Icon className="h-5 w-5" /></span>
              <span className="whitespace-nowrap">{m.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="flex w-16 shrink-0 justify-center py-3 text-gray-400">
        <a href={social[0].href} target="_blank" rel="noopener noreferrer" aria-label="Facebook" tabIndex={menu ? 0 : -1} className="hover:text-[#9BCB3C]"><Facebook className="h-5 w-5" /></a>
      </div>
    </aside>
    </>
  );
}
