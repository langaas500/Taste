import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { REGION_TEXT, type RegionTextKey } from "@/components/TitlePageContent";
import { ToastProvider } from "@/components/Toast";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://logflix.app"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Logflix",
  },
  verification: {
    google: "google3a70000c026a667b",
  },
  openGraph: {
    siteName: "Logflix",
    type: "website",
    images: [{ url: "/og-v2.png", width: 1200, height: 630, alt: "Logflix" }],
  },
  facebook: {
    appId: "1502002261429610",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-v2.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const country = h.get("x-vercel-ip-country") ?? "";
  const localeCookie = h.get("cookie")?.match(/(?:^|; )x-locale=([^;]*)/)?.[1];
  const manualCookie = h.get("cookie")?.match(/(?:^|; )x-locale-manual=([^;]*)/)?.[1];

  // Manual locale choice takes priority, then IP detection, then default to English
  const regionMap: Record<string, RegionTextKey> = { NO: "no", DK: "dk", FI: "fi", SE: "se" };
  const siteRegion: RegionTextKey = manualCookie === "1" && localeCookie
    ? (localeCookie as RegionTextKey)
    : regionMap[country] ?? "en";
  const langMap: Record<string, string> = { no: "nb", dk: "da", fi: "fi", se: "sv", en: "en" };
  const lang = langMap[siteRegion] ?? "en";
  const siteT = REGION_TEXT[siteRegion] ?? REGION_TEXT["en"];

  return (
    <html lang={lang} className={inter.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Logflix" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-dvh antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Logflix",
              url: "https://logflix.app",
              description: siteT.siteDescription,
              inLanguage: ["en", "nb", "sv", "da", "fi"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Logflix",
              url: "https://logflix.app",
              logo: "https://logflix.app/logo.png",
              foundingDate: "2024",
              sameAs: [
                "https://www.facebook.com/logflix",
                "https://www.instagram.com/logflix",
              ],
              description:
                "Movie & TV companion for couples, friends and families. Swipe, match and discover what to watch tonight — together.",
            }),
          }}
        />
        <PostHogProvider>
          <ToastProvider>
            <div className="relative z-10">{children}</div>
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
