'use client';

import { useEffect, useState } from 'react';
import HeaderAtual from './HeaderAtual';
import HeaderModelo from './HeaderModelo';

/**
 * Os dois cabeçalhos ficam guardados. Por defeito aparece o actual (logotipo à esquerda);
 * juntar ?cabecalho=modelo ao endereço mostra o centrado, ?cabecalho=atual volta ao actual.
 */
export default function HeaderSwitch() {
  const [v, setV] = useState<'modelo' | 'atual'>('atual');
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('cabecalho');
    if (p === 'atual' || p === 'modelo') setV(p);
  }, []);
  return v === 'modelo' ? <HeaderModelo /> : <HeaderAtual />;
}
