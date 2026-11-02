'use client';

import { useState } from 'react';
import { DARK, LIME } from '@/lib/terra';

/** Subscrição da newsletter na barra de cima: campo de texto e botão à direita. */
export default function NewsletterBar() {
  const [done, setDone] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="flex w-full items-center sm:w-auto">
      {done ? (
        <span className="whitespace-nowrap py-1 text-sm font-semibold text-white">Subscrição registada. Obrigado!</span>
      ) : (
        <div className="flex min-w-0 flex-1 gap-2 sm:w-[420px] sm:flex-none">
          <input required type="email" aria-label="O seu e-mail" placeholder="O seu e-mail" className="min-w-0 flex-1 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400" />
          <button className="whitespace-nowrap px-5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-white" style={{ background: LIME, color: DARK }}>Subscrever</button>
        </div>
      )}
    </form>
  );
}
