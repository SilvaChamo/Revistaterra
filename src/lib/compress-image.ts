/**
 * Compressor silencioso de imagens (browser): reduz qualquer foto carregada para WebP com no máximo 150 KB,
 * sem pedir nada ao utilizador. GIF e SVG ficam como estão; imagens que já cabem no limite não são tocadas.
 */
export const MAX_IMAGE_BYTES = 150 * 1024;
const KEEP = ['image/gif', 'image/svg+xml'];

export const extFor = (type: string) => (type === 'image/jpeg' ? 'jpg' : 'webp');

export async function compressImage(
  input: Blob,
  opts: { type?: 'image/webp' | 'image/jpeg'; maxBytes?: number; maxWidth?: number } = {},
): Promise<Blob> {
  const max = opts.maxBytes ?? MAX_IMAGE_BYTES;
  if (!input.type.startsWith('image/') || KEEP.includes(input.type)) return input;
  if (input.size <= max && (!opts.type || input.type === opts.type)) return input;
  const type = opts.type ?? 'image/webp';
  try {
    const bmp = await createImageBitmap(input);
    let w = Math.min(bmp.width, opts.maxWidth ?? 1600);
    let last: Blob | null = null;
    for (let round = 0; round < 6; round++) {
      const h = Math.max(1, Math.round((bmp.height * w) / bmp.width));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return input;
      ctx.drawImage(bmp, 0, 0, w, h);
      for (const q of [0.82, 0.72, 0.62, 0.52, 0.42]) {
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
        if (!blob) continue;
        last = blob;
        if (blob.size <= max) return blob;
      }
      w = Math.round(w * 0.8);
    }
    return last && last.size < input.size ? last : input;
  } catch {
    return input; // se o browser não conseguir, envia o original em vez de falhar
  }
}
