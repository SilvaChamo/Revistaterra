import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-guard';
import { compressImageBuffer } from '@/lib/compress-image-server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Só imagens, só destes buckets e com limite de tamanho; a extensão e o tipo são decididos aqui.
const ALLOWED_BUCKETS = ['avatars', 'media', process.env.STORAGE_BUCKET, process.env.NEXT_PUBLIC_STORAGE_BUCKET].filter(Boolean) as string[];
const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const guard = await requireAuth('upload_imagens', 'usar_media', 'gerir_biblioteca', 'criar_artigos', 'editar_utilizadores');
  if ('error' in guard) return guard.error;
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bucket = (formData.get('bucket') as string) || 'avatars';
    const wantedName = String(formData.get('name') || '');
    const upsert = formData.get('upsert') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum ficheiro enviado' }, { status: 400 });
    }
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Destino não permitido' }, { status: 400 });
    }
    const fileExt = IMAGE_TYPES[file.type];
    if (!fileExt) {
      return NextResponse.json({ error: 'Só são aceites imagens JPG, PNG, WEBP ou GIF' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'A imagem excede 8 MB' }, { status: 400 });
    }

    // Compressão silenciosa: WebP até 150 KB
    const packed = await compressImageBuffer(Buffer.from(await file.arrayBuffer()), file.type);
    const buffer = packed.buffer;
    // Nome pedido (galeria): só letras, números, ponto, hífen e sublinhado, sem pastas; senão, um nome aleatório.
    const base = wantedName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\.[^.]*$/, '').replace(/[^\w-]+/g, '_').replace(/^[_.-]+/, '').slice(0, 100);
    const fileName = base ? `${base}.${packed.ext}` : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${packed.ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: packed.mime,
        upsert
      });

    if (error) {
      console.error('Erro no upload Supabase:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, path: fileName });
  } catch (err: any) {
    console.error('Erro no servidor de upload:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
