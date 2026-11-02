'use client';

import { useState } from 'react';
import { DARK, GREEN, LIME } from '@/lib/terra';
import type { Card } from '@/lib/terra';

export type RecentSet = { id: string; label: string; feature: Card[]; lists: Card[][]; side: Card[] };

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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_240px]">
        {s.feature.map((c, k) => (
          <div key={c.title}>
            <a href={c.url} className="group relative block h-[300px] overflow-hidden rounded-md bg-black" style={{ containerType: 'size' }}>
              {c.image && <img src={c.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
              <div className="absolute inset-x-4 bottom-0 border-t-2 bg-white px-4 pb-4 pt-0 text-center" style={{ borderColor: GREEN }}>
                <div className="-mt-3"><Pill>{c.category}</Pill></div>
                <h3 className="mt-2 font-bold leading-snug text-neutral-900" style={{ fontSize: 'clamp(13px, 5cqmin, 16px)' }}>{c.title}</h3>
                <div className="mt-2 text-[11px] text-neutral-500">{c.date || 'Revista Terra'}</div>
              </div>
            </a>
            <ul className="mt-3 divide-y divide-neutral-200 bg-white shadow-sm">
              {s.lists[k].map((n) => (
                <li key={n.title}>
                  <a href={n.url} className="flex gap-3 p-3 hover:bg-neutral-50">
                    {n.image && <img src={n.image} alt="" loading="lazy" decoding="async" className="h-14 w-[72px] shrink-0 rounded object-cover" />}
                    <div>
                      <span className="whitespace-nowrap text-[10px] font-bold uppercase" style={{ color: GREEN }}>{n.category}</span>
                      <h4 className="mt-0.5 text-[13px] font-semibold leading-snug">{n.title}</h4>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <ul className="space-y-4 md:col-span-2 xl:col-span-1">
          {s.side.map((n) => (
            <li key={n.title}>
              <a href={n.url} className="flex gap-3">
                {n.image && <img src={n.image} alt="" loading="lazy" decoding="async" className="h-[96px] w-[96px] shrink-0 rounded object-cover" />}
                <div>
                  <Pill>{n.category}</Pill>
                  <h4 className="mt-1.5 text-[13px] font-bold leading-snug">{n.title}</h4>
                  <div className="mt-1 text-[11px] text-neutral-500">{n.date || 'Revista Terra'}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
