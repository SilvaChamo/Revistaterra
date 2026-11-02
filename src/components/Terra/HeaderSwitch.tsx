'use client';

import { useEffect, useState } from 'react';
import HeaderAtual from './HeaderAtual';
import HeaderModelo from './HeaderModelo';

/**
 * Por defeito: cabeçalho com o logotipo (imagem) à esquerda.
 * Alternativas pelo endereço: ?logo=letras (nome em letras à esquerda) e ?cabecalho=modelo (nome em letras ao centro).
 */
export default function HeaderSwitch() {
  const [v, setV] = useState<'modelo' | 'atual'>('atual');
  const [logo, setLogo] = useState<'imagem' | 'letras'>('imagem');
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('cabecalho') === 'modelo') setV('modelo');
    if (q.get('logo') === 'letras') setLogo('letras');
  }, []);
  return v === 'modelo' ? <HeaderModelo /> : <HeaderAtual logo={logo} />;
}
