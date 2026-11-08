import 'server-only';
import { unstable_cache } from 'next/cache';
import { hasAnyProfile, loadProfiles, PROFILE_NETWORKS } from '@/lib/social';
import { social as base } from '@/lib/terra';

export type SocialLink = { id: string; name: string; href: string };

const NAMES: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', x: 'X', tiktok: 'TikTok', whatsapp: 'WhatsApp' };

/** Redes sociais do cabeçalho do site: as do painel (Redes sociais, incluindo as acrescentadas à mão); se ainda não houver nenhuma, as de origem. */
export const loadSocialLinks = unstable_cache(
  async (): Promise<SocialLink[]> => {
    const fallback = base.map((s) => ({ id: s.name.toLowerCase(), name: s.name, href: s.href }));
    try {
      const p = await loadProfiles();
      if (!hasAnyProfile(p)) return fallback;
      return [
        ...PROFILE_NETWORKS.filter((n) => p[n]).map((n) => ({ id: n, name: NAMES[n], href: p[n] })),
        ...p.custom.map((c) => ({ id: `c-${c.id}`, name: c.name, href: c.url })),
      ];
    } catch {
      return fallback;
    }
  },
  ['social-links'],
  { tags: ['social'], revalidate: 3600 },
);
