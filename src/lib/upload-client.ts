import { supabase, STORAGE_BUCKET } from '@/lib/supabase';

/**
 * Carrega um ficheiro para a galeria. As imagens vão pelo servidor (valida a sessão e comprime para WebP até 150 KB),
 * por isso não dependem de regras de escrita no armazenamento. Vídeos e documentos tentam o envio directo.
 */
export async function uploadToBucket(file: Blob, name: string, opts: { upsert?: boolean } = {}): Promise<{ error: Error | null; path?: string; url?: string }> {
  const isImage = file.type.startsWith('image/') && file.type !== 'image/svg+xml';
  if (!isImage) {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(name, file, { contentType: file.type || undefined, upsert: !!opts.upsert });
    if (error) return { error: new Error(/row-level security/i.test(error.message) ? 'Este tipo de ficheiro (vídeo/documento) ainda não pode ser carregado: o armazenamento não tem permissão de escrita.' : error.message) };
    return { error: null, path: name, url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(name).data.publicUrl };
  }
  const form = new FormData();
  form.append('file', file, name);
  form.append('bucket', STORAGE_BUCKET);
  form.append('name', name);
  if (opts.upsert) form.append('upsert', 'true');
  try {
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form, credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (res.status === 413) return { error: new Error('A imagem é demasiado grande para ser enviada (máximo cerca de 4 MB). Reduza-a e tente de novo.') };
    if (!res.ok) return { error: new Error(json.error || 'Falha no carregamento da imagem.') };
    return { error: null, path: json.path, url: json.url };
  } catch (e: any) {
    return { error: new Error(e?.message || 'Falha de ligação.') };
  }
}
