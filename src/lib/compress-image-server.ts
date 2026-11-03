import sharp from 'sharp';

export const MAX_IMAGE_BYTES = 150 * 1024;

/** Compressor silencioso (servidor): WebP com no máximo 150 KB. GIF (pode ser animado) não é alterado. */
export async function compressImageBuffer(input: Buffer, mime: string, maxBytes = MAX_IMAGE_BYTES) {
  if (mime === 'image/gif') return { buffer: input, mime, ext: 'gif' };
  let out = input;
  // Reduz a qualidade e, se for preciso, a largura, até caber no limite (só pára quando cabe ou chega a 240px).
  for (let width = 1600; width >= 240; width = Math.round(width * 0.8)) {
    for (const quality of [80, 68, 56, 44, 34]) {
      out = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer();
      if (out.length <= maxBytes) return { buffer: out, mime: 'image/webp', ext: 'webp' };
    }
  }
  return { buffer: out, mime: 'image/webp', ext: 'webp' };
}
