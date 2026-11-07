'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Users, Search } from 'lucide-react';
import { countryFlag, countryName } from '@/lib/country';

type Row = { country: string; visitors: number };

export default function TrafegoPaisesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    fetch('/api/admin/stats?dias=1&periodo=30', { credentials: 'include', cache: 'no-store' })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Erro ao carregar.'); return j; })
      .then((j) => live && setRows(j.countries))
      .catch((e) => live && setError(e instanceof Error ? e.message : 'Erro ao carregar.'));
    return () => { live = false; };
  }, []);

  const list = rows ?? [];
  const total = list.reduce((a, c) => a + c.visitors, 0);
  const filtered = list.filter((c) => countryName(c.country).toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 text-[#2c3338]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1d2327]">Visitantes por país</h1>
        <p className="text-[#50575e] mt-1">Distribuição geográfica do tráfego (últimos 30 dias)</p>
      </div>

      {error && <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-[#ccd0d4] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#047857]/10 rounded-lg flex items-center justify-center"><Globe className="w-5 h-5 text-[#047857]" /></div>
            <div>
              <p className="text-sm text-[#50575e]">Total de países</p>
              <p className="text-2xl font-bold text-[#1d2327]">{list.filter((c) => c.country !== '??').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#ccd0d4] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-[#50575e]">Total de visitantes</p>
              <p className="text-2xl font-bold text-[#1d2327]">{total.toLocaleString('pt-PT')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#50575e]" />
          <input type="text" placeholder="Pesquisar país..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-10 pl-10 pr-4 border border-[#ccd0d4] rounded-md focus:border-[#047857] focus:outline-none" />
        </div>
      </div>

      <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#50575e]">País</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#50575e]">Visitantes</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#50575e]">Percentagem</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#50575e]">Barra</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f1]">
            {filtered.map((c) => {
              const pct = total ? Math.round((c.visitors / total) * 1000) / 10 : 0;
              return (
                <tr key={c.country} className="hover:bg-[#f6f7f7]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{countryFlag(c.country)}</span>
                      <div>
                        <p className="font-medium text-[#1d2327]">{countryName(c.country)}</p>
                        <p className="text-xs text-[#50575e]">{c.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#1d2327] font-medium">{c.visitors.toLocaleString('pt-PT')}</td>
                  <td className="px-4 py-3 text-[#50575e]">{pct}%</td>
                  <td className="px-4 py-3 w-48">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#047857] rounded-full" style={{ width: `${pct}%` }} /></div>
                  </td>
                </tr>
              );
            })}
            {rows && filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-[#50575e]">Ainda não há visitas registadas com país.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
