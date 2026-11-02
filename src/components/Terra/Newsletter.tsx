'use client';

import { useState } from 'react';
import { GREEN } from '@/lib/terra';

export default function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <p className="mb-3 text-sm">Receba o Agro no E-mail: notícias, análises e conteúdos agro-ambientais directamente no seu e-mail.</p>
      {done ? (
        <p className="text-sm font-semibold" style={{ color: GREEN }}>Subscrição registada. Obrigado!</p>
      ) : (
        <div className="flex">
          <input required type="email" placeholder="O seu e-mail" className="min-w-0 flex-1 border border-neutral-300 px-3 py-2 text-xs" />
          <button className="px-4 text-xs font-bold uppercase text-white" style={{ background: GREEN }}>Inscrever-se</button>
        </div>
      )}
    </form>
  );
}
