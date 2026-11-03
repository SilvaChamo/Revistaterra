/** Leitor de áudio do navegador (play/pausa, tempo, linha de progresso, volume e menu), no tema escuro. */
export default function PodcastPlayer({ src }: { src?: string; duration?: string }) {
  return <audio controls preload="none" src={src} className="h-[54px] w-full" style={{ colorScheme: 'dark' }} />;
}
