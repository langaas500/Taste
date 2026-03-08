import { notFound } from "next/navigation";
import type { Metadata } from "next";

/** Phase 1 regions: Nordic only */
const VALID_REGIONS = ["no", "dk", "fi", "se"] as const;
type TitleRegion = (typeof VALID_REGIONS)[number];

const REGION_LANG: Record<TitleRegion, string> = {
  no: "nb",
  dk: "da",
  fi: "fi",
  se: "sv",
};

const REGION_LOCALE: Record<TitleRegion, string> = {
  no: "nb_NO",
  dk: "da_DK",
  fi: "fi_FI",
  se: "sv_SE",
};

function isValidRegion(r: string): r is TitleRegion {
  return (VALID_REGIONS as readonly string[]).includes(r);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  if (!isValidRegion(region)) return {};
  return {
    openGraph: {
      locale: REGION_LOCALE[region],
    },
  };
}

export default async function RegionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  if (!isValidRegion(region)) notFound();

  return <div lang={REGION_LANG[region]}>{children}</div>;
}
