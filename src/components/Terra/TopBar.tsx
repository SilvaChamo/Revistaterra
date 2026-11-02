'use client';

import Link from 'next/link';
import { useState } from 'react';
import Today from './Today';
import { DARK, DARKER, LIME, TOPBAR } from '@/lib/terra';

const link = 'transition-colors hover:text-[#9BCB3C]';

/** Barra de cima: data à esquerda; Entrar, Newsletter e Contactos à direita. A Newsletter abre o formulário por baixo. */
export default function TopBar() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="text-xs text-white" style={{ background: TOPBAR }}>
      <div className="mx-auto flex max-w-[1300px] items-center justify-between gap-4 px-3 py-2">
        <span className="hidden sm:block"><Today /></span>
        <nav className="ml-auto flex items-center gap-5 font-medium" aria-label="Utilitários">
          <a href="#" className={link}>Entrar</a>
          <button aria-expanded={open} onClick={() => setOpen(!open)} className={link} style={open ? { color: LIME } : undefined}>Newsletter</button>
          <Link href="/contacto" className={link}>Contactos</Link>
        </nav>
      </div>
      <div className={`overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-28' : 'max-h-0'}`} style={{ background: DARKER }}>
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mx-auto flex max-w-[1300px] items-center gap-2 px-3 py-3">
          {done ? (
            <span className="text-sm font-semibold">Subscrição registada. Obrigado!</span>
          ) : (
            <>
              <input required type="email" tabIndex={open ? 0 : -1} aria-label="O seu e-mail" placeholder="O seu e-mail" className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-neutral-900 outline-none" />
              <button tabIndex={open ? 0 : -1} className="whitespace-nowrap px-5 py-2 text-xs font-bold uppercase tracking-wide" style={{ background: LIME, color: DARK }}>Subscrever</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
