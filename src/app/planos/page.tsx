import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { GREEN } from '@/lib/terra';

export const metadata = { title: 'Planos — Revista Terra', robots: { index: false, follow: false } };

const planos = [
  {
    nome: 'Leitor',
    para: 'Para acompanhar o dia a dia',
    preco: 'Grátis',
    destaque: false,
    itens: ['Notícias do dia', 'Podcasts e rádio em directo', 'Cotações e câmbio', 'Newsletter semanal'],
    acao: 'Criar conta grátis',
    href: '/register',
  },
  {
    nome: 'Assinante',
    para: 'Para quem vive do sector',
    preco: 'Preço a anunciar',
    destaque: true,
    itens: ['Tudo o que é grátis', 'Notícias e análises exclusivas', 'Revista digital completa e arquivo', 'Resumo da manhã no e-mail ou WhatsApp', 'Guardar artigos para ler depois'],
    acao: 'Quero ser avisado',
    href: '/contacto',
  },
  {
    nome: 'Empresarial',
    para: 'Para equipas e empresas',
    preco: 'Sob consulta',
    destaque: false,
    itens: ['Tudo o que o Assinante tem', 'Vários leitores na mesma conta', 'Relatórios de mercado', 'Alertas à medida do negócio'],
    acao: 'Falar connosco',
    href: '/contacto',
  },
];

export default function Planos() {
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Planos' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Notícias exclusivas" title="Escolha como quer ler a Revista Terra" lead="Uma parte do conteúdo continua aberta a todos. Quem assina recebe as notícias exclusivas, as análises e a revista digital completa." />
          <div className="grid gap-4 md:grid-cols-3">
            {planos.map((p) => (
              <article key={p.nome} className="flex flex-col bg-white p-5 shadow-sm" style={p.destaque ? { borderTop: `3px solid ${GREEN}` } : { borderTop: '3px solid transparent' }}>
                <h2 className="text-base font-bold uppercase" style={{ color: GREEN }}>{p.nome}</h2>
                <p className="mt-1 text-xs text-neutral-500">{p.para}</p>
                <p className="mt-4 text-lg font-extrabold text-neutral-900">{p.preco}</p>
                <ul className="mt-4 flex-1 space-y-2 text-[13px] leading-snug">
                  {p.itens.map((i) => (
                    <li key={i} className="flex gap-2"><span aria-hidden style={{ color: GREEN }}>✓</span><span>{i}</span></li>
                  ))}
                </ul>
                <a href={p.href} className="mt-5 block px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:text-[#9BCB3C]" style={{ background: '#084030' }}>{p.acao}</a>
              </article>
            ))}
          </div>
          <p className="bg-white px-6 py-4 text-[13px] leading-relaxed text-neutral-600 shadow-sm">
            Em breve: pagamento por M-Pesa, e-Mola ou cartão, mensal ou anual, e 7 dias para experimentar sem compromisso.
          </p>
        </main>
        <Sidebar only={['tempo', 'newsletter', 'capa']} />
      </div>
    </SiteShell>
  );
}
