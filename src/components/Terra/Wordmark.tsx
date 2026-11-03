import Link from 'next/link';
import { DARK } from '@/lib/terra';

/** Nome em letras: "Revista" extra-negrito + "Terra" extra-light, mesmo tamanho, sem espaço, com o slogan encostado por baixo. */
export default function Wordmark({ align = 'left' }: { align?: 'left' | 'center' }) {
  return (
    <Link href="/" className={`block leading-none ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`} aria-label="Revista Terra — A Voz do Agro e Ambiente">
      <span className="block whitespace-nowrap text-[26px] tracking-tight sm:text-[34px]" style={{ color: DARK }}>
        <span className="font-extrabold">Revista</span><span className="font-extralight">Terra</span>
      </span>
      <span className="mt-[3px] block whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-500 sm:text-[10px]">A Voz do Agro e Ambiente</span>
    </Link>
  );
}
