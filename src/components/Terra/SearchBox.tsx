'use client';

import { useState } from 'react';

export default function SearchBox() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2">
      {open && <input autoFocus placeholder="O que procura?" className="w-40 border border-neutral-300 px-2 py-1 text-xs sm:w-56" />}
      <button onClick={() => setOpen(!open)} className="text-xs font-medium uppercase text-neutral-500 hover:text-black">{open ? 'Fechar' : 'Pesquisar'}</button>
    </div>
  );
}
