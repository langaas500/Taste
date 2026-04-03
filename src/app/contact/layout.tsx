import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Logflix",
  description: "Get in touch with Logflix. We answer questions about the app, privacy and technical issues.",
  alternates: {
    canonical: "https://logflix.app/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
