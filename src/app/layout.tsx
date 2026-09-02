import type { Metadata } from "next";
import { Golos_Text, PT_Serif, Unbounded } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

// Geist поддерживал только subsets:["latin"] — весь русский/узбекский текст
// приложения молча падал на системный шрифт вместо заданного. Golos Text,
// Unbounded и PT Serif все нативно несут кириллицу.
const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});

// Текст урока во вкладке "Теория" — сигнал смены режима "листаю → читаю",
// а не просто смена шрифта.
const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "BioMap",
  description: "Биология как единая система знаний",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${golos.variable} ${unbounded.variable} ${ptSerif.variable} h-full antialiased`}
    >
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="mx-auto flex min-h-full max-w-md flex-col bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
