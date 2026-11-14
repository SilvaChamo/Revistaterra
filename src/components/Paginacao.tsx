import Link from 'next/link';

/** Só 3 números (a actual e as vizinhas) mais o total, que fica sempre visível: o tamanho nunca muda ao avançar. */
function slots(page: number, pages: number): (number | '…' | '')[] {
  if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
  const s = Math.min(Math.max(page - 1, 1), pages - 3);
  const w = [s, s + 1, s + 2];
  return [...w, w[2] >= pages - 1 ? '' : '…', pages];
}

// Largura fixa que cabe 4 dígitos.
const box = 'flex h-8 w-9 items-center justify-center border text-[12px] sm:w-10 sm:text-[13px]';
const idle = `${box} border-neutral-200 bg-white text-neutral-600`;
const link = `${idle} hover:border-[#047857] hover:text-[#047857]`;

/** Paginação centrada: com `href` são ligações (páginas do site), com `onPage` são botões (listas do painel). */
export default function Paginacao({ page, pages, href, onPage }: { page: number; pages: number; href?: (n: number) => string; onPage?: (n: number) => void }) {
  if (pages <= 1) return null;
  const item = (n: number, label: React.ReactNode, aria: string, current = false, off = false) => {
    if (off) return <span key={aria} className={`${idle} opacity-40`}>{label}</span>;
    const cls = current ? `${box} border-[#047857] bg-[#047857] font-bold text-white` : link;
    return href
      ? <Link key={aria} href={href(n)} aria-label={aria} aria-current={current ? 'page' : undefined} className={cls}>{label}</Link>
      : <button key={aria} type="button" aria-label={aria} aria-current={current ? 'page' : undefined} onClick={() => onPage?.(n)} className={cls}>{label}</button>;
  };
  return (
    <nav className="my-6 flex items-center justify-center gap-1" aria-label="Páginas" style={{ fontFamily: 'Verdana, sans-serif' }}>
      {item(page - 1, '←', 'Página anterior', false, page <= 1)}
      {slots(page, pages).map((x, i) => x === '…' ? <span key={`e${i}`} className={idle}>…</span> : x === '' ? <span key={`e${i}`} className={`${box} border-transparent`} /> : item(x, x, `Página ${x}`, x === page))}
      {item(page + 1, '→', 'Página seguinte', false, page >= pages)}
    </nav>
  );
}
