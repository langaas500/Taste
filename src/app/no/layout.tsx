import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    locale: "nb_NO",
  },
};

export default function NoLayout({ children }: { children: React.ReactNode }) {
  return <div lang="nb">{children}</div>;
}
