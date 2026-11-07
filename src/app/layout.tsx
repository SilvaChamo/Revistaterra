import "./globals.css";
import RevealOnView from "@/components/Expnews/RevealOnView";

import { AuthProvider } from "@/context/AuthContext";
import RadioProvider from "@/components/Terra/RadioProvider";
import NewsletterPulse from "@/components/Site/NewsletterPulse";

export const metadata = {
  title: 'Revista Terra',
  description: 'Revista Terra — A Voz do Agro e Ambiente',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" data-scroll-behavior="smooth">
      <head>
        {/* Abre já a ligação ao Supabase (imagens das notícias e dados) e ao serviço do clima */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="" />}
        <link rel="dns-prefetch" href="https://api.open-meteo.com" />
        {/* Rádio: a ligação ao directo já está aberta quando se carrega em play */}
        <link rel="preconnect" href="https://stream.zeno.fm" />
      </head>
      <body style={{ fontFamily: 'Verdana, sans-serif' }}>
        <AuthProvider>
          <RevealOnView />
          <NewsletterPulse />
          <RadioProvider>{children}</RadioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
