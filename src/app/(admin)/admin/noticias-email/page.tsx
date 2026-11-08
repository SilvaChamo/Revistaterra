'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Mail, RefreshCw, Save } from 'lucide-react';
import Spinner from '@/components/Common/Spinner';

type Item = { title: string; status: 'published' | 'scheduled' | 'pending' | 'erro'; note: string; id?: string };
type Entry = { at: string; from: string; subject: string; items: Item[]; note?: string };
type Data = { configured: boolean; address: string; settings: { senders: string[]; requireVerified: boolean; share: boolean }; entries: Entry[] };

const ESTADO: Record<Item['status'], { texto: string; cls: string }> = {
  published: { texto: 'Publicada', cls: 'bg-green-50 text-green-800' },
  scheduled: { texto: 'Agendada', cls: 'bg-blue-50 text-blue-800' },
  pending: { texto: 'Pendente', cls: 'bg-amber-50 text-amber-800' },
  erro: { texto: 'Erro', cls: 'bg-red-50 text-red-700' },
};

function Interruptor({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? 'bg-[#047857]' : 'bg-[#c3c4c7]'}`}>
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function NoticiasEmailPage() {
  const [data, setData] = useState<Data | null>(null);
  const [senders, setSenders] = useState('');
  const [verified, setVerified] = useState(true);
  const [share, setShare] = useState(true);
  const [busy, setBusy] = useState<'guardar' | 'verificar' | ''>('');
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [aba, setAba] = useState<'info' | 'noticias'>('info');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/noticias-email', { credentials: 'include' });
    if (!res.ok) return;
    const d = (await res.json()) as Data;
    setData(d);
    setSenders(d.settings.senders.join('\n'));
    setVerified(d.settings.requireVerified);
    setShare(d.settings.share);
  }, []);
  useEffect(() => { load(); }, [load]);

  const guardar = async () => {
    setBusy('guardar'); setMsg(null);
    const res = await fetch('/api/admin/noticias-email', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senders: senders.split(/[\s,;]+/).filter(Boolean), requireVerified: verified, share }),
    });
    const b = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return setMsg({ tipo: 'erro', texto: b.error || 'Não foi possível guardar.' });
    setSenders((b.settings.senders as string[]).join('\n'));
    setMsg({ tipo: 'ok', texto: 'Guardado.' });
  };

  const verificar = async () => {
    setBusy('verificar'); setMsg(null);
    const res = await fetch('/api/admin/noticias-email', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verificar' }) });
    const b = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return setMsg({ tipo: 'erro', texto: b.error || 'Não foi possível verificar o e-mail.' });
    const r = b.result;
    setMsg({ tipo: 'ok', texto: r.mails === 0 ? 'Sem e-mails novos.' : `${r.mails} e-mail(s) lido(s): ${r.created} notícia(s) criada(s), ${r.pending} nos pendentes, ${r.failed} com erro.` });
    load();
    setAba('noticias'); // as notícias lidas caem no separador da lista
  };

  const itens = data ? data.entries.flatMap((e) => e.items.map((it) => ({ ...it, from: e.from, at: e.at }))) : [];

  if (!data) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner /></div>;

  return (
    <div className="p-4 text-[#2c3338] sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#1d2327]">Notícias por e-mail</h1>
          <p className="mt-1 max-w-xl text-[13px] text-[#50575e]">Envie um Word com notícias para o e-mail info@: o sistema lê o e-mail e cria cada notícia</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a href="/api/admin/noticias-email/modelo" className="flex h-9 items-center gap-1.5 border border-[#047857] px-4 text-[13px] font-medium text-[#047857] hover:bg-[#f0f7f4]">
            <Download className="h-4 w-4" /> Modelo de Word
          </a>
          <button onClick={verificar} disabled={busy !== '' || !data.configured} className="flex h-9 items-center gap-1.5 bg-[#047857] px-4 text-[13px] font-medium text-white hover:bg-[#065f46] disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${busy === 'verificar' ? 'animate-spin' : ''}`} /> Verificar agora
          </button>
        </div>
      </div>

      {!data.configured && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-800">O e-mail info@ ainda não está ligado ao servidor (faltam IMAP_HOST, IMAP_USER e IMAP_PASS). Enquanto isso, nada é lido.</div>
      )}
      {msg && <div className={`mb-4 rounded-md border px-4 py-2 text-[13px] ${msg.tipo === 'ok' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'}`}>{msg.texto}</div>}

      <div className="mb-4 flex border-b border-[#ccd0d4]">
        {([['info', 'Explicação e definições'], ['noticias', `Notícias recebidas${itens.length ? ` (${itens.length})` : ''}`]] as const).map(([id, nome]) => (
          <button key={id} type="button" onClick={() => setAba(id)} className={`-mb-px px-5 py-2.5 text-[13px] font-medium ${aba === id ? 'border-b-2 border-[#047857] text-[#065f46]' : 'text-[#50575e] hover:text-[#065f46]'}`}>{nome}</button>
        ))}
      </div>

      {aba === 'info' && (<>
      <div className="divide-y divide-[#ccd0d4] overflow-hidden rounded-[8px] border border-[#ccd0d4] bg-white">
        <div className="p-4">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-[#1d2327]"><Mail className="h-4 w-4 text-[#047857]" /> Remetentes autorizados</p>
          <p className="mt-0.5 text-[13px] leading-5 text-[#50575e]">
            Só os e-mails destes endereços são lidos{data.address ? <> (e-mail lido: <strong>{data.address}</strong>)</> : null}. Um por linha: um endereço completo ou todo um domínio, como @revistaterra.com.
          </p>
          <textarea value={senders} onChange={(e) => setSenders(e.target.value)} rows={4} placeholder="jornalista@exemplo.com" className="mt-3 w-full border border-[#8c8f94] p-3 text-[13px] focus:border-[#047857] focus:outline-none" />
        </div>
        <div className="flex items-start gap-3 p-4">
          <Interruptor on={verified} onClick={() => setVerified(!verified)} label="Exigir confirmação do remetente" />
          <div>
            <p className="text-[14px] font-semibold text-[#1d2327]">Exigir confirmação do remetente</p>
            <p className="mt-0.5 text-[13px] leading-5 text-[#50575e]">Só publica sozinho se o servidor de e-mail confirmar quem enviou (SPF/DKIM). Sem confirmação, a notícia fica nos pendentes. Recomendado, para um e-mail forjado não ir para o ar.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <Interruptor on={share} onClick={() => setShare(!share)} label="Partilhar nas redes sociais" />
          <div>
            <p className="text-[14px] font-semibold text-[#1d2327]">Partilhar nas redes sociais</p>
            <p className="mt-0.5 text-[13px] leading-5 text-[#50575e]">Ao publicar (já ou na hora agendada), a notícia segue para as redes ligadas em Redes sociais.</p>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[13px] leading-6 text-[#50575e]">
            <strong className="text-[#1d2327]">Como funciona:</strong> com foto, a notícia é publicada logo, ou agendada se tiver data futura. Sem foto (ou com qualquer dúvida no documento), fica em Notícias Pendentes: ponha a foto e publique. O campo «Foto:» aceita a imagem colada no Word ou o nome de um ficheiro anexado ao e-mail.
          </p>
        </div>
      </div>

      <button onClick={guardar} disabled={busy !== ''} className="mt-4 flex h-9 items-center gap-1.5 bg-[#047857] px-5 text-[13px] font-medium text-white hover:bg-[#065f46] disabled:opacity-50">
        <Save className="h-4 w-4" /> Guardar
      </button>

      </>)}

      {aba === 'noticias' && (
        itens.length === 0 ? (
          <p className="rounded-[8px] border border-[#ccd0d4] bg-white p-4 text-[13px] text-[#50575e]">Ainda não chegou nenhuma notícia por e-mail. Quando o sistema ler um Word, as notícias aparecem aqui, com o estado de cada uma.</p>
        ) : (
          <div className="divide-y divide-[#ccd0d4] overflow-hidden rounded-[8px] border border-[#ccd0d4] bg-white">
            {data.entries.filter((e) => e.note).map((e, i) => (
              <p key={`n${i}`} className="p-4 text-[12px] text-red-700">{e.subject}: {e.note}</p>
            ))}
            {itens.map((it, j) => (
              <div key={j} className="flex flex-wrap items-start gap-3 p-4 text-[13px]">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${ESTADO[it.status].cls}`}>{ESTADO[it.status].texto}</span>
                <div className="min-w-0 flex-1">
                  {it.id ? <Link href={`/admin/noticias/editar/${it.id}`} className="font-medium text-[#047857] hover:underline">{it.title}</Link> : <span className="font-medium">{it.title}</span>}
                  <p className="mt-0.5 text-[#50575e]">{it.note}</p>
                  <p className="mt-0.5 text-[12px] text-[#646970]">{it.from} · {new Date(it.at).toLocaleString('pt-PT')}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
