import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { getStripeServer, FOUNDING_PRICE_ID, STANDARD_PRICE_ID } from "@/lib/stripe";
import { withLogger } from "@/lib/logger";

const FOUNDING_LIMIT = 500;

export const POST = withLogger("/api/stripe/checkout", async (_req, { logger }) => {
  const user = await requireUser();
  logger.setUserId(user.id);

  const stripe = getStripeServer();
  const admin = createSupabaseAdmin();

  // Determine price based on founding member count
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("founding_member", true);

  const isFoundingSlot = (count ?? 0) < FOUNDING_LIMIT;
  const priceId = isFoundingSlot ? FOUNDING_PRICE_ID : STANDARD_PRICE_ID;

  if (!priceId) {
    logger.error("No price ID configured", undefined, { isFoundingSlot });
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
