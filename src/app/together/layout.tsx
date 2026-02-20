import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    title: "Se Sammen — Logflix",
    description: "What should we watch tonight?",
    url: "https://logflix.app/together",
    images: [{ url: "https://logflix.app/og-image.png", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Se Sammen — Logflix",
    description: "What should we watch tonight?",
    images: ["https://logflix.app/og-image.png"]
  }
};

export default function TogetherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
