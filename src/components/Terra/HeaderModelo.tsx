import Wordmark from './Wordmark';
import Nav from './Nav';
import HeaderTools from './HeaderTools';


/** Cabeçalho no modelo da referência: nome em letras ao centro (slogan por baixo), redes e pesquisa à direita, linha e menu. */
export default function HeaderModelo() {
  return (
    <header>
      <div className="bg-white">
        <div className="relative mx-auto grid max-w-[1300px] items-center gap-3 px-3 py-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="hidden sm:block" />
          <Wordmark align="center" />
          <HeaderTools />
        </div>
      </div>
      <Nav />
    </header>
  );
}
