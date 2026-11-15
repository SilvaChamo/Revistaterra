'use client';

import { useState } from 'react';
import { DownloadCloud } from 'lucide-react';

/** Passa para este projecto as fotos das notícias que ainda estão no WordPress, aos poucos, até acabar. */
export default function ImportarWordpress({ onDone }: { onDone?: () => void }) {
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState('');
  const [failed, setFailed] = useState<string[]>([]);

  const run = async () => {
    setRunning(true);
    setFailed([]);
    setMsg('A importar…');
    let skip: string[] = [];
    let total = 0;
    const lost: string[] = [];
    try {
      for (let i = 0; i < 500; i++) {
        const res = await fetch('/api/admin/importar-imagens', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skip }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Não foi possível importar.');
        total += data.importadas;
        skip = [...skip, ...data.ids_com_falha];
        lost.push(...data.falhadas);
        setMsg(`${total} fotos importadas · faltam ${data.restantes} notícias`);
        if (!data.restantes || (!data.importadas && !data.actualizadas && !data.ids_com_falha.length)) break;
      }
      setFailed([...new Set(lost)]);
      setMsg((m) => `${m} · concluído`);
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
        <p className="font-bold text-[#1d2327]">Importar fotos do WordPress</p>
        <p className="text-[#50575e]">Copia para o armazenamento do projecto as fotos que as notícias ainda lêem do WordPress.</p>
        {msg && <p className="mt-1 text-[#047857]">{msg}</p>}
        {failed.length > 0 && <p className="mt-1 text-red-600">{failed.length} fotos já não existem no WordPress e ficaram por importar.</p>}
      </div>
      <button onClick={run} disabled={running} className="flex items-center gap-2 rounded bg-[#047857] px-4 py-2 font-medium text-white hover:bg-[#065f46] disabled:opacity-50">
        <DownloadCloud className="h-4 w-4" /> {running ? 'A importar…' : 'Importar agora'}
      </button>
    </div>
  );
}
