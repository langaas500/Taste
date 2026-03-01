import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    locale: "en_US",
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en">{children}</div>;
}
