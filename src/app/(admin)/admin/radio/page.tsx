'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Copy, ExternalLink, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import Spinner from '@/components/Common/Spinner';
import { DIAS_CURTOS, DIAS_LONGOS, ORDEM_DIAS, diasEmTexto, playsOn, toMinutes, type RadioSlot } from '@/lib/radio-types';

const novoId = () => Math.random().toString(36).slice(2, 10);
const input = 'h-9 w-full border border-[#8c8f94] bg-white px-2 text-[13px] focus:border-[#047857] focus:outline-none';

/** Gestão manual da programação da rádio: o que está aqui é o que aparece em /radio e na barra lateral do site. */
export default function RadioAdminPage() {
  const [slots, setSlots] = useState<RadioSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [filtro, setFiltro] = useState<number | 'todos'>('todos');
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/radio', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar a programação.');
      setSlots(data.slots);
      setDirty(false);
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err instanceof Error ? err.message : 'Erro ao carregar a programação.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // aviso ao sair com alterações por guardar
  useEffect(() => {
    if (!dirty) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [dirty]);

  const mudar = (id: string, parte: Partial<RadioSlot>) => {
    setSlots((l) => l.map((s) => (s.id === id ? { ...s, ...parte } : s)));
    setDirty(true);
    setMsg(null);
  };
  const alternarDia = (s: RadioSlot, d: number) => {
    const todos = s.days.length === 0 ? [0, 1, 2, 3, 4, 5, 6] : s.days;
    const novos = todos.includes(d) ? todos.filter((x) => x !== d) : [...todos, d];
    mudar(s.id, { days: novos.length === 7 ? [] : novos });
  };
  const adicionar = () => {
    setSlots((l) => [...l, { id: novoId(), days: filtro === 'todos' ? [] : [filtro], start: '08:00', end: '09:00', show: '', active: true }]);
    setDirty(true);
  };
  const duplicar = (s: RadioSlot) => {
    setSlots((l) => [...l, { ...s, id: novoId(), show: `${s.show} (cópia)` }]);
    setDirty(true);
  };
  const remover = (s: RadioSlot) => {
    if (!confirm(`Remover "${s.show || 'programa sem nome'}" da programação?`)) return;
    setSlots((l) => l.filter((x) => x.id !== s.id));
    setDirty(true);
  };

  async function enviar(corpo: { slots?: RadioSlot[]; reset?: boolean }, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/radio', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao guardar.');
      setSlots(data.slots);
      setDirty(false);
      setMsg({ tipo: 'ok', texto: ok });
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err instanceof Error ? err.message : 'Erro ao guardar.' });
    } finally {
      setBusy(false);
    }
  }

  const visiveis = useMemo(() => {
    const l = filtro === 'todos' ? slots : slots.filter((s) => playsOn({ ...s, active: true }, filtro));
    return [...l].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || toMinutes(a.end) - toMinutes(b.end));
  }, [slots, filtro]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size={28} className="" />
      </div>
    );
  }

  return (
    <div className="p-4 text-[#2c3338] sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1d2327]">Programação da rádio</h1>
          <p className="mt-1 max-w-xl text-[13px] text-[#50575e]">
            Defina aqui, à mão, os programas da Rádio +Agro: nome, horas e dias da semana. O site mostra esta lista na página da rádio e na barra lateral, e o leitor vê sempre o que está no ar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/radio" target="_blank" className="flex h-9 items-center gap-1.5 border border-[#047857] px-3 text-[13px] font-medium text-[#047857] hover:bg-[#f0f7f4]">
            <ExternalLink className="h-4 w-4" /> Ver no site
          </Link>
          <button onClick={() => enviar({ slots }, 'Programação guardada. Já está no site.')} disabled={busy || !dirty} className="flex h-9 items-center gap-1.5 bg-[#047857] px-4 text-[13px] font-medium text-white hover:bg-[#065f46] disabled:opacity-50">
            <Save className="h-4 w-4" /> {busy ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </div>

      {msg && (
        <p role="status" className={`mb-4 border-l-4 px-3 py-2 text-[13px] ${msg.tipo === 'ok' ? 'border-[#047857] bg-[#f0f7f4]' : 'border-[#d63638] bg-[#fcf0f1]'}`}>
          {msg.texto}
        </p>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <CalendarDays className="mr-1 h-4 w-4 text-[#047857]" />
        {(['todos', ...ORDEM_DIAS] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFiltro(d)}
            className={`h-8 px-3 text-[12px] font-bold ${filtro === d ? 'bg-[#047857] text-white' : 'border border-[#ccd0d4] bg-white text-[#2c3338] hover:bg-[#f6f7f7]'}`}
          >
            {d === 'todos' ? 'Todos' : DIAS_CURTOS[d]}
          </button>
        ))}
        <button onClick={adicionar} className="ml-auto flex h-8 items-center gap-1 border border-[#047857] bg-white px-3 text-[12px] font-bold text-[#047857] hover:bg-[#f0f7f4]">
          <Plus className="h-4 w-4" /> Novo programa
        </button>
      </div>

      {visiveis.length === 0 ? (
        <p className="border border-[#ccd0d4] bg-white p-6 text-center text-[13px] text-[#50575e]">Sem programas {filtro === 'todos' ? '' : `à ${DIAS_LONGOS[filtro].toLowerCase()}`}. Use “Novo programa” para adicionar.</p>
      ) : (
        <ul className="space-y-3">
          {visiveis.map((s) => (
            <li key={s.id} className={`border border-[#ccd0d4] bg-white p-3 sm:p-4 ${s.active ? '' : 'opacity-60'}`}>
              <div className="grid gap-3 sm:grid-cols-[110px_110px_1fr]">
                <label className="text-[11px] font-bold uppercase text-[#50575e]">
                  Início
                  <input type="time" value={s.start} onChange={(e) => mudar(s.id, { start: e.target.value })} className={`${input} mt-1`} />
                </label>
                <label className="text-[11px] font-bold uppercase text-[#50575e]">
                  Fim
                  <input type="time" value={s.end} onChange={(e) => mudar(s.id, { end: e.target.value })} className={`${input} mt-1`} />
                </label>
                <label className="text-[11px] font-bold uppercase text-[#50575e]">
                  Nome do programa
                  <input value={s.show} maxLength={80} placeholder="Ex.: CONVERSAS DE CLIMA" onChange={(e) => mudar(s.id, { show: e.target.value })} className={`${input} mt-1`} />
                </label>
              </div>
              <label className="mt-3 block text-[11px] font-bold uppercase text-[#50575e]">
                Descrição (opcional, aparece na página da rádio)
                <input value={s.description ?? ''} maxLength={200} onChange={(e) => mudar(s.id, { description: e.target.value })} className={`${input} mt-1`} />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex flex-wrap gap-1" role="group" aria-label="Dias em que passa">
                  {ORDEM_DIAS.map((d) => {
                    const on = s.days.length === 0 || s.days.includes(d);
                    return (
                      <button key={d} type="button" aria-pressed={on} onClick={() => alternarDia(s, d)} className={`h-8 w-11 text-[12px] font-bold ${on ? 'bg-[#047857] text-white' : 'border border-[#ccd0d4] bg-white text-[#50575e] hover:bg-[#f6f7f7]'}`}>
                        {DIAS_CURTOS[d]}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[12px] text-[#50575e]">{diasEmTexto(s.days)}</span>
                <div className="ml-auto flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 text-[12px]">
                    <input type="checkbox" checked={s.active} onChange={(e) => mudar(s.id, { active: e.target.checked })} className="accent-[#047857]" /> No ar
                  </label>
                  <button onClick={() => duplicar(s)} title="Duplicar" aria-label="Duplicar programa" className="flex h-8 w-8 items-center justify-center border border-[#ccd0d4] hover:bg-[#f6f7f7]">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={() => remover(s)} title="Remover" aria-label="Remover programa" className="flex h-8 w-8 items-center justify-center border border-[#ccd0d4] text-[#d63638] hover:bg-[#fcf0f1]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#ccd0d4] pt-4">
        <p className="text-[12px] text-[#50575e]">As horas são de Maputo. Sem dias marcados, o programa passa todos os dias.</p>
        <button
          onClick={() => confirm('Voltar à programação base que estava no site? Perde as alterações feitas aqui.') && enviar({ reset: true }, 'Programação base restaurada.')}
          disabled={busy}
          className="flex h-8 items-center gap-1.5 border border-[#ccd0d4] bg-white px-3 text-[12px] hover:bg-[#f6f7f7] disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" /> Voltar à programação base
        </button>
      </div>
    </div>
  );
}
