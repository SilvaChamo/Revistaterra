'use client';

import { useState } from 'react';
import { DARK, GREEN } from '@/lib/terra';

/** Subscrição da newsletter na barra de cima: campo de texto e botão à direita. */
export default function NewsletterBar() {
  const [done, setDone] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="flex w-full items-center gap-3 sm:w-auto">
      {done ? (
        <span className="whitespace-nowrap text-sm font-semibold" style={{ color: GREEN }}>Subscrição registada. Obrigado!</span>
      ) : (
        <div className="flex min-w-0 flex-1 gap-2 sm:w-[420px] sm:flex-none">
          <input required type="email" aria-label="O seu e-mail" placeholder="O seu e-mail" className="min-w-0 flex-1 border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-[#047857]" />
          <button className="whitespace-nowrap px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:text-[#9BCB3C]" style={{ background: DARK }}>Subscrever</button>
        </div>
      )}
    </form>
  );
}
