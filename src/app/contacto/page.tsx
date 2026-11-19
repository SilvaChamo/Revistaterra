import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import ContactForm from '@/components/Terra/ContactForm';
import { GREEN } from '@/lib/terra';

export const metadata = { title: 'Contacto — Revista Terra', robots: { index: false, follow: false } };

const canais = [
  ['Redacção e correcções', 'Identifique o artigo, descreva a informação a rever e, quando possível, inclua fontes ou documentos de apoio.'],
  ['Publicidade e parcerias', 'Indique a organização, o objectivo, o período pretendido e os meios de contacto para receber uma resposta comercial.'],
];

export default function Contacto() {
  return (
    <SiteShell trail={[{ label: 'Início', href: '/' }, { label: 'Contacto' }]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Contacto" title="Vamos conversar sobre o futuro do agro" lead="A Revista Terra está disponível para leitores, fontes, parceiros e organizações do sector agrário e ambiental. Use este canal para sugestões editoriais, pedidos de correcção, publicidade, parcerias, eventos, formação ou informações sobre a revista." />
          <div className="grid gap-4 md:grid-cols-2">{canais.map(([t, d]) => <div key={t} className="bg-white p-6 shadow-sm"><h2 className="font-bold" style={{ color: GREEN }}>{t}</h2><p className="mt-2 text-sm leading-relaxed text-neutral-600">{d}</p></div>)}</div>
          <ContactForm />
          <div className="bg-white p-6 text-sm shadow-sm"><h2 className="mb-2 font-bold" style={{ color: GREEN }}>Contactos</h2><p>Rua da Resistência, Nº 1642, 3º Andar</p><p>+258 82 123 3910</p><p>comercial@revistaterra.co.mz</p></div>
        </main>
        <Sidebar only={['radio', 'newsletter', 'tempo']} />
      </div>
    </SiteShell>
  );
}
