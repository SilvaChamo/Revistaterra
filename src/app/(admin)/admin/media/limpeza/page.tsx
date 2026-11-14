'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2, RefreshCw, ShieldCheck, Search } from 'lucide-react';
import Link from 'next/link';
import Spinner from '@/components/Common/Spinner';
import Paginacao from '@/components/Paginacao';

type Foto = {
  name: string; url: string; size: number; created: string;
  news: { id: string; title: string }[]; config: boolean; protegida: boolean; group: string; copies: number;
};
type Vista = 'sem' | 'repetidas' | 'usadas' | 'todas';

const ITEMS_PER_PAGE = 48;
const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const emUso = (f: Foto) => f.news.length > 0 || f.config || f.protegida;

export default function MediaCleanupPage() {
  const [files, setFiles] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [vista, setVista] = useState<Vista>('sem');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/media/limpeza', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Não foi possível analisar a biblioteca.');
      setFiles(data.files);
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao analisar a biblioteca.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [vista, search]);

  const sem = useMemo(() => files.filter((f) => !emUso(f)), [files]);
  const repetidas = useMemo(() => files.filter((f) => f.copies > 1), [files]);
  const shown = useMemo(() => {
    const base = vista === 'sem' ? sem : vista === 'repetidas' ? [...repetidas].sort((a, b) => a.group.localeCompare(b.group) || b.size - a.size) : vista === 'usadas' ? files.filter(emUso) : files;
    const q = search.trim().toLowerCase();
    return q ? base.filter((f) => f.name.toLowerCase().includes(q)) : base;
  }, [vista, files, sem, repetidas, search]);

  // Das repetidas, fica uma de cada grupo: a que está numa notícia ou na configuração, senão a maior; as outras (sem uso) ficam marcadas.
  const selectExtras = () => {
    const next = new Set<string>();
    for (const g of new Set(repetidas.map((f) => f.group))) {
      const grp = files.filter((f) => f.group === g);
      const keep = grp.find(emUso) ?? [...grp].sort((a, b) => b.size - a.size)[0];
      for (const f of grp) if (f !== keep && !emUso(f)) next.add(f.name);
    }
    setSelected(next);
    setVista('repetidas');
  };

  const toggle = (name: string) => setSelected((s) => { const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n; });

  const trash = async () => {
    const names = [...selected];
    if (!names.length) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/media/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'trash', names }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Não foi possível mover as fotos.');
      setNotice(`${data.moved ?? names.length} foto(s) movida(s) para o lixo da galeria (podem ser restauradas lá).`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao mover as fotos.');
    } finally {
      setBusy(false);
    }
  };

  const tab = (v: Vista, label: string, n: number) => (
    <button key={v} onClick={() => setVista(v)} className={`h-9 border px-3 text-[13px] ${vista === v ? 'border-[#047857] bg-[#047857] font-bold text-white' : 'border-[#ccd0d4] bg-white text-[#2c3338] hover:border-[#047857]'}`}>{label} ({n})</button>
  );
  const page_ = shown.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="p-6 text-[#2c3338]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-normal text-[#1d2327]">Limpeza de Media</h1>
          <p className="text-[13px] text-[#50575e]">Veja que fotos estão numa notícia, quais estão repetidas e quais não servem a nenhuma. Eliminar move para o lixo da galeria, de onde se pode restaurar.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-[3px] border border-[#ccd0d4] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f6f7f7]">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>

      {error && <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mb-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        {tab('sem', 'Sem notícia', sem.length)}
        {tab('repetidas', 'Repetidas', repetidas.length)}
        {tab('usadas', 'Em uso', files.length - sem.length)}
        {tab('todas', 'Todas', files.length)}
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border border-[#ccd0d4] bg-white p-4 md:flex-row">
        <div className="relative w-full md:w-80">
          <input type="text" placeholder="Pesquisar pelo nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full rounded-[3px] border border-[#ccd0d4] pl-10 pr-4 text-sm outline-none focus:border-[#047857]" />
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#50575e]" />
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <button onClick={selectExtras} disabled={repetidas.length === 0} className="h-10 whitespace-nowrap rounded-[3px] border border-[#ccd0d4] bg-white px-4 text-sm font-semibold hover:border-[#047857] disabled:opacity-50">Marcar as repetidas a mais</button>
          <span className="text-sm text-[#50575e]">{selected.size} selecionadas</span>
          <button onClick={trash} disabled={selected.size === 0 || busy} className="flex h-10 items-center gap-2 rounded-[3px] bg-[#d63638] px-5 text-sm font-bold text-white hover:bg-[#b32d2e] disabled:opacity-50">
            <Trash2 className="h-4 w-4" /> {busy ? 'A mover...' : 'Mover para o lixo'}
          </button>
        </div>
      </div>

      <div className="min-h-[300px] border-x border-b border-[#ccd0d4] bg-white p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Spinner size={48} className="mb-4" /><p className="text-[#50575e]">A analisar a biblioteca e as notícias...</p></div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck className="mb-3 h-10 w-10 text-green-500" />
            <h3 className="text-xl font-bold text-[#1d2327]">Nada por aqui</h3>
            <p className="max-w-md text-[#50575e]">Nenhuma foto nesta lista.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {page_.map((f) => {
                const locked = emUso(f);
                return (
                  <div key={f.name} className={`flex flex-col overflow-hidden border ${selected.has(f.name) ? 'border-[#047857] ring-4 ring-[#047857]' : 'border-[#ccd0d4]'}`}>
                    <button type="button" disabled={locked} onClick={() => toggle(f.name)} className={`aspect-square bg-[#f0f0f1] ${locked ? 'cursor-default' : 'cursor-pointer'}`} title={locked ? 'Em uso: não se pode eliminar' : 'Selecionar'}>
                      <img src={f.url} alt={f.name} loading="lazy" className="h-full w-full object-cover" />
                    </button>
                    <div className="space-y-1 border-t border-[#f0f0f1] bg-white p-2 text-[11px] leading-snug">
                      <div className="truncate font-semibold" title={f.name}>{f.name.split('/').pop()}</div>
                      <div className="text-[#50575e]">{kb(f.size)}{f.copies > 1 && <span className="ml-1 font-bold text-amber-700">· repetida ×{f.copies}</span>}</div>
                      {f.news.length > 0 ? (
                        <div className="text-green-700">Notícia: {f.news.slice(0, 1).map((n) => <Link key={n.id} href={`/admin/noticias/editar/${n.id}`} className="underline">{n.title.slice(0, 40)}</Link>)}{f.news.length > 1 && ` +${f.news.length - 1}`}</div>
                      ) : f.config ? <div className="text-green-700">Usada na configuração do site</div>
                        : f.protegida ? <div className="text-green-700">Foto do site (protegida)</div>
                        : <div className="text-amber-700">Sem notícia</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <Paginacao page={page} pages={Math.ceil(shown.length / ITEMS_PER_PAGE)} total={shown.length} unit="fotos" onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
