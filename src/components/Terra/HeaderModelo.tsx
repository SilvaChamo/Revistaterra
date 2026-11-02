import Link from 'next/link';
import Nav from './Nav';
import HeaderTools from './HeaderTools';
import TopBar from './TopBar';

/** Cabeçalho no modelo da referência: barra de cima, logo ao centro com redes e pesquisa à direita, linha e menu. */
export default function HeaderModelo() {
  return (
    <header>
      <TopBar />
      <div className="bg-white">
        <div className="relative mx-auto grid max-w-[1300px] items-center gap-3 px-3 py-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="hidden sm:block" />
          <Link href="/" className="mx-auto block" aria-label="Revista Terra — A Voz do Agro e Ambiente">
            <img src="/terra/logo-revista-terra.webp" alt="Revista Terra — A Voz do Agro e Ambiente" width={381} height={190} className="h-[72px] w-auto" />
          </Link>
          <HeaderTools />
        </div>
      </div>
      <Nav />
    </header>
  );
}
