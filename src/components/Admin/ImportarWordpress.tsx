'use client';

import { useState } from 'react';
import { DownloadCloud } from 'lucide-react';

type Cursor = { t: number; p: number };
const TIPOS = ['Destaques', 'Notícias', 'Fora de Campo', 'Opinião'];

/** Passa para este projecto as notícias e as fotos que ainda estão no WordPress, aos poucos, até acabar. */
export default function ImportarWordpress({ onDone }: { onDone?: () => void }) {
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState('');
  const [failed, setFailed] = useState<string[]>([]);

  const post = async (body: object) => {
    // Repete até 3 vezes se a ligação falhar: uma falha pontual não deve parar tudo.
    let last = 'Não foi possível importar.';
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch('/api/admin/importar-imagens', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (res.ok) return data;
        last = data?.error || last;
      } catch {
        last = 'Sem ligação ao servidor.';
      }
    }
    throw new Error(last);
  };

  const run = async () => {
    setRunning(true);
    setFailed([]);
    const lost: string[] = [];
    try {
      // 1.ª fase: as notícias do WordPress que ainda não existem aqui (texto, categoria, data e fotos).
      let cursor: Cursor | null = { t: 0, p: 1 };
      let criadas = 0, existiam = 0;
      while (cursor) {
        setMsg(`Notícias: ${TIPOS[cursor.t]} (página ${cursor.p}) · ${criadas} novas, ${existiam} já existiam`);
        const d: { criadas: number; jaExistiam: number; erros: string[]; proximo: Cursor | null } = await post({ fase: 'noticias', cursor });
        criadas += d.criadas;
        existiam += d.jaExistiam;
        lost.push(...d.erros);
        cursor = d.proximo;
      }
      // 2.ª fase: fotos das notícias que já existiam aqui mas ainda apontam para o WordPress.
      let skip: string[] = [];
      let total = 0;
      for (let i = 0; i < 500; i++) {
        const d = await post({ skip });
        total += d.importadas;
        skip = [...skip, ...d.ids_com_falha];
        lost.push(...d.falhadas);
        setMsg(`${criadas} notícias novas · fotos antigas: ${total} importadas, faltam ${d.restantes} notícias`);
        if (!d.restantes || (!d.importadas && !d.actualizadas && !d.ids_com_falha.length)) break;
      }
      setFailed([...new Set(lost)]);
      setMsg(`Concluído: ${criadas} notícias novas (${existiam} já existiam) e ${total} fotos antigas importadas.`);
      onDone?.();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Não foi possível importar.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded border border-[#ccd0d4] bg-white p-4 text-[13px]">
      <div className="min-w-[220px] flex-1">
        <p className="font-bold text-[#1d2327]">Importar do WordPress</p>
        <p className="text-[#50575e]">Passa para este projecto as notícias e as fotos que ainda estão no WordPress. Pode repetir: o que já existe não duplica.</p>
        {msg && <p className="mt-1 text-[#047857]">{msg}</p>}
        {failed.length > 0 && <p className="mt-1 text-red-600">{failed.length} itens não foram importados (foto em falta ou erro).</p>}
      </div>
      <button onClick={run} disabled={running} className="flex items-center gap-2 rounded bg-[#047857] px-4 py-2 font-medium text-white hover:bg-[#065f46] disabled:opacity-50">
        <DownloadCloud className="h-4 w-4" /> {running ? 'A importar…' : 'Importar agora'}
      </button>
    </div>
  );
}
