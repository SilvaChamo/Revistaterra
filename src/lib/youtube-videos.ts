import data from '@/data/terra.json';

/** Canal da Revista Terra no YouTube (@revistaterramz). */
const CHANNEL_ID = 'UCzkLiKZSXHeYcgcJGhLOOoA';

export type Video = { id: string; title: string };

const decode = (t: string) => t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");

/**
 * Vídeos do canal, do mais recente para o mais antigo, lidos do feed público do YouTube (sem chave): os últimos 15.
 * Se o feed falhar ou vier vazio, ficam os vídeos guardados em src/data/terra.json, para o leitor nunca ficar sem nada.
 */
export async function loadVideos(): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(String(res.status));
    const xml = await res.text();
    const videos = [...xml.matchAll(/<entry>[\s\S]*?<yt:videoId>([\w-]{11})<\/yt:videoId>[\s\S]*?<title>([\s\S]*?)<\/title>/g)].map((m) => ({ id: m[1], title: decode(m[2]).trim() }));
    if (videos.length) return videos;
  } catch { /* usa os guardados */ }
  return data.videos;
}
