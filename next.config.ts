import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite compilar a versão estável noutra pasta, sem tocar na do servidor de desenvolvimento.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    unoptimized: true,
    // Só o armazenamento deste projecto (Supabase): as fotos não se lêem de outros sites.
    remotePatterns: (() => {
      try {
        const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
        return [{ protocol: u.protocol.replace(':', '') as 'http' | 'https', hostname: u.hostname, ...(u.port ? { port: u.port } : {}), pathname: '/storage/v1/object/public/**' }];
      } catch {
        return [];
      }
    })(),
  },
  // Páginas que vinham do EntreCAMPOS: já não existem na Revista Terra, seguem para a home (ou para o equivalente).
  async redirects() {
    return [
      { source: '/iniciar', destination: '/', permanent: false },
      { source: '/inicio', destination: '/', permanent: false },
      { source: '/executiva', destination: '/', permanent: false },
      { source: '/pagina/contactos', destination: '/contacto', permanent: false },
      { source: '/pagina/:slug', destination: '/', permanent: false },
    ];
  },
  // Garantir que todas as rotas estáticas sejam geradas
  trailingSlash: false,
};

export default nextConfig;
