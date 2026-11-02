'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { GREEN, nav } from '@/lib/terra';

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <nav style={{ background: GREEN }} aria-label="Menu principal">
     <div className="mx-auto max-w-[1300px] px-3">
      <button className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase text-white sm:hidden" onClick={() => setOpen(!open)}>
        Menu <span>{open ? '✕' : '☰'}</span>
      </button>
      <div className={`${open ? 'flex' : 'hidden'} flex-col sm:flex sm:flex-row sm:flex-wrap`}>
        {nav.map((m) => (
          <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className={`px-4 py-3 text-xs font-bold uppercase text-white hover:bg-black/20 ${path === m.href ? 'bg-black/20' : ''}`}>{m.label}</Link>
        ))}
      </div>
     </div>
    </nav>
  );
}
