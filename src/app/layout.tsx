import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ToastProvider } from "@/components/Toast";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://logflix.app"),
  title: "Logflix — Finn noe å se sammen",
  description: "Sveip deg frem til enighet. Match med partneren din på under 3 minutter.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Logflix",
  },
  openGraph: {
    title: "Logflix — Finn noe å se sammen",
    description: "Sveip deg frem til enighet. Match med partneren din på under 3 minutter.",
    url: "https://logflix.app",
    siteName: "Logflix",
    locale: "nb_NO",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Logflix — Finn noe å se sammen",
    description: "Sveip deg frem til enighet. Match med partneren din på under 3 minutter.",
    images: ["/og-image.png"],
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
  const lang = country === "NO" ? "nb" : "en";

  return (
    <html lang={lang} className={inter.className}>
      <body className="min-h-dvh antialiased">
        <PostHogProvider>
          <ToastProvider>
            <div className="relative z-10">{children}</div>
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
