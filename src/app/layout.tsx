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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Logflix",
  },
  verification: {
    google: "google3a70000c026a667b",
  },
};

export const viewport: Viewport = {
  themeColor: "#06080f",
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
  const regionMap: Record<string, RegionTextKey> = { NO: "no", DK: "dk", FI: "fi", SE: "se" };
  const siteRegion = regionMap[country] ?? "no";
  const lang = ({ no: "nb", dk: "da", fi: "fi", se: "sv" } as const)[siteRegion];
  const siteT = REGION_TEXT[siteRegion];

  return (
    <html lang={lang} className={inter.className}>
      <body className="min-h-dvh antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Logflix",
              url: "https://logflix.app",
              description: siteT.siteDescription,
              inLanguage: [lang, "en"],
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
