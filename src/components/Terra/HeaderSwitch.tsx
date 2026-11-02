'use client';

import { useEffect, useState } from 'react';
import HeaderAtual from './HeaderAtual';
import HeaderBarra from './HeaderBarra';
import HeaderModelo from './HeaderModelo';
import HeaderUmaLinha from './HeaderUmaLinha';

/**
 * Por defeito: "uma só linha" (passa a barra verde compacta de 60px ao fazer scroll).
 * Os outros continuam acessíveis pelo endereço: ?cabecalho=barra (barra verde única fixa), atual (duas camadas) ou modelo (centrado).
 */
export default function HeaderSwitch() {
  const [v, setV] = useState<'uma' | 'barra' | 'atual' | 'modelo'>('uma');
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('cabecalho');
    if (p === 'barra' || p === 'atual' || p === 'modelo') setV(p);
  }, []);
  return v === 'barra' ? <HeaderBarra /> : v === 'atual' ? <HeaderAtual /> : v === 'modelo' ? <HeaderModelo /> : <HeaderUmaLinha />;
}
