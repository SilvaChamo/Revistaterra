import Link from 'next/link';
import NavAtual from './NavAtual';
import NewsletterBarAtual from './NewsletterBarAtual';

/** Cabeçalho actual: logo à esquerda, newsletter à direita, menu com redes sociais e pesquisa. */
export default function HeaderAtual() {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-3 px-3 py-3">
        <Link href="/" className="block shrink-0" aria-label="Revista Terra — A Voz do Agro e Ambiente">
          <img src="/terra/logo-revista-terra.webp" alt="Revista Terra — A Voz do Agro e Ambiente" width={381} height={190} className="h-[62px] w-auto" />
        </Link>
        <NewsletterBarAtual />
      </div>
      <NavAtual />
    </header>
  );
}
