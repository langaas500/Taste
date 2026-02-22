import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Se Sammen — Finn noe å se sammen | Logflix",
  description: "Swipe hver for dere. Match kun når begge liker. Gratis, ingen konto nødvendig.",
  openGraph: {
    title: "Se Sammen — Finn noe å se sammen | Logflix",
    description: "Swipe hver for dere. Match kun når begge liker. Gratis, ingen konto nødvendig.",
    url: "https://logflix.app/together",
    siteName: "Logflix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Se Sammen — Finn noe å se sammen | Logflix",
    description: "Swipe hver for dere. Match kun når begge liker. Gratis, ingen konto nødvendig.",
  },
};

export default function TogetherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
