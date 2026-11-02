import Link from 'next/link';
import { Widget } from './Bits';
import Weather from './Weather';
import RadioPlayer from './RadioPlayer';
import Cambio from './Cambio';
import StickyAside from './StickyAside';
import { GREEN, allCards, terra } from '@/lib/terra';

export default function Sidebar({ only }: { only?: string[] }) {
  const show = (k: string) => !only || only.includes(k);
  const trending = allCards.slice(0, 5);
  const recent = allCards.slice(5, 10);
  return (
    <StickyAside>
      {show('tempo') && <Widget title="Tempo · Moçambique" flush fill><Weather /></Widget>}
      {show('radio') && (
        <Widget title="Rádio +Agro">
          <RadioPlayer compact />
          <ul className="mt-4 border-t border-neutral-100 pt-2 text-[13px]">
            {terra.radioFull.map((r) => (
              <li key={r.time + r.show} className="flex gap-3 border-b border-neutral-100 py-2 last:border-0">
                <b className="w-[100px] shrink-0 whitespace-nowrap text-xs" style={{ color: GREEN }}>{r.time}–{r.end}</b><span className="whitespace-nowrap">{r.show}</span>
              </li>
            ))}
          </ul>
          <Link href="/radio" className="mt-3 block text-[11px] font-bold uppercase" style={{ color: GREEN }}>Ver programação ›</Link>
        </Widget>
      )}
      {show('cambio') && <Widget title="Câmbio"><Cambio /></Widget>}
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
