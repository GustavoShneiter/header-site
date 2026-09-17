import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Header · Seu espaço pessoal",
  description: "Tarefas, calendário e evolução pessoal em um só lugar.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
