'use client';

import { usePathname } from 'next/navigation';
import PageProtection from '@/components/Newsletter/PageProtection';

/** Site público só para leitura: sem copiar, selecionar, imprimir nem capturas (como a página dos espaços de publicidade). O painel de administração fica de fora. */
export default function ProtecaoSite() {
  const path = usePathname() || '';
  if (path.startsWith('/admin') || path.startsWith('/espacos-de-publicidade')) return null;
  return <PageProtection onBlur={false} />;
}
