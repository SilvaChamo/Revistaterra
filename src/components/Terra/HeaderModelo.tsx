import Link from 'next/link';
import Nav from './Nav';
import HeaderTools from './HeaderTools';
import { Inter } from 'next/font/google';
import { DARK } from '@/lib/terra';

const nameFont = Inter({ subsets: ['latin'], weight: ['200', '800'], display: 'swap' });

/** Cabeçalho no modelo da referência: nome em letras ao centro (slogan por baixo), redes e pesquisa à direita, linha e menu. */
export default function HeaderModelo() {
  return (
    <header>
      <div className="bg-white">
        <div className="relative mx-auto grid max-w-[1300px] items-center gap-3 px-3 py-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="hidden sm:block" />
          <Link href="/" className={`${nameFont.className} mx-auto block text-center leading-none`} aria-label="Revista Terra — A Voz do Agro e Ambiente">
            <span className="block whitespace-nowrap text-[26px] tracking-tight sm:text-[34px]" style={{ color: DARK }}>
              <span className="font-extrabold">Revista</span><span className="font-extralight">Terra</span>
            </span>
            <span className="mt-[3px] block whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-500 sm:text-[10px]">A Voz do Agro e Ambiente</span>
          </Link>
          <HeaderTools />
        </div>
      </div>
      <Nav />
    </header>
  );
}
