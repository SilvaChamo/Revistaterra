'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const GROUPS: { label: string; pages: { label: string; path: string }[] }[] = [
  {
    label: 'Painel',
    pages: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Notícias', path: '/admin/noticias' },
      { label: 'Adicionar notícia', path: '/admin/noticias/nova' },
      { label: 'Comentários', path: '/admin/comentarios' },
      { label: 'Rádio', path: '/admin/radio' },
      { label: 'Subscrições', path: '/admin/subscricoes' },
      { label: 'Newsletter', path: '/admin/newsletter' },
      { label: 'Multimédia', path: '/admin/media' },
      { label: 'Utilizadores', path: '/admin/utilizadores' },
      { label: 'Relatórios', path: '/admin/trafego/relatorios' },
    ],
  },
  {
    label: 'Site',
    pages: [
      { label: 'Início', path: '/' },
      { label: 'Notícias', path: '/noticias' },
      { label: 'Categorias', path: '/categorias' },
      { label: 'Newsletter', path: '/newsletter' },
      { label: 'Espaços de publicidade', path: '/espacos-de-publicidade' },
      { label: 'Planos', path: '/planos' },
      { label: 'Contacto', path: '/contacto' },
      { label: 'Entrar', path: '/login' },
    ],
  },
];
const ALL = GROUPS.flatMap((g) => g.pages);
const PHONES = [320, 375, 414];
const DESKTOP_W = 1280;
const BEZEL = 14;

const pathOf = (w: Window | null | undefined) => {
  try {
    return w ? w.location.pathname + w.location.search : null;
  } catch {
    return null;
  }
};

/** O mesmo endereço em duas janelas: computador (1280px) e telemóvel (320, 375 ou 414px). Andam juntas ao navegar em qualquer uma. */
export default function PreviewFrames() {
  const desk = useRef<HTMLIFrameElement>(null);
  const phone = useRef<HTMLIFrameElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState('/admin/dashboard');
  const [typed, setTyped] = useState('/admin/dashboard');
  const [phoneW, setPhoneW] = useState(320);
  const [sync, setSync] = useState(true);
  const [size, setSize] = useState({ w: 1200, h: 700 });
  const initial = useRef('about:blank'); // as janelas só carregam depois de se saber o endereço (?url=), para não haver corrida entre elas
  const current = useRef(path); // o endereço em que as duas janelas devem estar

  // O endereço inicial pode vir em ?url= (por omissão, o Dashboard)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('url');
    const u = q && q.startsWith('/') ? q : '/admin/dashboard';
    current.current = u;
    setPath(u);
    setTyped(u);
    desk.current?.contentWindow?.location.replace(u);
    phone.current?.contentWindow?.location.replace(u);
  }, []);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const go = useCallback((next: string) => {
    current.current = next;
    setPath(next);
    setTyped(next);
    for (const f of [desk.current, phone.current]) {
      if (f?.contentWindow && pathOf(f.contentWindow) !== next) f.contentWindow.location.replace(next);
    }
  }, []);

  // Navegou-se dentro de uma das janelas (clique numa ligação; o painel navega sem recarregar, por isso não há evento "load"):
  // de meio em meio segundo vê-se o endereço de cada uma e a outra acompanha.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const d = pathOf(desk.current?.contentWindow);
      const p = pathOf(phone.current?.contentWindow);
      const moved = [[d, phone.current] as const, [p, desk.current] as const].find(([x]) => x && x.startsWith('/') && x !== current.current);
      if (!moved) return;
      const [next, other] = moved;
      current.current = next!;
      setPath(next!);
      setTyped(next!);
      if (sync && other?.contentWindow && pathOf(other.contentWindow) !== next) other.contentWindow.location.replace(next!);
    }, 500);
    return () => window.clearInterval(timer);
  }, [sync]);

  const index = ALL.findIndex((p) => p.path === path);
  const step = (d: number) => go(ALL[(Math.max(index, 0) + d + ALL.length) % ALL.length].path);

  const phoneFrameW = phoneW + BEZEL * 2;
  const gap = 24;
  const deskScale = Math.min(1, Math.max(0.2, (size.w - phoneFrameW - gap) / DESKTOP_W));
  const phoneH = Math.min(812, size.h - BEZEL * 2);
  const phoneScale = Math.min(1, (size.h - BEZEL * 2) / 812);
  const ctl = 'h-9 border border-[#ccd0d4] bg-white px-3 text-[13px] rounded-[3px]';

  return (
    <div className="flex h-screen flex-col bg-[#e8eaec] text-[#2c3338]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#ccd0d4] bg-white px-3 py-2">
        <button onClick={() => step(-1)} className={`${ctl} hover:text-[#047857]`} aria-label="Página anterior">‹</button>
        <select value={ALL.some((p) => p.path === path) ? path : ''} onChange={(e) => e.target.value && go(e.target.value)} className={`${ctl} min-w-0 max-w-[220px]`}>
          <option value="">Outra página</option>
          {GROUPS.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.pages.map((p) => (
                <option key={g.label + p.path} value={p.path}>{p.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <button onClick={() => step(1)} className={`${ctl} hover:text-[#047857]`} aria-label="Página seguinte">›</button>
        <form onSubmit={(e) => { e.preventDefault(); if (typed.startsWith('/')) go(typed); }} className="flex min-w-0 flex-1 gap-2">
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="/endereço" className={`${ctl} min-w-0 flex-1`} />
          <button type="submit" className={`${ctl} hover:text-[#047857]`}>Ir</button>
        </form>
        <div className="flex items-center gap-1">
          {PHONES.map((w) => (
            <button key={w} onClick={() => setPhoneW(w)} className={`${ctl} ${phoneW === w ? 'border-[#047857] text-[#065f46]' : 'hover:text-[#047857]'}`}>{w}px</button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-[13px]">
          <input type="checkbox" checked={sync} onChange={(e) => setSync(e.target.checked)} /> Janelas juntas
        </label>
      </div>

      <div ref={area} className="flex min-h-0 flex-1 items-start justify-center gap-6 overflow-hidden p-3">
        {/* Computador */}
        <div className="shrink-0 overflow-hidden border border-[#ccd0d4] bg-white shadow-sm" style={{ width: DESKTOP_W * deskScale, height: size.h - 24 }}>
          <iframe
            ref={desk}
            title="Computador"
            src={initial.current}
            style={{ width: DESKTOP_W, height: (size.h - 24) / deskScale, transform: `scale(${deskScale})`, transformOrigin: '0 0', border: 0, background: '#fff' }}
          />
        </div>
        {/* Telemóvel */}
        <div
          className="shrink-0 rounded-[28px] bg-[#111] shadow-lg"
          style={{ width: phoneFrameW * phoneScale, height: (phoneH + BEZEL * 2) * phoneScale, padding: BEZEL * phoneScale }}
        >
          <div className="overflow-hidden rounded-[16px] bg-white" style={{ width: phoneW * phoneScale, height: phoneH * phoneScale }}>
            <iframe
              ref={phone}
              title="Telemóvel"
              src={initial.current}
              style={{ width: phoneW, height: phoneH, transform: `scale(${phoneScale})`, transformOrigin: '0 0', border: 0, background: '#fff' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
