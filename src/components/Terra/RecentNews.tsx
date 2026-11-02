'use client';

import { useState } from 'react';
import { DARK, GREEN, LIME } from '@/lib/terra';
import type { Card } from '@/lib/terra';

export type RecentSet = { id: string; label: string; feature: Card[] };

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block whitespace-nowrap rounded-br-md rounded-tl-md px-3 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: LIME, color: DARK }}>{children}</span>
);

export default function RecentNews({ sets }: { sets: RecentSet[] }) {
  const [tab, setTab] = useState(sets[0].id);
  const s = sets.find((x) => x.id === tab) ?? sets[0];

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="mb-2 h-[3px] w-24" style={{ background: GREEN }} />
          <h2 className="text-lg font-extrabold" style={{ color: DARK }}>Notícias recentes</h2>
        </div>
        <div className="flex gap-5 text-sm">
          {sets.map((x) => (
            <button key={x.id} onClick={() => setTab(x.id)} className={`relative pb-2 ${x.id === tab ? 'font-semibold text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}>
              {x.label}
              {x.id === tab && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded" style={{ background: GREEN }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {s.feature.map((c) => (
          <a key={c.title} href={c.url} className="group block" style={{ containerType: 'inline-size' }}>
            <div className="relative h-[210px] overflow-hidden rounded-md bg-black">
              {c.image && <img src={c.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
            </div>
            {/* o cartão de texto entra pela foto (margem negativa) e sai por baixo */}
            <div className="relative z-10 mx-4 -mt-14 border-t-2 bg-white px-4 pb-4 text-center shadow-sm" style={{ borderColor: GREEN }}>
              <div className="-mt-3"><Pill>{c.category}</Pill></div>
              <h3 className="mt-2 font-bold leading-snug text-neutral-900" style={{ fontSize: 'clamp(12.5px, 4.7cqw, 15px)' }}>{c.title}</h3>
              <div className="mt-2 text-[11px] text-neutral-500">{c.date || 'Revista Terra'}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
