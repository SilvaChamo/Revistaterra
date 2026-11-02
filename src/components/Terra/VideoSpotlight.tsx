'use client';

import { useState } from 'react';
import { GREEN, terra } from '@/lib/terra';

export default function VideoSpotlight() {
  const vids = terra.videos;
  const [i, setI] = useState(0);
  const v = vids[i];
  return (
    <div className="grid gap-3 bg-white p-3 shadow-sm md:grid-cols-[1.6fr_1fr]">
      <div>
        <div className="aspect-video bg-black">
          <iframe key={v.id} className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${v.id}`} title={v.title} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; web-share" allowFullScreen />
        </div>
        <span className="mt-3 block text-[10px] font-bold uppercase tracking-widest" style={{ color: GREEN }}>Vídeos Revista Terra</span>
        <h3 className="text-lg font-bold">{v.title}</h3>
      </div>
      <ul className="max-h-[320px] overflow-y-auto">
        {vids.map((x, k) => (
          <li key={x.id}>
            <button onClick={() => setI(k)} className={`flex w-full items-center gap-3 p-2 text-left hover:bg-neutral-50 ${k === i ? 'bg-neutral-100' : ''}`}>
              <img src={`https://i.ytimg.com/vi/${x.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-14 w-24 shrink-0 object-cover" />
              <span className="text-[13px] font-semibold leading-snug">{x.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
