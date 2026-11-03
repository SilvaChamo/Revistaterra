import { terra } from '@/lib/terra';

const MOEDAS: Record<string, { nome: string; bandeira: string }> = {
  USD: { nome: 'Dólar Americano', bandeira: '🇺🇸' },
  EUR: { nome: 'Euro', bandeira: '🇪🇺' },
  AED: { nome: 'Dirham dos Emirados', bandeira: '🇦🇪' },
  AUD: { nome: 'Dólar Australiano', bandeira: '🇦🇺' },
  JPY: { nome: 'Iene Japonês', bandeira: '🇯🇵' },
};
const ORDEM = ['USD', 'EUR', 'AED', 'AUD', 'JPY'];

export default function Cambio() {
  const linhas = terra.market
    .map((m) => {
      const code = m.pair.split('/')[0];
      const [valor] = m.price.split(' ');
      return { code, valor: Number(valor).toFixed(2).replace('.', ','), variacao: m.change.replace('.', ','), sobe: !m.change.startsWith('-'), ...MOEDAS[code] };
    })
    .sort((a, b) => ORDEM.indexOf(a.code) - ORDEM.indexOf(b.code));

  return (
    <div>
      <p className="mb-2 text-[11px] text-neutral-500">Quanto vale 1 unidade em meticais</p>
      <ul>
        {linhas.map((l) => (
          <li key={l.code} className="flex items-center gap-3 border-b border-neutral-100 py-2.5 last:border-0">
            <span className="text-2xl leading-none" aria-hidden>{l.bandeira}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold leading-tight sm:whitespace-nowrap">{l.nome}</div>
              <div className="text-[11px] text-neutral-400">1 {l.code}</div>
            </div>
            <div className="text-right">
              <div className="whitespace-nowrap text-[15px] font-extrabold tabular-nums">{l.valor} <span className="text-[10px] font-semibold text-neutral-500">MT</span></div>
              <span className={`inline-block rounded px-1.5 py-[1px] text-[10px] font-bold ${l.sobe ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>{l.sobe ? '▲' : '▼'} {l.variacao.replace(/^[+-]/, '')}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] leading-snug text-neutral-400">Dados informativos; confirme a cotação junto da fonte antes de tomar decisões financeiras.</p>
    </div>
  );
}
