'use client';

import { useState } from 'react';
import { DARK, GREEN, LIME } from '@/lib/terra';

/** Subscrição da newsletter na barra de cima: campo de texto e botão à direita. */
export default function NewsletterBar() {
  const [done, setDone] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="flex w-full items-center gap-3 sm:w-auto">
      <span className="hidden whitespace-nowrap text-xs font-bold uppercase tracking-wide lg:block" style={{ color: GREEN }}>Receba o Agro no e-mail</span>
      {done ? (
        <span className="whitespace-nowrap text-sm font-semibold" style={{ color: GREEN }}>Subscrição registada. Obrigado!</span>
      ) : (
        <div className="flex min-w-0 flex-1 sm:w-[340px] sm:flex-none">
          <input required type="email" aria-label="O seu e-mail" placeholder="O seu e-mail" className="min-w-0 flex-1 border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#047857]" />
          <button className="whitespace-nowrap px-5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-[#064E3B] hover:text-white" style={{ background: LIME, color: DARK }}>Subscrever</button>
        </div>
      )}
    </form>
  );
}
