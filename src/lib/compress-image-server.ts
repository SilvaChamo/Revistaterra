import sharp from 'sharp';

export const MAX_IMAGE_BYTES = 150 * 1024;

/** Compressor silencioso (servidor): WebP com no máximo 150 KB. GIF (pode ser animado) não é alterado. */
export async function compressImageBuffer(input: Buffer, mime: string, maxBytes = MAX_IMAGE_BYTES) {
  if (mime === 'image/gif') return { buffer: input, mime, ext: 'gif' };
  let width = 1600;
  let quality = 82;
  let out = input;
  for (let i = 0; i < 12; i++) {
    out = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer();
    if (out.length <= maxBytes) break;
    quality -= 10;
    if (quality < 40) { quality = 75; width = Math.round(width * 0.8); }
  }
  return { buffer: out, mime: 'image/webp', ext: 'webp' };
}
