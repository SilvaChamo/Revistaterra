/** Dados da empresa para o cabeçalho e o rodapé da newsletter (os mesmos da página de contactos do site). */
export const BRAND = {
  name: 'Revista Terra',
  tagline: 'A Voz do Agro e Ambiente',
  /** Título do cabeçalho, por cima da morada. */
  headline: 'Revistaterra, ao serviço do agro',
  address: 'Rua da Resistência, Nº 1642, 3º Andar',
  phones: ['+258 82 123 3910'],
  emails: ['comercial@revistaterra.co.mz'],
  /** Redes sociais do rodapé do e-mail; `key` é o ficheiro em /images/social. */
  social: [
    { key: 'facebook', label: 'Facebook', url: 'https://web.facebook.com/profile.php?id=100089198332110' },
    { key: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@revistaterramz' },
  ],
};

/** Cores da marca (as mesmas de src/lib/terra.ts, repetidas aqui para o painel não carregar os dados do site): verde dos botões «Ler mais» e das datas, verde escuro do rodapé e verde-lima das etiquetas. */
export const GREEN = '#047857';
export const DARK = '#064E3B';
export const LIME = '#9BCB3C';

/** Largura do e-mail, em píxeis. */
export const EMAIL_WIDTH = 680;
/** Altura fixa da foto da notícia em destaque (todas iguais, cortadas ao centro). */
export const LEAD_IMAGE_HEIGHT = 340;

/** Data por extenso, como nos cards do site (hora de Maputo). */
export const longDate = (iso: string) => new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Maputo' });

/** Espaços de publicidade da newsletter: cada um tem uma única medida (píxeis) e um peso máximo da imagem (KB). O preço define-se no painel. */
export const AD_POSITIONS = {
  topo: 'Em cima do cabeçalho',
  cabecalho: 'No cabeçalho',
  depois: 'Depois do cabeçalho',
  meio: 'No meio das notícias',
  rodape: 'Em cima do rodapé',
} as const;
export type AdPosition = keyof typeof AD_POSITIONS;
export const AD_LETTER: Record<AdPosition, string> = { topo: 'A', cabecalho: 'B', depois: 'C', meio: 'D', rodape: 'E' };
/** `key` é a própria posição. O espaço do meio é o mais alto (500 px). */
export const AD_SLOTS: { key: AdPosition; position: AdPosition; w: number; h: number; kb: number }[] = [
  { key: 'topo', position: 'topo', w: 680, h: 200, kb: 120 },
  { key: 'cabecalho', position: 'cabecalho', w: 230, h: 120, kb: 30 },
  { key: 'depois', position: 'depois', w: 680, h: 200, kb: 120 },
  { key: 'meio', position: 'meio', w: 680, h: 500, kb: 300 },
  { key: 'rodape', position: 'rodape', w: 680, h: 200, kb: 120 },
];
/** Medida e peso de um espaço, como se mostra depois do nome: «Medida: 680x120px, Tamanho: 80kb». */
export const adMeasure = (s: { w: number; h: number; kb: number }) => `Medida: ${s.w}x${s.h}px, Tamanho: ${s.kb}kb`;
export const slotLabel = (key: string) => {
  const s = AD_SLOTS.find((x) => x.key === key);
  return s ? `${AD_POSITIONS[s.position]} — ${adMeasure(s)}` : key;
};
export const formatPrice = (n: number | undefined) => (typeof n === 'number' && n > 0 ? `${n.toLocaleString('pt-PT')} MT` : 'Sob consulta');
