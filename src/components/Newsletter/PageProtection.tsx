'use client';

import { useEffect, useState } from 'react';

const CSS = `
html.ec-protect, html.ec-protect body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
html.ec-protect img { -webkit-user-drag: none; pointer-events: none; }
html.ec-protect input, html.ec-protect textarea, html.ec-protect [contenteditable="true"] { -webkit-user-select: text; user-select: text; }
html.ec-shield body { visibility: hidden !important; }
html.ec-shield #ec-shield-msg { visibility: visible !important; }
@media print { html.ec-protect body { display: none !important; } }
`;

/** Dificulta a cópia nesta página: sem selecionar, copiar, menu do rato, arrastar, guardar, imprimir nem ver o código; esconde o conteúdo quando a janela perde o foco ou ao usar atalhos de captura. */
export default function PageProtection({ message = 'Conteúdo protegido. Volte a esta janela para continuar a ler.', onBlur: coverOnBlur = true }: { message?: string; onBlur?: boolean }) {
  const [shield, setShield] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('ec-protect');
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Captura do macOS (Cmd+Shift): a ferramenta de selecção não avisa a página, por isso o ecrã fica tapado até o rato voltar a mexer.
    let holdUntil = 0;
    let holding = false;
    const hide = (ms?: number) => {
      setShield(true);
      if (timer) clearTimeout(timer);
      if (ms) timer = setTimeout(() => setShield(!document.hasFocus() || document.hidden), ms);
    };
    const show = () => { if (!holding && document.hasFocus() && !document.hidden) setShield(false); };
    const onMove = () => { if (holding && Date.now() > holdUntil) { holding = false; show(); } };
    // Campos de escrever (formulários) continuam a poder ser usados.
    const editable = (e: Event) => e.target instanceof Element && !!e.target.closest('input, textarea, select, [contenteditable="true"]');
    const block = (e: Event) => { if (!editable(e)) e.preventDefault(); };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (k === 'printscreen') { hide(2500); navigator.clipboard?.writeText('').catch(() => {}); e.preventDefault(); return; }
      if (e.metaKey && e.shiftKey) { holding = true; holdUntil = Date.now() + 1500; hide(); } // capturas do macOS (Cmd+Shift+3/4/5)
      if (e.key === 'F12' || (mod && !editable(e) && ['c', 'x', 'a'].includes(k)) || (mod && ['p', 's', 'u'].includes(k)) || (mod && e.shiftKey && ['i', 'j', 'c', 's'].includes(k))) { e.preventDefault(); e.stopPropagation(); }
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'PrintScreen') { hide(2500); navigator.clipboard?.writeText('').catch(() => {}); } };
    const events: [string, EventListener][] = [['contextmenu', block], ['copy', block], ['cut', block], ['dragstart', block], ['selectstart', block], ['beforeprint', () => hide(2000)]];
    events.forEach(([n, f]) => document.addEventListener(n, f));
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('keyup', onKeyUp, true);
    // `onBlur` falso (site público): perder o foco ou mudar de separador não tapa o ecrã, para não piscar a verde ao entrar.
    const onBlur = () => { if (coverOnBlur) hide(); };
    const onVis = () => { if (coverOnBlur) (document.hidden ? hide() : show()); };
    ['mousemove', 'pointerdown', 'touchstart'].forEach((n) => document.addEventListener(n, onMove, true));
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', show);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      root.classList.remove('ec-protect', 'ec-shield');
      events.forEach(([n, f]) => document.removeEventListener(n, f));
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('keyup', onKeyUp, true);
      ['mousemove', 'pointerdown', 'touchstart'].forEach((n) => document.removeEventListener(n, onMove, true));
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', show);
      document.removeEventListener('visibilitychange', onVis);
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('ec-shield', shield); }, [shield]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {shield && <div id="ec-shield-msg" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#064E3B] px-6 text-center text-[14px] text-white">{message}</div>}
    </>
  );
}
