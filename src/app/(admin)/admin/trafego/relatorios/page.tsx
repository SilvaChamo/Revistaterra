'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Smartphone, Monitor, Tablet, Link2 } from 'lucide-react';
import NewsletterReport from '@/components/Admin/NewsletterReport';

type Stats = {
  summary: { last7: { views: number; visitors: number }; last30: { views: number; visitors: number }; bounceRate: number; avgSessionSeconds: number; total: { views: number; visitors: number } };
  pages: { path: string; views: number }[];
  news: { slug: string; title: string; views: number }[];
  devices: { device: string; views: number }[];
  referrers: { referrer: string; views: number }[];
};

const RANGES: [string, string, number][] = [['7d', '7 dias', 7], ['30d', '30 dias', 30], ['90d', '90 dias', 90]];
const DEVICE_LABEL: Record<string, string> = { desktop: 'Computador', mobile: 'Telemóvel', tablet: 'Tablet' };
const DeviceIcon = ({ d }: { d: string }) => (d === 'mobile' ? <Smartphone className="w-4 h-4" /> : d === 'tablet' ? <Tablet className="w-4 h-4" /> : <Monitor className="w-4 h-4" />);

export default function TrafegoRelatoriosPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const n = RANGES.find((r) => r[0] === range)?.[2] ?? 30;

  useEffect(() => {
    let live = true;
    fetch(`/api/admin/stats?dias=${n}&periodo=${n}`, { credentials: 'include', cache: 'no-store' })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Erro ao carregar.'); return j; })
      .then((j) => { if (live) { setData(j); setError(''); } })
      .catch((e) => live && setError(e instanceof Error ? e.message : 'Erro ao carregar.'));
    return () => { live = false; };
  }, [n]);

  const views = (data?.pages ?? []).reduce((a, p) => a + p.views, 0);
  const devTotal = (data?.devices ?? []).reduce((a, d) => a + d.views, 0) || 1;
  const download = () => {
    if (!data) return;
    const lines = ['pagina;visitas', ...data.pages.map((p) => `${p.path};${p.views}`)];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    a.download = `paginas-mais-vistas-${range}.csv`;
    a.click();
  };

  return (
    <div className="p-6 text-[#2c3338]">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1d2327]">Relatórios detalhados</h1>
          <p className="text-[#50575e] mt-1">Análise completa do tráfego do site</p>
        </div>
        <button onClick={download} disabled={!data} className="flex items-center gap-2 px-4 py-2 bg-[#047857] text-white rounded-lg hover:bg-[#065f46] disabled:opacity-50">
          <Download className="w-4 h-4" /> Exportar páginas
        </button>
      </div>

      {error && <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white border border-[#ccd0d4] rounded-lg p-1">
          {RANGES.map(([id, label]) => (
            <button key={id} onClick={() => setRange(id)} className={`px-4 py-2 rounded-md text-sm font-medium ${range === id ? 'bg-[#047857] text-white' : 'text-[#50575e] hover:bg-[#f6f7f7]'}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Visitas (7 dias)', value: data?.summary.last7.views },
          { label: 'Visitantes (30 dias)', value: data?.summary.last30.visitors },
          { label: 'Taxa de rejeição', value: data ? `${data.summary.bounceRate}%` : undefined },
          { label: 'Visitas no total', value: data?.summary.total.views },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#ccd0d4] rounded-lg p-4">
            <p className="text-sm text-[#50575e]">{stat.label}</p>
            <span className="text-2xl font-bold text-[#1d2327]">{typeof stat.value === 'number' ? stat.value.toLocaleString('pt-PT') : stat.value ?? '-'}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-semibold text-[#1d2327] border-b border-[#f0f0f1]">Notícias mais lidas</h2>
          <table className="w-full">
            <tbody className="divide-y divide-[#f0f0f1]">
              {(data?.news ?? []).map((nw) => (
                <tr key={nw.slug} className="hover:bg-[#f6f7f7]">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><FileText className="w-4 h-4 text-[#047857] shrink-0" /><span className="text-sm text-[#1d2327] line-clamp-1">{nw.title}</span></div></td>
                  <td className="px-4 py-3 text-right text-sm text-[#50575e] whitespace-nowrap">{nw.views}</td>
                </tr>
              ))}
              {data && data.news.length === 0 && <tr><td className="px-4 py-6 text-sm text-center text-[#50575e]">Ainda sem leituras neste período.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-semibold text-[#1d2327] border-b border-[#f0f0f1]">Páginas mais vistas</h2>
          <table className="w-full">
            <tbody className="divide-y divide-[#f0f0f1]">
              {(data?.pages ?? []).map((p) => (
                <tr key={p.path} className="hover:bg-[#f6f7f7]">
                  <td className="px-4 py-3 text-sm text-[#1d2327] font-mono break-all">{p.path}</td>
                  <td className="px-4 py-3 text-right text-sm text-[#50575e] whitespace-nowrap">{p.views}{views ? ` · ${Math.round((p.views / views) * 100)}%` : ''}</td>
                </tr>
              ))}
              {data && data.pages.length === 0 && <tr><td className="px-4 py-6 text-sm text-center text-[#50575e]">Ainda sem visitas neste período.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-semibold text-[#1d2327] border-b border-[#f0f0f1]">Dispositivos</h2>
          <div className="divide-y divide-[#f0f0f1]">
            {(data?.devices ?? []).map((d) => (
              <div key={d.device} className="px-4 py-3">
                <div className="flex items-center justify-between text-sm text-[#1d2327]"><span className="flex items-center gap-2"><DeviceIcon d={d.device} />{DEVICE_LABEL[d.device] || d.device}</span><span className="text-[#50575e]">{Math.round((d.views / devTotal) * 100)}%</span></div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#047857] rounded-full" style={{ width: `${(d.views / devTotal) * 100}%` }} /></div>
              </div>
            ))}
            {data && data.devices.length === 0 && <p className="px-4 py-6 text-sm text-center text-[#50575e]">Sem dados neste período.</p>}
          </div>
        </div>

        <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-semibold text-[#1d2327] border-b border-[#f0f0f1]">Origens do tráfego</h2>
          <table className="w-full">
            <tbody className="divide-y divide-[#f0f0f1]">
              {(data?.referrers ?? []).map((r) => (
                <tr key={r.referrer} className="hover:bg-[#f6f7f7]">
                  <td className="px-4 py-3 text-sm text-[#1d2327]"><span className="flex items-center gap-2"><Link2 className="w-4 h-4 text-[#047857]" />{r.referrer}</span></td>
                  <td className="px-4 py-3 text-right text-sm text-[#50575e]">{r.views}</td>
                </tr>
              ))}
              {data && data.referrers.length === 0 && <tr><td className="px-4 py-6 text-sm text-center text-[#50575e]">Só visitas directas neste período.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8"><NewsletterReport /></div>
    </div>
  );
}
