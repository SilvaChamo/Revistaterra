import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { GREEN, terra } from '@/lib/terra';

export const metadata = { title: 'Cotações — Revista Terra', robots: { index: false, follow: false } };

const num = (s: string) => parseFloat(s.replace(',', '.'));
const regions = [
  { name: 'Região Norte', items: ['Niassa', 'Cabo Delgado', 'Nampula'] },
  { name: 'Região Centro', items: ['Zambézia', 'Tete', 'Sofala', 'Manica'] },
  { name: 'Região Sul', items: ['Inhambane', 'Gaza', 'Maputo'] },
];

export default function Cotacoes() {
  const [head, ...rows] = terra.icm;
  const milho = rows.filter((r) => r[1] && r[1] !== '—').map((r) => ({ prov: r[0], v: num(r[1]), branco: ['Inhambane', 'Maputo'].includes(r[0]) })).sort((a, b) => a.v - b.v);
  const max = Math.max(...milho.map((m) => m.v));
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Cotações' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="ICM" title="Cotações ICM" lead="Preços médios de referência dos cereais e dos restantes produtos agrícolas nas dez províncias de Moçambique." />
          <div className="bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-[15px] font-bold uppercase" style={{ color: GREEN }}>Cereais — médias provinciais</h2>
            <p className="mb-3 text-xs text-neutral-500">Valores em meticais por quilograma. — significa média indisponível. Deslize a tabela para os lados.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead><tr className="text-left text-white" style={{ background: GREEN }}>{head.map((h) => <th key={h} className="px-3 py-2 text-xs font-bold uppercase">{h}</th>)}</tr></thead>
                <tbody>{rows.map((r, i) => (
                  <tr key={r[0]} className={i % 2 ? 'bg-neutral-50' : ''}>{r.map((c, k) => <td key={k} className={'px-3 py-2 ' + (k === 0 ? 'font-semibold' : 'tabular-nums')}>{c}</td>)}</tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div className="bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-[15px] font-bold uppercase" style={{ color: GREEN }}>Milho — comparação entre províncias</h2>
            <p className="mb-4 text-xs text-neutral-500">MT/kg. Barras verdes: milho; barras douradas: milho branco.</p>
            <div className="space-y-2">
              {milho.map((m) => (
                <div key={m.prov} className="flex items-center gap-3 text-xs">
                  <span className="w-40 shrink-0 whitespace-nowrap">{m.prov}{m.branco ? ' · branco' : ''}</span>
                  <div className="h-5 flex-1 bg-neutral-100"><div className="h-full" style={{ width: (m.v / max) * 100 + '%', background: m.branco ? '#D9A21B' : GREEN }} /></div>
                  <b className="w-12 text-right tabular-nums">{m.v.toFixed(2).replace('.', ',')}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-[15px] font-bold uppercase" style={{ color: GREEN }}>Tabelas de produtos por província</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {regions.map((r) => (
                <div key={r.name}>
                  <h3 className="mb-2 text-sm font-bold">{r.name}</h3>
                  <ul className="space-y-1 text-sm">{r.items.map((p) => <li key={p}><a href="https://icm.gov.mz/precos-indicativos-de-referencia/" className="hover:underline">{p} ↗</a></li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Sidebar only={['cambio', 'tempo', 'newsletter']} />
      </div>
    </SiteShell>
  );
}
