import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite compilar a versão estável noutra pasta, sem tocar na do servidor de desenvolvimento.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'revistaterra.co.mz',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'revistaterraonline.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
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
