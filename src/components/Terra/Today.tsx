'use client';

import { useEffect, useState } from 'react';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Domingo, 1 Novembro 2026" — calculado no browser para nunca ficar desactualizado. */
export default function Today() {
  const [text, setText] = useState('');
  useEffect(() => {
    const d = new Date();
    const wd = cap(d.toLocaleDateString('pt-PT', { weekday: 'long' }));
    const m = cap(d.toLocaleDateString('pt-PT', { month: 'long' }));
    setText(`${wd}, ${d.getDate()} ${m} ${d.getFullYear()}`);
  }, []);
  return <span className="whitespace-nowrap font-medium" suppressHydrationWarning>{text || ' '}</span>;
}
