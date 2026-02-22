import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Logflix",
  description: "Track what you watch. Get smart, AI-powered recommendations.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Logflix",
  },
  openGraph: {
    title: "Logflix",
    description: "What should we watch tonight?",
    url: "https://logflix.app",
    siteName: "Logflix",
    images: [{
      url: "https://logflix.app/og-image.png",
      width: 1200,
      height: 630,
      alt: "Logflix"
    }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Logflix",
    description: "What should we watch tonight?",
    images: ["https://logflix.app/og-image.png"]
  }
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
        <ToastProvider>
          <div className="relative z-10">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
