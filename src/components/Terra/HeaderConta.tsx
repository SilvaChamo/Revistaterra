'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { GREEN } from '@/lib/terra';

type Conta = { role: string } | null | undefined; // undefined = ainda não se sabe

/**
 * Botões da conta no cabeçalho do site: sem sessão mostra «Entrar»; com sessão mostra «Painel» (volta ao painel,
 * ao estilo do botão «Ouvir» da rádio) e «Sair». A sessão vive num cookie que só o servidor lê, por isso pergunta-se
 * uma vez a /api/auth/me (sem tocar na base de dados) e de novo quando a página volta a ficar visível.
 */
export default function HeaderConta({ mobile = false }: { mobile?: boolean }) {
  const [conta, setConta] = useState<Conta>(undefined);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    let vivo = true;
    const ler = () =>
      fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => vivo && setConta(d?.user ? { role: String(d.user.role) } : null))
        .catch(() => vivo && setConta(null));
    ler();
    const aoVoltar = () => { if (document.visibilityState === 'visible') ler(); };
    window.addEventListener('pageshow', ler);
    document.addEventListener('visibilitychange', aoVoltar);
    return () => { vivo = false; window.removeEventListener('pageshow', ler); document.removeEventListener('visibilitychange', aoVoltar); };
  }, []);

  const sair = async () => {
    setSaindo(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      try { const { getSupabase } = await import('@/lib/supabase'); await getSupabase().auth.signOut(); } catch { /* sem sessão do Supabase */ }
      try { localStorage.removeItem('revistaterra_user'); } catch { /* sem armazenamento */ }
    } finally {
      setConta(null);
      setSaindo(false);
    }
  };

  const grande = 'flex h-9 items-center whitespace-nowrap text-xs font-bold uppercase tracking-wide transition-colors';
  const pad = mobile ? 'px-3' : 'px-4';

  if (!conta) {
    return (
      <Link href="/admin" aria-label="Entrar no painel de gestão" title="Entrar no painel de gestão" className={`${grande} ${mobile ? 'gap-1.5' : 'gap-2'} ${pad} text-white hover:!bg-[#8DF43A] hover:!text-[#064E3B]`} style={{ background: GREEN }}>
        <User size={16} aria-hidden />Entrar
      </Link>
    );
  }

  const assinante = conta.role === 'guest';
  return (
    <div className="flex items-center gap-2">
      {/* Mesmo desenho do botão «Ouvir» da rádio: só contorno, letras maiúsculas e a cor da marca no hover */}
      <Link href={assinante ? '/assinante' : '/admin'} className={`${grande} border border-[#064E3B]/60 ${mobile ? 'px-2.5' : 'px-3'} text-[#064E3B] hover:border-[#9BCB3C] hover:text-[#9BCB3C]`}>
        {assinante ? 'Conta' : 'Painel'}
      </Link>
      <button type="button" onClick={sair} disabled={saindo} className={`${grande} ${pad} text-white hover:!bg-[#8DF43A] hover:!text-[#064E3B] disabled:opacity-60`} style={{ background: GREEN }}>
        Sair
      </button>
    </div>
  );
}
