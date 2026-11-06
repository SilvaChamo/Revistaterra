'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GREEN } from '@/lib/terra';
import { dataEmTexto, diasAte, precoEmTexto, type Exclusiva, type Pedido, type Plano } from '@/lib/assinaturas-types';

type Estado = {
  user: { name: string; email: string; role: string };
  subscription: { planName: string; since: string; until: string; active: boolean } | null;
  pedido: Pedido | null;
  plans: Plano[];
  payment: string;
  exclusivas: Exclusiva[];
};

const caixa = 'bg-white p-5 shadow-sm sm:p-6';
const titulo = 'text-[13px] font-bold uppercase tracking-wide';

/** Área de assinantes: estado da subscrição, pedido de subscrição/renovação e notícias exclusivas. */
export default function AreaAssinante({ planoInicial }: { planoInicial?: string }) {
  const router = useRouter();
  const [e, setE] = useState<Estado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [planoId, setPlanoId] = useState(planoInicial || '');
  const [referencia, setReferencia] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const res = await fetch('/api/assinatura', { credentials: 'include', cache: 'no-store' });
      if (res.status === 401) {
        router.replace(`/login?next=${encodeURIComponent('/assinante' + (planoInicial ? `?plano=${planoInicial}` : ''))}`);
        return;
      }
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erro ao carregar a sua área.');
      setE(d);
      setPlanoId((atual) => atual || d.plans.find((p: Plano) => p.price != null)?.id || '');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar a sua área.');
    }
  }, [router, planoInicial]);

  useEffect(() => { carregar(); }, [carregar]);

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch('/api/assinatura', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: planoId, reference: referencia }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Não foi possível enviar o pedido.');
      setReferencia('');
      setMsg('Pedido enviado. Assim que confirmarmos o pagamento, a subscrição fica activa.');
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar o pedido.');
    } finally {
      setEnviando(false);
    }
  }

  async function sair() {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch { /* sem rede */ }
    window.location.assign('/');
  }

  if (!e) return <div className={caixa}><p className="text-sm text-neutral-500">{erro || 'A carregar a sua área…'}</p></div>;

  const sub = e.subscription;
  const activa = !!sub?.active;
  const faltam = sub ? diasAte(sub.until) : 0;
  const pendente = e.pedido?.status === 'pendente' ? e.pedido : null;
  const recusado = e.pedido?.status === 'rejeitado' ? e.pedido : null;
  const redaccao = e.user.role !== 'guest';
  const escolhido = e.plans.find((p) => p.id === planoId);

  return (
    <div className="space-y-5">
      <div className={`${caixa} flex flex-wrap items-center justify-between gap-3`}>
        <div className="min-w-0">
          <div className={titulo} style={{ color: GREEN }}>Área de assinantes</div>
          <h1 className="mt-1 text-xl font-extrabold text-[#064E3B]">Olá, {e.user.name}</h1>
          <p className="text-xs text-neutral-500">{e.user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide">
          {redaccao ? <Link href="/admin" className="border px-3 py-2" style={{ borderColor: GREEN, color: GREEN }}>Ir para o painel</Link> : <Link href="/admin/guest" className="border px-3 py-2" style={{ borderColor: GREEN, color: GREEN }}>Painel de visitante</Link>}
          <button onClick={sair} className="bg-neutral-200 px-3 py-2 text-neutral-700 hover:bg-neutral-300">Terminar sessão</button>
        </div>
      </div>

      <div className={caixa}>
        <h2 className={titulo} style={{ color: GREEN }}>A sua subscrição</h2>
        {redaccao ? (
          <p className="mt-2 text-sm text-neutral-700">Faz parte da redacção: tem acesso a todas as notícias exclusivas.</p>
        ) : activa && sub ? (
          <>
            <p className="mt-2 text-sm text-neutral-700"><b>{sub.planName}</b> · activa até <b>{dataEmTexto(sub.until)}</b></p>
            {faltam <= 7 && <p className="mt-2 border-l-4 border-[#dba617] bg-[#fcf9e8] px-3 py-2 text-[13px]">A subscrição termina {faltam <= 1 ? 'amanhã' : `em ${faltam} dias`}. Renove abaixo para não perder o acesso; o tempo que resta é somado.</p>}
          </>
        ) : sub ? (
          <p className="mt-2 text-sm text-neutral-700">A sua subscrição <b>{sub.planName}</b> terminou a {dataEmTexto(sub.until)}. Renove abaixo para voltar a ler as exclusivas.</p>
        ) : (
          <p className="mt-2 text-sm text-neutral-700">Ainda não tem subscrição. Escolha um plano abaixo para ler as notícias exclusivas.</p>
        )}
        {pendente && <p className="mt-3 border-l-4 bg-[#eaf3ed] px-3 py-2 text-[13px]" style={{ borderColor: GREEN }}>Pedido de <b>{pendente.planName}</b> enviado a {dataEmTexto(pendente.createdAt)} (referência {pendente.reference}). Estamos a confirmar o pagamento.</p>}
        {recusado && !pendente && <p className="mt-3 border-l-4 border-[#d63638] bg-[#fcf0f1] px-3 py-2 text-[13px]">O seu último pedido ({recusado.planName}) não foi aceite{recusado.note ? `: ${recusado.note}` : ''}. Pode enviar um novo pedido abaixo.</p>}
        {msg && <p role="status" className="mt-3 text-[13px] font-semibold" style={{ color: GREEN }}>{msg}</p>}
      </div>

      {!redaccao && !pendente && (
        <form onSubmit={enviar} className={caixa}>
          <h2 className={titulo} style={{ color: GREEN }}>{activa ? 'Renovar subscrição' : 'Assinar'}</h2>
          {e.plans.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">Os planos ainda não estão disponíveis.</p>
          ) : (
            <>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {e.plans.map((p) => (
                  <label key={p.id} className={`flex cursor-pointer items-start gap-3 border p-3 ${p.id === planoId ? 'bg-[#eaf3ed]' : ''} ${p.price == null ? 'opacity-60' : ''}`} style={{ borderColor: p.id === planoId ? GREEN : '#d4d4d4' }}>
                    <input type="radio" name="plano" value={p.id} checked={p.id === planoId} disabled={p.price == null} onChange={() => setPlanoId(p.id)} className="mt-1 accent-[#047857]" />
                    <span className="text-[13px]"><b>{p.name}</b><br /><span className="text-neutral-600">{precoEmTexto(p)}</span></span>
                  </label>
                ))}
              </div>
              <div className="mt-4 bg-neutral-50 p-4 text-[13px] leading-relaxed text-neutral-700">
                <b>Como pagar</b>
                <p className="mt-1 whitespace-pre-line">{e.payment || 'As instruções de pagamento serão indicadas em breve.'}</p>
                <p className="mt-2 text-neutral-500">Depois de pagar, indique abaixo a referência (por exemplo, o código da transacção). Confirmamos e activamos a sua subscrição.</p>
              </div>
              <label className="mt-4 block text-[11px] font-bold uppercase text-neutral-500">
                Referência do pagamento
                <input value={referencia} onChange={(ev) => setReferencia(ev.target.value)} maxLength={80} required minLength={3} className="mt-1 h-10 w-full border border-neutral-300 px-3 text-sm font-normal normal-case text-neutral-800" placeholder="Ex.: código M-Pesa" />
              </label>
              {erro && <p className="mt-3 text-[13px] text-red-600">{erro}</p>}
              <button disabled={enviando || !escolhido || escolhido.price == null} className="mt-4 px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-white disabled:opacity-50" style={{ background: '#084030' }}>{enviando ? 'A enviar…' : 'Enviar pedido'}</button>
            </>
          )}
        </form>
      )}

      <div className={caixa}>
        <h2 className={titulo} style={{ color: GREEN }}>Últimas notícias exclusivas</h2>
        {e.exclusivas.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-600">Ainda não há notícias exclusivas publicadas.</p>
        ) : (
          <ul className="mt-2">
            {e.exclusivas.map((x) => (
              <li key={x.slug} className="flex items-baseline justify-between gap-3 border-b border-neutral-100 py-2.5 text-[13px] last:border-0">
                <Link href={`/noticias/${x.slug}`} className="min-w-0 font-semibold hover:text-[#047857]">{x.title}</Link>
                <span className="shrink-0 text-[11px] text-neutral-500">{x.category}</span>
              </li>
            ))}
          </ul>
        )}
        {!activa && !redaccao && <p className="mt-3 text-xs text-neutral-500">Sem subscrição activa, vê só o início de cada notícia exclusiva.</p>}
      </div>
    </div>
  );
}
