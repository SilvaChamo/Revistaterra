import Link from 'next/link';
import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { GREEN } from '@/lib/terra';
import { loadPlanos } from '@/lib/assinaturas';
import { precoEmTexto } from '@/lib/assinaturas-types';

export const metadata = { title: 'Planos — Revista Terra', robots: { index: false, follow: false } };
export const revalidate = 30;

type Cartao = { id: string; nome: string; para?: string; preco: string; destaque?: boolean; itens: string[]; acao: string; href?: string };

const botao = 'mt-5 block px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide transition-colors';

export default async function Planos() {
  const { plans } = await loadPlanos();
  const cartoes: Cartao[] = [
    { id: 'leitor', nome: 'Leitor', para: 'Para acompanhar o dia a dia', preco: 'Grátis', itens: ['Notícias do dia', 'Podcasts e rádio em directo', 'Cotações e câmbio', 'Newsletter semanal'], acao: 'Criar conta grátis', href: '/register' },
    ...plans.filter((p) => p.active).map((p) => ({
      id: p.id,
      nome: p.name,
      para: p.description,
      preco: precoEmTexto(p),
      destaque: true,
      itens: p.features,
      acao: p.price == null ? 'Brevemente' : 'Assinar',
      href: p.price == null ? undefined : `/assinante?plano=${encodeURIComponent(p.id)}`,
    })),
    { id: 'empresarial', nome: 'Empresarial', para: 'Para equipas e empresas', preco: 'Sob consulta', itens: ['Vários leitores na mesma conta', 'Relatórios de mercado', 'Alertas à medida do negócio'], acao: 'Falar connosco', href: '/contacto' },
  ];
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Planos' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Notícias exclusivas" title="Escolha como quer ler a Revista Terra" lead="Uma parte do conteúdo continua aberta a todos. Quem assina recebe as notícias exclusivas, as análises e a revista digital completa." />
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            {cartoes.map((p) => (
              <article key={p.id} className="flex flex-col bg-white p-5 shadow-sm" style={{ borderTop: `3px solid ${p.destaque ? GREEN : 'transparent'}` }}>
                <h2 className="text-base font-bold uppercase" style={{ color: GREEN }}>{p.nome}</h2>
                {p.para && <p className="mt-1 text-xs text-neutral-500">{p.para}</p>}
                <p className="mt-4 text-lg font-extrabold text-neutral-900">{p.preco}</p>
                <ul className="mt-4 flex-1 space-y-2 text-[13px] leading-snug">
                  {p.itens.map((i) => (
                    <li key={i} className="flex gap-2"><span aria-hidden style={{ color: GREEN }}>✓</span><span>{i}</span></li>
                  ))}
                </ul>
                {p.href ? (
                  <Link href={p.href} className={`${botao} text-white hover:text-[#9BCB3C]`} style={{ background: '#084030' }}>{p.acao}</Link>
                ) : (
                  <span className={`${botao} cursor-not-allowed bg-neutral-200 text-neutral-500`}>{p.acao}</span>
                )}
              </article>
            ))}
          </div>
          <div className="bg-white px-6 py-5 text-[13px] leading-relaxed text-neutral-600 shadow-sm">
            <b className="text-neutral-800">Como funciona</b>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Crie a sua conta (ou entre) e escolha o plano na <Link href="/assinante" className="font-semibold hover:underline" style={{ color: GREEN }}>área de assinantes</Link>.</li>
              <li>Faça o pagamento como indicado e escreva a referência.</li>
              <li>Confirmamos o pagamento e a subscrição fica activa. Quem já é assinante renova na mesma área, sem perder dias.</li>
            </ol>
          </div>
        </main>
        <Sidebar only={['tempo', 'newsletter', 'capa']} />
      </div>
    </SiteShell>
  );
}
