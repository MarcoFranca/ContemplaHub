// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Autentika",
    description: "Consórcios",
};

// aplica 'dark' antes da hidratação para evitar flash
const setInitialTheme = `
(function () {
  try {
    const key = 'autentika-theme';
    const stored = localStorage.getItem(key);
    if (stored === 'dark') { document.documentElement.classList.add('dark'); return; }
    if (stored === 'light') { document.documentElement.classList.remove('dark'); return; }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  } catch {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
        <head><script dangerouslySetInnerHTML={{ __html: setInitialTheme }} /></head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="autentika-theme">
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
