'use client';

import { createContext, useContext } from 'react';
import { social as base } from '@/lib/terra';

export type SocialLink = { id: string; name: string; href: string };

const fallback: SocialLink[] = base.map((s) => ({ id: s.name.toLowerCase(), name: s.name, href: s.href }));
const Ctx = createContext<SocialLink[]>(fallback);

/** Redes sociais definidas no painel, partilhadas pelas barras do cabeçalho (chegam já com a página, vindas do servidor). */
export const useSocialLinks = () => useContext(Ctx);

export default function SocialProvider({ links, children }: { links: SocialLink[]; children: React.ReactNode }) {
  return <Ctx.Provider value={links}>{children}</Ctx.Provider>;
}

const PATHS: Record<string, string> = {
  facebook: base[0].path,
  youtube: base[1].path,
  instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm5 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.2 5.8a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z',
  linkedin: 'M5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3.5 9h3v12h-3zM9.5 9h2.9v1.7h.1c.5-.9 1.7-1.9 3.5-1.9 3.1 0 3.8 2 3.8 4.7V21h-3v-6.6c0-1.6 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21h-3z',
  x: 'M17.8 3h3L14.2 10.5 22 21h-6.1l-4.8-6.3L5.6 21h-3l7-8L2.3 3h6.3l4.3 5.8L17.8 3zm-1 16.2h1.7L7.5 4.7H5.7l11.1 14.5z',
  tiktok: 'M16.5 3c.3 2.4 1.7 4 4 4.2v3.1c-1.5 0-2.9-.5-4-1.3v6.1c0 3.2-2.5 5.4-5.5 5.4s-5.5-2.200-5.500-5.300c0-3.300 2.800-5.700 6.200-5.200v3.200c-1.700-.4-3.100.7-3.100 2.100 0 1.200.9 2.200 2.200 2.200 1.400 0 2.300-1 2.300-2.500V3h3.400z',
  whatsapp: 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.78a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.89 9.88',
};

/** Ícone da rede; as acrescentadas à mão (sem ícone próprio) mostram a inicial do nome num círculo. */
export function SocialGlyph({ link, className }: { link: SocialLink; className: string }) {
  const path = PATHS[link.id];
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      {path ? <path d={path} fillRule="evenodd" /> : (
        <>
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="12" y="16.2" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Verdana, sans-serif">{link.name.charAt(0).toUpperCase()}</text>
        </>
      )}
    </svg>
  );
}
