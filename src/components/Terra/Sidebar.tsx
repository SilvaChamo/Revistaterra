import Link from 'next/link';
import { Widget } from './Bits';
import Weather from './Weather';
import RadioPlayer from './RadioPlayer';
import RadioGrelha from './RadioGrelha';
import Cambio from './Cambio';
import StickyAside from './StickyAside';
import { GREEN, terra } from '@/lib/terra';
import { loadCards } from '@/lib/terra-news';
import { loadRadioSlots } from '@/lib/radio-schedule';

export default async function Sidebar({ only }: { only?: string[] }) {
  const allCards = await loadCards();
  const show = (k: string) => !only || only.includes(k);
  const { slots: radioSlots } = show('radio') ? await loadRadioSlots() : { slots: [] };
  const trending = allCards.slice(0, 5);
  const recent = allCards.slice(5, 10);
  return (
    <StickyAside>
      {show('tempo') && <Widget title="Tempo · Moçambique" flush fill green><Weather /></Widget>}
      {show('radio') && (
        <Widget title="Rádio +Agro" flush>
          <div className="bg-[#eaf3ed] p-4"><RadioPlayer compact slots={radioSlots} /></div>
          <div className="border-t border-neutral-300"><RadioGrelha slots={radioSlots} /></div>
          <Link href="/radio" className="block border-t border-neutral-300 px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:text-[#9BCB3C]" style={{ background: '#084030' }}>Ver programação ›</Link>
        </Widget>
      )}
      {show('cambio') && <Widget title="Câmbio" flush><Cambio /></Widget>}
      {show('capa') && terra.cover && (
        <Widget title={`Edição actual · nº ${terra.cover.issue}`}>
          <Link href="/revista-digital" className="block">
            {terra.cover.image && <img src={terra.cover.image} alt={terra.cover.title} className="w-full" />}
            <span className="mt-3 block text-center text-xs font-bold uppercase" style={{ color: GREEN }}>Ler edição ›</span>
          </Link>
        </Widget>
      )}
      {show('lidas') && (
        <Widget title="Mais lidas">
          <ol>{trending.map((c, n) => (
            <li key={c.title} className="flex gap-3 border-b border-neutral-100 py-3 text-[13px] last:border-0"><b className="text-lg">{n + 1}.</b><a href={c.url} className="hover:underline">{c.title}</a></li>
          ))}</ol>
        </Widget>
      )}
      {show('recentes') && (
        <Widget title="Recentes">
          <ul>{recent.map((c) => (
            <li key={c.title} className="flex gap-3 border-b border-neutral-100 py-3 last:border-0">
              {c.image && <img src={c.image} alt="" loading="lazy" className="h-12 w-12 shrink-0 object-cover" />}
              <a href={c.url} className="text-[13px] font-semibold leading-snug hover:underline">{c.title}</a>
            </li>
          ))}</ul>
        </Widget>
      )}
    </StickyAside>
  );
}
