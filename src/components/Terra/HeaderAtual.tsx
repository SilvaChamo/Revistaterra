import Link from 'next/link';
import Wordmark from './Wordmark';
import NavAtual from './NavAtual';
import HeaderButtons from './HeaderButtons';

/** Cabeçalho actual: logotipo (imagem) ou nome em letras à esquerda, botões (Facebook, entrar, definições) à direita, menu com redes sociais, pesquisa e entrar. */
export default function HeaderAtual({ logo = 'imagem' }: { logo?: 'imagem' | 'letras' }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-3 px-3 py-3">
        {logo === 'letras' ? (
          <Wordmark align="left" />
        ) : (
          <Link href="/" className="block shrink-0" aria-label="Revista Terra — A Voz do Agro e Ambiente">
            <img src="/terra/logo-revista-terra.webp" alt="Revista Terra — A Voz do Agro e Ambiente" width={446} height={220} className="h-[62px] w-auto" />
          </Link>
        )}
        <HeaderButtons />
      </div>
      <NavAtual />
    </header>
  );
}
