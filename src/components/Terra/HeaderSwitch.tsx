'use client';

import { useEffect, useState } from 'react';
import HeaderAtual from './HeaderAtual';
import HeaderModelo from './HeaderModelo';

/**
 * Os dois cabeçalhos ficam guardados. Por defeito aparece o novo (modelo);
 * juntar ?cabecalho=atual ao endereço mostra o anterior, ?cabecalho=modelo volta ao novo.
 */
export default function HeaderSwitch() {
  const [v, setV] = useState<'modelo' | 'atual'>('modelo');
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('cabecalho');
    if (p === 'atual' || p === 'modelo') setV(p);
  }, []);
  return v === 'atual' ? <HeaderAtual /> : <HeaderModelo />;
}
