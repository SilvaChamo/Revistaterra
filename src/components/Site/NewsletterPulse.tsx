'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Último pedido de verificação dos envios agendados da newsletter (no máximo um por minuto neste separador). */
let lastPulse = 0;

/**
 * Disparo de reserva da newsletter agendada: ao abrir uma página (do site ou do painel) pede-se ao servidor que envie os
 * horários cuja hora já chegou. Não mostra nada nem bloqueia nada; o agendador do GitHub continua a ser o principal.
 */
export default function NewsletterPulse() {
  const pathname = usePathname();
  useEffect(() => {
    if (Date.now() - lastPulse < 60_000) return;
    lastPulse = Date.now();
    fetch('/api/newsletter/pulso', { method: 'POST', keepalive: true }).catch(() => {});
  }, [pathname]);
  return null;
}
