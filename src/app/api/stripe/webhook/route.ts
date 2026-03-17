import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { getStripeServer, FOUNDING_PRICE_ID } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripeServer();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Return 200 immediately, then process
  const admin = createSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        if (!userId) break;

        const isFounding = session.metadata?.founding === "true";

        await admin
          .from("profiles")
          .update({
            is_premium: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            premium_since: new Date().toISOString(),
            founding_member: isFounding,
          })
          .eq("id", userId);

        // Share premium with linked partner
        const { data: link } = await admin
          .from("account_links")
          .select("id, inviter_id, invitee_id")
          .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
          .eq("status", "accepted")
          .limit(1)
          .single();

        if (link) {
          const partnerId = link.inviter_id === userId ? link.invitee_id : link.inviter_id;
          if (partnerId) {
            await admin
              .from("account_links")
              .update({ partner_premium: true })
              .eq("id", link.id);
            await admin
              .from("profiles")
              .update({ is_premium: true, founding_member: isFounding })
              .eq("id", partnerId);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer as string;

        // Find the user being downgraded
        const { data: downgraded } = await admin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        await admin
          .from("profiles")
          .update({ is_premium: false })
          .eq("stripe_customer_id", customerId);

        // Remove partner premium
        if (downgraded) {
          const { data: link } = await admin
            .from("account_links")
            .select("id, inviter_id, invitee_id")
            .or(`inviter_id.eq.${downgraded.id},invitee_id.eq.${downgraded.id}`)
            .eq("status", "accepted")
            .limit(1)
            .single();

          if (link) {
            const partnerId = link.inviter_id === downgraded.id ? link.invitee_id : link.inviter_id;
            if (partnerId) {
              await admin
                .from("account_links")
                .update({ partner_premium: false })
                .eq("id", link.id);
              await admin
                .from("profiles")
                .update({ is_premium: false })
                .eq("id", partnerId);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer as string;

        const isActive = sub.status === "active" || sub.status === "trialing";
        const priceId = sub.items.data[0]?.price?.id;
        const isFounding = priceId === FOUNDING_PRICE_ID;

        await admin
          .from("profiles")
          .update({
            is_premium: isActive,
            founding_member: isFounding,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }
  } catch (e: unknown) {
    console.error("[stripe-webhook]", e instanceof Error ? e.message : e);
  }

  return NextResponse.json({ received: true });
}
