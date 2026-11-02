import SiteShell from '@/components/Terra/SiteShell';
import Sidebar from '@/components/Terra/Sidebar';
import { PageTitle } from '@/components/Terra/Bits';
import { GREEN } from '@/lib/terra';

export const metadata = { title: 'Quem Somos — Revista Terra', robots: { index: false, follow: false } };

const valores = ['Integridade', 'Verdade', 'Transparência', 'Independência editorial', 'Rigor', 'Responsabilidade', 'Deontologia profissional'];
const estatuto = [
  'A Revista Terra é um órgão de informação orientado por critérios de rigor e criatividade editorial, sem qualquer dependência de ordem ideológica, política e económica.',
  'Identifica-se com os valores da democracia pluralista e solidária.',
  'Inscreve-se num jornalismo de qualidade, abstendo-se do sensacionalismo e de falsidades.',
  'Rege-se, no exercício da sua actividade, pelo cumprimento rigoroso da ética, da deontologia profissional e da Lei de Imprensa.',
  'Segue rigorosos critérios de qualidade, rigor, isenção e profissionalismo na avaliação dos temas e da informação que disponibiliza aos seus leitores.',
];
const eco = [
  ['Revista Terra', 'Jornalismo especializado, análise e dossiers temáticos.'],
  ['Terra Digital', 'Informação, conteúdos multimédia e distribuição digital.'],
  ['Mais Agro', 'Rádio, programas e podcasts.'],
  ['Terra TV', 'Produção audiovisual, séries e documentários.'],
  ['Academia Terra', 'Formação e desenvolvimento profissional.'],
];

export default function QuemSomos() {
  return (
    <SiteShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-5">
          <PageTitle kicker="Registo: 122/GABINFO/DEPC/210/2022" title="Jornalismo que cultiva conhecimento e desenvolvimento" lead="A REVISTA TERRA é uma publicação moçambicana, de propriedade privada, vocacionada para o sector agrário e ambiental. Publica nas línguas portuguesa e inglesa, nos formatos online, digital e impresso, com periodicidade mensal, trazendo actualidade em géneros de notícias, análises, reportagens e entrevistas." />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white p-6 shadow-sm"><h2 className="mb-2 text-sm font-bold uppercase" style={{ color: GREEN }}>Visão</h2><p className="text-sm leading-relaxed text-neutral-600">Consolidar-se como uma plataforma moçambicana de referência em comunicação, informação e conhecimento sobre agricultura, ambiente e desenvolvimento sustentável.</p></div>
            <div className="bg-white p-6 shadow-sm"><h2 className="mb-2 text-sm font-bold uppercase" style={{ color: GREEN }}>Missão</h2><p className="text-sm leading-relaxed text-neutral-600">Informar, explicar, aproximar e capacitar, contribuindo para uma sociedade moçambicana mais consciente, informada e preparada para enfrentar os desafios da agricultura, do ambiente e do desenvolvimento sustentável.</p></div>
          </div>
          <div className="bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase" style={{ color: GREEN }}>Valores</h2>
            <div className="flex flex-wrap gap-2">{valores.map((v) => <span key={v} className="bg-neutral-100 px-3 py-1 text-xs font-semibold">{v}</span>)}</div>
            <p className="mt-3 text-xs text-neutral-500">Qualidade jornalística · Independência editorial · Rigor · Inovação · Impacto social · Formação de jovens profissionais</p>
          </div>
          <div className="bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase" style={{ color: GREEN }}>Estatuto Editorial</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-neutral-600">{estatuto.map((e) => <li key={e}>{e}</li>)}</ol>
          </div>
          <div>
            <h2 className="mb-3 border-b-2 pb-1 text-[15px] font-bold uppercase" style={{ color: GREEN, borderColor: GREEN }}>Ecossistema Terra 2030</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">{eco.map(([t, d]) => <div key={t} className="bg-white p-4 shadow-sm"><h3 className="font-bold">{t}</h3><p className="mt-1 text-xs text-neutral-600">{d}</p></div>)}</div>
          </div>
        </main>
        <Sidebar only={['newsletter', 'radio', 'capa']} />
      </div>
    </SiteShell>
  );
}
