'use client';

import { useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';
import { shareNetworks } from '@/lib/share';
import { GREEN } from '@/lib/terra';

/** Botões de partilha no fim do texto: redes sociais e copiar ligação. */
export default function ShareBar({ title }: { title: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(location.href.split('#')[0]), []);

  const nets = shareNetworks(encodeURIComponent(url), encodeURIComponent(title)).filter((n) => ['WhatsApp', 'Facebook', 'LinkedIn', 'Twitter', 'Telegram'].includes(n.label));
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* sem permissão */ }
  };

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-5">
      <span className="mr-1 text-xs font-bold uppercase tracking-wide" style={{ color: GREEN }}>Partilhar</span>
      {nets.map((n) => (
        <a key={n.label} href={url ? n.href : '#'} target="_blank" rel="noopener noreferrer" aria-label={`Partilhar no ${n.label}`} title={n.label} className={`flex h-9 w-9 items-center justify-center text-white transition-opacity hover:opacity-80 ${n.bg}`}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d={n.icon} /></svg>
        </a>
      ))}
      <button onClick={copy} aria-label="Copiar ligação" title="Copiar ligação" className="flex h-9 items-center gap-1.5 px-3 text-xs font-bold text-white transition-colors hover:!bg-[#8DF43A] hover:!text-[#064E3B]" style={{ background: GREEN }}>
        <Link2 size={16} aria-hidden />{copied ? 'Copiada' : 'Copiar'}
      </button>
    </div>
  );
}
