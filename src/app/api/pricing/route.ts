import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { regionToCurrency } from "@/lib/stripe";
import { resolveRegion } from "@/lib/region";

const FOUNDING_LIMIT = 500;

const PRICES: Record<string, { founding: string; standard: string }> = {
  NOK: { founding: "29 kr", standard: "39 kr" },
  USD: { founding: "$2.49", standard: "$2.99" },
  EUR: { founding: "€2.49", standard: "€2.79" },
};

const PERIODS: Record<string, string> = {
  no: "/mnd", en: "/month", dk: "/md", se: "/mån", fi: "/kk",
};

export async function GET(req: NextRequest) {
  const admin = createSupabaseAdmin();

  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("founding_member", true);

  const foundingCount = count ?? 0;
  const isFoundingAvailable = foundingCount < FOUNDING_LIMIT;
  const spotsLeft = Math.max(0, FOUNDING_LIMIT - foundingCount);

  // Determine currency from IP
  const ipCountry = req.headers.get("x-vercel-ip-country") ?? "";
  const region = resolveRegion(null, ipCountry);
  const currency = regionToCurrency(region);
  const price = isFoundingAvailable ? PRICES[currency].founding : PRICES[currency].standard;

  return NextResponse.json({
    founding_count: foundingCount,
    founding_limit: FOUNDING_LIMIT,
    is_founding_available: isFoundingAvailable,
    spots_left: spotsLeft,
    currency,
    price,
    prices: PRICES[currency],
    periods: PERIODS,
  });
}
