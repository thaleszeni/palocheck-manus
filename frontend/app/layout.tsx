import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaloCheck - Assistente de Avaliação Palográfica",
  description: "Sistema de auxílio à correção do Teste Palográfico com visão computacional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-clinical-bg text-clinical-text">
        {children}
      </body>
    </html>
  );
}
