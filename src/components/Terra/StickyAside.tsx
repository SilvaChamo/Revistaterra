'use client';

import { useEffect, useRef } from 'react';

/**
 * Coluna lateral que acompanha o scroll sem esconder conteúdo:
 * se for mais alta que o ecrã, corre com a página até o seu fundo chegar ao fundo do ecrã
 * e só então fica presa. Se couber, fica presa no topo.
 */
export default function StickyAside({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gap = 12;
    const update = () => {
      el.style.top = Math.min(gap, window.innerHeight - el.offsetHeight - gap) + 'px';
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  return <aside ref={ref} className="lg:sticky lg:self-start" style={{ top: 12 }}>{children}</aside>;
}
