import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://logflix.app"),
  title: "Logflix — Agree on what to watch. Instantly.",
  description: "Swipe separately. Match when you both like it. Free, no account needed.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Logflix",
  },
  openGraph: {
    title: "Logflix — Agree on what to watch. Instantly.",
    description: "Swipe separately. Match when you both like it. Free, no account needed.",
    url: "https://logflix.app",
    siteName: "Logflix",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logflix — Agree on what to watch. Instantly.",
    description: "Swipe separately. Match when you both like it.",
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
        <ToastProvider>
          <div className="relative z-10">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
