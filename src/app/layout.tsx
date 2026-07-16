import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hevy Web — Treinos de Musculação",
  description:
    "Aplicação web para registro de treinos de musculação, controle de evolução e biblioteca de exercícios.",
  keywords: ["musculação", "treino", "exercícios", "academia", "hevy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "oklch(0.205 0 0)",
              color: "oklch(0.985 0 0)",
              border: "1px solid oklch(1 0 0 / 10%)",
            },
          }}
        />
      </body>
    </html>
  );
}
