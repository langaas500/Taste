import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { getStripeServer, regionToCurrency, getPriceId } from "@/lib/stripe";
import { resolveRegion } from "@/lib/region";
import { withLogger } from "@/lib/logger";

const FOUNDING_LIMIT = 500;

export const POST = withLogger("/api/stripe/checkout", async (req: NextRequest, { logger }) => {
  const user = await requireUser();
  logger.setUserId(user.id);

  const stripe = getStripeServer();
  const admin = createSupabaseAdmin();

  // Fetch profile region + founding member count in parallel
  const [{ data: profile }, { count }] = await Promise.all([
    admin.from("profiles").select("preferred_region").eq("id", user.id).single(),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("founding_member", true),
  ]);

  const isFoundingSlot = (count ?? 0) < FOUNDING_LIMIT;
  const userRegion = resolveRegion(profile?.preferred_region, req.headers.get("x-vercel-ip-country"));
  const currency = regionToCurrency(userRegion);
  const priceId = getPriceId(isFoundingSlot, currency);

  if (!priceId) {
    logger.error("No price ID configured", undefined, { isFoundingSlot, currency, userRegion });
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://logflix.app"}/home?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://logflix.app"}/home`,
    customer_email: user.email ?? undefined,
    metadata: {
      user_id: user.id,
      founding: isFoundingSlot ? "true" : "false",
    },
  });

  return NextResponse.json({ url: session.url });
});
