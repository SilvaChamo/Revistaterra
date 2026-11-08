'use client';

import { Lock, Settings } from 'lucide-react';
import { useSocialLinks } from './SocialProvider';

const btn = 'flex h-10 w-10 items-center justify-center text-neutral-800 transition-colors hover:bg-[#9BCB3C]/25 hover:text-[#064E3B]';

/** Botões à direita do logotipo: Facebook, entrar (cadeado) e definições (roda dentada). */
export default function HeaderButtons() {
  const fb = useSocialLinks().find((l) => l.id === 'facebook');
  return (
    <div className="flex items-center gap-1">
      {fb && <a href={fb.href} target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook" className={btn}>
        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3z" /></svg>
      </a>}
      <a href="#" aria-label="Entrar" title="Entrar" className={btn}><Lock className="h-[21px] w-[21px]" strokeWidth={1.8} aria-hidden /></a>
      <a href="#" aria-label="Definições" title="Definições" className={btn}><Settings className="h-[21px] w-[21px]" strokeWidth={1.8} aria-hidden /></a>
    </div>
  );
}
