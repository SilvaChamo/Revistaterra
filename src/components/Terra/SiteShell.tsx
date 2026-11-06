import Link from 'next/link';
import { Home } from 'lucide-react';
import HeaderSwitch from './HeaderSwitch';
import WeatherProvider from './WeatherProvider';
import { loadWeather } from '@/lib/weather';
import { DARK, GREEN, terra } from '@/lib/terra';

const ticker = terra.icm.slice(1).map((r) => ({ prov: r[0], milho: r[1] })).filter((r) => r.milho && r.milho !== '—');

export type Crumb = { label: string; href?: string };

/** `trail`: caminho da página (páginas interiores). Sem `trail` (página inicial) a barra mostra as cotações do dia. */
export default async function SiteShell({ children, trail }: { children: React.ReactNode; trail?: Crumb[] }) {
  const weather = await loadWeather();
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
    <WeatherProvider initial={weather}>
    <div className="min-h-screen bg-[#ececec] text-[#222]" style={{ fontFamily: 'Verdana, sans-serif' }}>
      <HeaderSwitch />

      <div className={`mx-auto max-w-[1300px] px-3 ${trail ? '' : 'mt-5'}`}>
        {/* barra de cotações: só na largura do conteúdo */}
        <div className="mb-5 flex items-stretch bg-white text-[11px] text-neutral-600 shadow-sm">
          <div className="z-10 flex shrink-0 items-stretch text-white" style={{ background: DARK }}>
            {trail ? (
              // páginas interiores: ícone da casa (volta ao início)
              <Link href="/" aria-label="Início" title="Início" className="flex w-10 items-center justify-center text-white transition-colors hover:!bg-[#8DF43A] hover:!text-[#064E3B]" style={{ background: GREEN }}><Home size={18} aria-hidden /></Link>
            ) : (
              // página inicial: símbolo R do ícone do site
              <span className="flex w-10 items-center justify-center" style={{ background: GREEN }}>
                <svg viewBox="11 2 46 48" className="h-7 w-7" aria-hidden><path fillRule="evenodd" d="M18 16H35C43 16 49 20.5 49 28C49 33.5 45.8 37.2 41 38.8L50 48H40L32 40H26V48H18ZM26 23V33H34.5C38 33 40.5 31.4 40.5 28C40.5 24.7 38 23 34.5 23Z" fill="#fff" /><path d="M44 15C44 8 48 4 55 4C55 11 51 15 44 15Z" fill="#bef264" /></svg>
              </span>
            )}
            {!trail && <b className="flex items-center px-4 uppercase tracking-wide">Cotações do dia</b>}
          </div>
          {trail ? (
            <nav aria-label="Caminho" className="flex min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap px-4 py-2.5 text-xs text-neutral-600">
              {trail.map((c, k) => (
                <span key={c.label + k} className={`flex min-w-0 items-center ${k === trail.length - 1 ? 'font-bold text-neutral-800' : 'shrink-0'}`}>
                  {k > 0 && <span className="mx-2 text-neutral-400">›</span>}
                  {c.href && k < trail.length - 1 ? <Link href={c.href} className="hover:underline">{c.label}</Link> : <span className="truncate">{c.label}</span>}
                </span>
              ))}
            </nav>
          ) : (
            <div className="terra-marquee-wrap flex min-w-0 flex-1 items-center overflow-hidden py-2.5">
              <div className="terra-marquee"><Row /><Row dup /></div>
            </div>
          )}
        </div>
        {children}
      </div>

      <footer className="mt-8 text-sm text-white" style={{ background: DARK }}>
        <div className="mx-auto grid max-w-[1300px] gap-8 px-6 py-8 md:grid-cols-4">
          <div>
            <span className="inline-block bg-white px-3 py-2"><img src="/terra/logo-revista-terra.webp" alt="Revista Terra" width={446} height={220} className="h-14 w-auto" /></span>
            <p className="mt-2 text-xs text-white/70">Jornalismo ao serviço do agro e do ambiente</p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Institucional</h4>
            <ul className="space-y-2 text-xs"><li><Link href="/quem-somos">Quem Somos</Link></li><li><Link href="/contacto">Publicidade & Mídia Kit</Link></li><li><Link href="/contacto">Nossos Colunistas</Link></li><li>Política de Privacidade</li></ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Links rápidos</h4>
            <ul className="space-y-2 text-xs"><li><Link href="/planos">Planos de subscrição</Link></li><li><Link href="/newsletter">Assinar Newsletter</Link></li><li><Link href="/login">Área de assinantes</Link></li><li><Link href="/contacto">Contactos</Link></li></ul>
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
    </WeatherProvider>
  );
}
