import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Logflix",
  description: "Get help with Logflix. Contact our support team.",
  alternates: {
    canonical: "https://logflix.app/support",
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
