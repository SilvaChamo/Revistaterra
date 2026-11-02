'use client';

import { useEffect, useState } from 'react';
import HeaderAtual from './HeaderAtual';
import HeaderBarra from './HeaderBarra';
import HeaderModelo from './HeaderModelo';

/**
 * Por defeito: cabeçalho em barra verde única.
 * Os anteriores continuam acessíveis pelo endereço: ?cabecalho=atual (duas camadas) ou ?cabecalho=modelo (centrado, nome em letras).
 */
export default function HeaderSwitch() {
  const [v, setV] = useState<'barra' | 'atual' | 'modelo'>('barra');
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('cabecalho');
    if (p === 'atual' || p === 'modelo') setV(p);
  }, []);
  return v === 'atual' ? <HeaderAtual /> : v === 'modelo' ? <HeaderModelo /> : <HeaderBarra />;
}
