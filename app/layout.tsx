import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { PrefsProvider, noFlashScript } from "@/lib/prefs";

const nunito = localFont({ src: "./fonts/nunito-latin.woff2", weight: "400 800", variable: "--font-nunito", display: "swap" });
const notoSansTamil = localFont({ src: "./fonts/noto-sans-tamil.woff2", weight: "400 700", variable: "--font-tamil", display: "swap" });

const description =
  "Vallalar's Thiru Arutpa and prose writings in your pocket: Tamil, transliteration, English translation and commentary. Free, offered by Sanmarkkam Life.";

export const metadata: Metadata = {
  title: { default: "Pocket Sanmarkkam", template: "%s · Pocket Sanmarkkam" },
  description,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Sanmarkkam" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf6ec",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} ${notoSansTamil.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        <PrefsProvider>
          <div className="pb-nav">{children}</div>
          <BottomNav />
        </PrefsProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
