/** Leitor de áudio do navegador (play/pausa, tempo, linha de progresso, volume e menu), sem fundo: só os botões e os detalhes. */
export default function PodcastPlayer({ src }: { src?: string; duration?: string }) {
  return <audio controls preload="none" src={src} className="podcast-audio h-[54px] w-full" />;
}
