'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { DARK, GREEN } from '@/lib/terra';
import type { Columnist } from '@/lib/columnists';

export type ColumnistItem = { columnist: Columnist; post: { slug: string; title: string; href?: string; summary?: string } };

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'x', label: 'X', Icon: Twitter },
] as const;

function Socials({ c }: { c: Columnist }) {
  const list = SOCIALS.filter((s) => c[s.key]);
  if (list.length === 0) return null;
  return (
    <div className="mt-2 flex items-center justify-center gap-1.5">
      {list.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={c[key]}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label={`${label} de ${c.nome}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-[#047857] hover:bg-[#047857] hover:text-white"
        >
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
}

const arrow = 'flex h-7 w-7 items-center justify-center border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-[#9BCB3C] hover:bg-[#9BCB3C] hover:text-[#064E3B]';

export default function Columnists({
  items,
  title = 'Colunistas',
  href = '/categoria/opiniao',
  more = 'Ver todos os artigos de opinião',
}: {
  items: ColumnistItem[];
  title?: string;
  href?: string;
  more?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(4);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const updateVis = () => {
      if (window.innerWidth < 640) setVis(1);
      else if (window.innerWidth < 1024) setVis(2);
      else setVis(4);
    };
    updateVis();
    window.addEventListener('resize', updateVis);
    return () => window.removeEventListener('resize', updateVis);
  }, []);

  const n = items.length;
  const maxIdx = Math.max(0, n - vis);

  const go = (d: number) => {
    if (n <= vis) return;
    setIdx((curr) => {
      const next = curr + d;
      if (next < 0) return maxIdx;
      if (next > maxIdx) return 0;
      return next;
    });
  };

  useEffect(() => {
    if (paused || n <= vis) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, n, vis, maxIdx]);

  return (
    <section className="mt-8" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Cabeçalho com o botão à direita igual às outras secções + setas do carrossel */}
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <h2 className="whitespace-nowrap border-b-2 text-[15px] font-bold uppercase" style={{ color: GREEN, borderColor: GREEN }}>
          {title}
        </h2>
        <div className="flex items-center gap-3">
          {href && (
            <a href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: GREEN }}>
              <span className="relative">
                {more}
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full" style={{ background: GREEN }} />
              </span>
              <ChevronRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </a>
          )}
          {n > vis && (
            <div className="flex gap-1">
              <button type="button" aria-label="Anterior" onClick={() => go(-1)} className={arrow}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" aria-label="Seguinte" onClick={() => go(1)} className={arrow}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carrossel de colunistas com overflow oculto e transição suave */}
      <div className="overflow-hidden pt-12">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${(idx * 100) / vis}%)`,
          }}
        >
          {items.map(({ columnist: c, post }, i) => {
            const postHref = post.href ?? `/noticias/${post.slug}`;
            return (
              <div
                key={c.id || c.nome || i}
                className="box-border shrink-0 px-2"
                style={{ width: `${100 / vis}%` }}
              >
                <article className="relative flex h-full min-w-0 flex-col items-center bg-white p-5 pt-14 text-center shadow-sm">
                  {/* Avatar centrado com anel */}
                  {c.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.foto}
                      alt={c.nome}
                      loading="lazy"
                      decoding="async"
                      className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] object-cover shadow-md ring-4 ring-[#eaf3ed]"
                      style={{ borderColor: GREEN }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const fallback = (e.target as HTMLElement).nextElementSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className={`absolute left-1/2 top-0 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] bg-[#eef5e1] text-2xl shadow-md ring-4 ring-[#eaf3ed] ${c.foto ? 'hidden' : ''}`}
                    style={{ borderColor: GREEN, color: DARK }}
                  >
                    {c.nome.charAt(0).toUpperCase()}
                  </span>

                  <div className="w-full min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#047857]">{c.nome}</span>
                  </div>
                  <Socials c={c} />
                  <a href={postHref} className="mt-2 block w-full">
                    <h3 className="line-clamp-3 text-[13px] font-bold leading-snug text-neutral-900 hover:text-[#047857]">
                      {post.title}
                    </h3>
                  </a>
                  {post.summary && (
                    <p className="mt-2 line-clamp-4 text-[11px] leading-relaxed text-neutral-500">
                      {post.summary}
                    </p>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
