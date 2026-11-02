import Link from 'next/link';
import Nav from './Nav';
import SearchBox from './SearchBox';
import { DARK, GREEN, terra } from '@/lib/terra';

const ticker = terra.icm.slice(1).map((r) => ({ prov: r[0], milho: r[1] })).filter((r) => r.milho && r.milho !== '—');

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const items = [
    ...ticker.map((r) => ({ k: 'm' + r.prov, label: `Milho · ${r.prov}`, value: `${r.milho} MT/kg`, change: '' })),
    ...terra.market.map((m) => ({ k: 'c' + m.pair, label: m.pair, value: m.price, change: m.change })),
  ];
  const Row = ({ dup = false }: { dup?: boolean }) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={dup}>
      {items.map((r) => (
        <span key={r.k} className="whitespace-nowrap"><b>{r.label}</b> {r.value}{r.change && <b className="ml-1" style={{ color: r.change.startsWith('-') ? '#E22F57' : '#039A67' }}>{r.change}</b>}</span>
      ))}
    </div>
  );
  return (
    <div className="min-h-screen bg-[#ececec] text-[#222]" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-5 py-4">
          <Link href="/" className="text-3xl font-extrabold tracking-tight" style={{ color: DARK }}>TERRA<span style={{ color: GREEN }}>online</span></Link>
          <span className="hidden text-xs text-neutral-500 sm:block">A Voz do Agro e Ambiente</span>
          <SearchBox />
        </div>
        <Nav />
        <div className="border-t border-neutral-200">
          <div className="mx-auto flex max-w-[1300px] items-center text-[11px] text-neutral-600">
            <b className="z-10 shrink-0 bg-white px-5 py-2 uppercase" style={{ color: GREEN }}>Cotações do dia</b>
            <div className="terra-marquee-wrap min-w-0 flex-1 overflow-hidden py-2">
              <div className="terra-marquee"><Row /><Row dup /></div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-5 max-w-[1300px] px-3">{children}</div>

      <footer className="mt-8 text-sm text-white" style={{ background: DARK }}>
        <div className="mx-auto grid max-w-[1300px] gap-8 px-6 py-8 md:grid-cols-4">
          <div>
            <div className="text-xl font-extrabold">TERRA<span style={{ color: '#34d399' }}>online</span></div>
            <p className="mt-2 text-xs text-white/70">Jornalismo ao serviço do agro e do ambiente</p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Institucional</h4>
            <ul className="space-y-2 text-xs"><li><Link href="/quem-somos">Quem Somos</Link></li><li><Link href="/contacto">Publicidade & Mídia Kit</Link></li><li><Link href="/contacto">Nossos Colunistas</Link></li><li>Política de Privacidade</li></ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Contactos</h4>
            <ul className="space-y-2 text-xs"><li>Rua da Resistência, Nº 1642, 3º Andar</li><li>+258 82 123 3910</li><li>comercial@revistaterra.co.mz</li></ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">App Revista Terra</h4>
            <p className="text-xs text-white/70">A aplicação da Revista Terra estará disponível em breve.</p>
            <span className="mt-2 inline-block bg-white/10 px-3 py-1 text-[10px] font-bold uppercase">Brevemente</span>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-4 text-center text-[11px] text-white/60">© 2026 Revista Terra. Todos os direitos reservados. · Proposta de redesign</div>
      </footer>
    </div>
  );
}
