// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SonnerProvider } from "./providers/sonner-provider";
import {GlobalPending} from "@/components/system/GlobalPending";
import {GlobalNetTracker} from "@/components/system/GlobalNetTracker";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://app.contemplahub.com";

export const metadata: Metadata = {
    metadataBase: new URL(APP_URL),
    title: "ContemplaHub",
    description: "Consórcio com estratégia e clareza.",
    openGraph: {
        title: "ContemplaHub",
        description: "Consórcio com estratégia e clareza.",
        type: "website",
        images: [
            {
                url: "/og/proposta-cover.png", // vira https://app.contemplahub.com/og/proposta-cover.png
                width: 1200,
                height: 630,
                alt: "Proposta personalizada de consórcio",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "ContemplaHub",
        description: "Consórcio com estratégia e clareza.",
        images: ["/og/proposta-cover.png"],
    },
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
            <SonnerProvider />
            <GlobalNetTracker />
            <GlobalPending />
        </ThemeProvider>
        </body>
        </html>
    );
}
