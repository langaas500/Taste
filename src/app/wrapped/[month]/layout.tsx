import type { Metadata } from "next";

const MONTH_NAMES = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}): Promise<Metadata> {
  const { month } = await params;
  const [y, m] = month.split("-");
  const monthIdx = parseInt(m) - 1;
  const monthName = MONTH_NAMES[monthIdx] ?? MONTH_NAMES[0];

  const title = `Wrapped ${monthName} ${y} | Logflix`;
  const description = `Se hva du så i ${monthName} ${y} — din personlige månedsoppsummering fra Logflix.`;

  const ogUrl = `https://logflix.app/api/og/wrapped?month=${m}&year=${y}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://logflix.app/wrapped/${month}`,
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default function WrappedMonthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
