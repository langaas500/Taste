import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Logflix",
  description:
    "Read how Logflix handles personal data, cookies and your rights as a user.",
  alternates: {
    canonical: "https://logflix.app/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
