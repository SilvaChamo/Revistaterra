'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, Users, Globe, Search, Download, RefreshCw, FileText } from 'lucide-react';
import { countryFlag, countryName } from '@/lib/country';

type Period = { views: number; visitors: number };
type Stats = {
  online: number;
  daily: { day: string; views: number; visitors: number }[];
  summary: { today: Period; yesterday: Period; last7: Period; last30: Period; year: Period; total: Period; bounceRate: number; avgSessionSeconds: number };
  searchEngines: { name: string; total: number }[];
  searchEnginesTotal: number;
  recent: { path: string; country: string | null; device: string | null; referrer: string | null; at: string }[];
};

const PAGE_SIZE = 10;
const DEVICES: Record<string, string> = { desktop: 'Computador', mobile: 'Telemóvel', tablet: 'Tablet' };

const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

export default function TrafegoPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('14');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [now, setNow] = useState('');

  const load = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/stats?dias=${d}`, { credentials: 'include', cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Não foi possível carregar as estatísticas.');
      setData(j); setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
      setNow(new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('pt-PT'));
    }
  }, []);

  useEffect(() => { load(days); }, [days, load]);
  useEffect(() => { const t = setInterval(() => { if (document.visibilityState === 'visible') load(days); }, 60_000); return () => clearInterval(t); }, [days, load]);

  const s = data?.summary;
  const daily = data?.daily ?? [];
  const maxVisits = Math.max(1, ...daily.map((d) => d.views));
  const bar = (v: number) => (v === 0 ? 2 : Math.max((v / maxVisits) * 200, 5));
  const recent = (data?.recent ?? []).filter((r) => !filter || `${r.path} ${r.referrer ?? ''} ${countryName(r.country)}`.toLowerCase().includes(filter.toLowerCase()));
  const pages = Math.max(1, Math.ceil(recent.length / PAGE_SIZE));
  const rows = recent.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    if (!data) return;
    const lines = ['data;visitas;visitantes', ...data.daily.map((d) => `${d.day};${d.views};${d.visitors}`)];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    a.download = 'estatisticas-revista-terra.csv';
    a.click();
  };

  const cards = [
    { v: data?.online ?? 0, label: 'Visitantes online', Icon: Users, bg: 'from-teal-400 to-teal-600' },
    { v: s?.today.visitors ?? 0, label: 'Visitantes de hoje', Icon: Globe, bg: 'from-red-400 to-red-600' },
    { v: s?.today.views ?? 0, label: 'Páginas vistas hoje', Icon: FileText, bg: 'from-blue-400 to-blue-600' },
    { v: data?.searchEnginesTotal ?? 0, label: 'Vindos de motores de busca (30 dias)', Icon: Search, bg: 'from-purple-400 to-purple-600' },
  ];
  const summaryRows: [string, Period | undefined, boolean?][] = [
    ['Hoje', s?.today], ['Ontem', s?.yesterday], ['Últimos 7 dias', s?.last7], ['Últimos 30 dias', s?.last30], ['Este ano', s?.year], ['Total', s?.total, true],
  ];

  return (
    <div className="p-6 text-[#2c3338] w-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-700">Estatísticas de visitantes em tempo real</h1>
            <p className="text-sm text-gray-500">{now}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCsv} disabled={!data} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button onClick={() => load(days)} className="flex items-center gap-2 px-4 py-2 bg-[#047857] text-white rounded-md text-sm hover:bg-[#065f46]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </button>
        </div>
      </div>

      {error && <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ v, label, Icon, bg }) => (
          <div key={label} className={`bg-gradient-to-br ${bg} rounded-lg p-5 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">{v.toLocaleString('pt-PT')}</p>
                <p className="text-sm opacity-90 flex items-center gap-2 mt-1"><Icon className="w-4 h-4" /> {label}</p>
              </div>
              <Icon className="w-12 h-12 opacity-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> Relatório de tráfego</h2>
          <select value={days} onChange={(e) => { setDays(e.target.value); }} className="h-9 px-3 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:outline-none">
            <option value="7">Últimos 7 dias</option>
            <option value="14">Últimos 14 dias</option>
            <option value="30">Últimos 30 dias</option>
          </select>
        </div>
        <div className="h-64 flex items-end justify-between gap-2 px-4 max-sm:overflow-x-auto max-sm:pb-8">
          {daily.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1 max-sm:min-w-[28px]">
              <div className="w-full flex gap-0.5 items-end">
                <div className="flex-1 bg-blue-400 rounded-t" style={{ height: `${bar(d.views)}px` }} title={`Visitas: ${d.views}`} />
                <div className="flex-1 bg-amber-400 rounded-t" style={{ height: `${bar(d.visitors)}px` }} title={`Visitantes: ${d.visitors}`} />
              </div>
              <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left translate-y-4">{d.day.slice(8)}/{d.day.slice(5, 7)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-400 rounded" /><span className="text-sm text-gray-600">Visitas</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-400 rounded" /><span className="text-sm text-gray-600">Visitantes</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> Resumo das estatísticas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Período</th>
                  <th className="px-4 py-3 text-right text-gray-600 font-medium">Visitantes</th>
                  <th className="px-4 py-3 text-right text-gray-600 font-medium">Páginas vistas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summaryRows.map(([label, p, strong]) => (
                  <tr key={label} className={strong ? 'bg-green-50' : ''}>
                    <td className={`px-4 py-3 ${strong ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>{label}</td>
                    <td className={`px-4 py-3 text-right ${strong ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>{(p?.visitors ?? 0).toLocaleString('pt-PT')}</td>
                    <td className={`px-4 py-3 text-right ${strong ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>{(p?.views ?? 0).toLocaleString('pt-PT')}</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-3 text-gray-700">Taxa de rejeição</td>
                  <td className="px-4 py-3 text-right text-gray-600">{s ? `${s.bounceRate}%` : '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-400">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700">Duração média da sessão</td>
                  <td className="px-4 py-3 text-right text-gray-600">{s ? duration(s.avgSessionSeconds) : '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-blue-500" /> Motores de busca (30 dias)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Motor</th>
                  <th className="px-4 py-3 text-right text-gray-600 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.searchEngines ?? []).map((e) => (
                  <tr key={e.name}><td className="px-4 py-3 text-gray-700">{e.name}</td><td className="px-4 py-3 text-right text-gray-600">{e.total}</td></tr>
                ))}
                {data && data.searchEngines.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-3 text-gray-500">Ainda sem visitas vindas de motores de busca.</td></tr>
                )}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-gray-700">Total</td>
                  <td className="px-4 py-3 text-right text-gray-700">{data?.searchEnginesTotal ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Últimas visitas</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} placeholder="Pesquisar" className="h-9 w-48 pl-8 pr-3 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Página</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">País</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Dispositivo</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Origem</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r, i) => (
                <tr key={`${r.at}-${i}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 font-mono text-xs break-all">{r.path}</td>
                  <td className="px-4 py-3 text-gray-700"><span className="text-lg mr-2">{countryFlag(r.country)}</span>{countryName(r.country)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{DEVICES[r.device || 'desktop'] || r.device}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.referrer || 'Directo'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{new Date(r.at).toLocaleString('pt-PT', { timeZone: 'Africa/Maputo', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
              {data && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Ainda não há visitas registadas. Assim que o site público for visitado, aparecem aqui.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm disabled:opacity-40">&lt;</button>
            <span className="px-3 py-1 bg-blue-500 text-white rounded text-sm">{page}</span>
            <span className="text-sm text-gray-500">de {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm disabled:opacity-40">&gt;</button>
          </div>
        )}
      </div>
    </div>
  );
}
