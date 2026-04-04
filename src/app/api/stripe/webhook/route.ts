import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { getStripeServer } from "@/lib/stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

const FOUNDING_PRICE_IDS = [
  process.env.STRIPE_FOUNDING_PRICE_ID,
  process.env.STRIPE_PRICE_FOUNDING_NOK,
  process.env.STRIPE_PRICE_FOUNDING_USD,
  process.env.STRIPE_PRICE_FOUNDING_EUR,
].filter(Boolean) as string[];

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

        // Freeze couple data before removing premium
        if (downgraded) {
          try {
            const frozen = await buildFrozenCoupleData(admin, downgraded.id);
            if (frozen) {
              await admin
                .from("profiles")
                .update({ frozen_couple_data: frozen })
                .eq("id", downgraded.id);
            }
          } catch { /* non-fatal — don't block cancellation */ }
        }

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
              // Also freeze partner's data
              try {
                const partnerFrozen = await buildFrozenCoupleData(admin, partnerId);
                if (partnerFrozen) {
                  await admin
                    .from("profiles")
                    .update({ frozen_couple_data: partnerFrozen, is_premium: false })
                    .eq("id", partnerId);
                } else {
                  await admin
                    .from("profiles")
                    .update({ is_premium: false })
                    .eq("id", partnerId);
                }
              } catch {
                await admin
                  .from("profiles")
                  .update({ is_premium: false })
                  .eq("id", partnerId);
              }
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
        const isFoundingPrice = !!priceId && FOUNDING_PRICE_IDS.includes(priceId);

        // Once founding, always founding — never downgrade existing founding members
        const { data: existing } = await admin
          .from("profiles")
          .select("founding_member")
          .eq("stripe_customer_id", customerId)
          .single();

        const foundingMember = existing?.founding_member === true || isFoundingPrice;

        await admin
          .from("profiles")
          .update({
            is_premium: isActive,
            founding_member: foundingMember,
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

/* ── Freeze helper ────────────────────────────────────── */

async function buildFrozenCoupleData(admin: SupabaseClient, userId: string) {
  // Find partner
  const { data: link } = await admin
    .from("account_links")
    .select("id, inviter_id, invitee_id")
    .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
    .eq("status", "accepted")
    .limit(1)
    .single();

  if (!link) return null;

  const partnerId = link.inviter_id === userId ? link.invitee_id : link.inviter_id;

  // Total matched sessions between pair
  const { count: matches } = await admin
    .from("wt_sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "matched")
    .not("match_tmdb_id", "is", null)
    .or(
      `and(host_id.eq.${userId},guest_id.eq.${partnerId}),and(host_id.eq.${partnerId},guest_id.eq.${userId})`,
    );

  // Compute a simple compatibility score from swipe overlap (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
  const [mySwipes, partnerSwipes] = await Promise.all([
    admin
      .from("wt_session_swipes")
      .select("tmdb_id")
      .eq("user_id", userId)
      .in("decision", ["like", "superlike"])
      .gte("created_at", ninetyDaysAgo)
      .limit(300),
    admin
      .from("wt_session_swipes")
      .select("tmdb_id")
      .eq("user_id", partnerId)
      .in("decision", ["like", "superlike"])
      .gte("created_at", ninetyDaysAgo)
      .limit(300),
  ]);

  const myIds = new Set((mySwipes.data || []).map((s: { tmdb_id: number }) => s.tmdb_id));
  const partnerIds = new Set((partnerSwipes.data || []).map((s: { tmdb_id: number }) => s.tmdb_id));
  const overlap = [...myIds].filter((id) => partnerIds.has(id)).length;
  const union = new Set([...myIds, ...partnerIds]).size;
  const score = union > 0 ? Math.round((overlap / union) * 100) : 50;

  // Fetch streak from couple-streak logic (simplified: count consecutive weeks)
  const { data: sessions } = await admin
    .from("wt_sessions")
    .select("created_at")
    .eq("status", "matched")
    .not("match_tmdb_id", "is", null)
    .or(
      `and(host_id.eq.${userId},guest_id.eq.${partnerId}),and(host_id.eq.${partnerId},guest_id.eq.${userId})`,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  let streak = 0;
  if (sessions && sessions.length > 0) {
    const weekStart = (d: Date) => {
      const copy = new Date(d);
      const day = copy.getUTCDay();
      copy.setUTCDate(copy.getUTCDate() - (day === 0 ? 6 : day - 1));
      return copy.toISOString().slice(0, 10);
    };
    const weekSet = new Set<string>(sessions.map((s: { created_at: string }) => weekStart(new Date(s.created_at))));
    const matchWeeks = [...weekSet].sort((a, b) => b.localeCompare(a));
    const now = new Date();
    const currentWeek = weekStart(now);
    const lastWeek = weekStart(new Date(now.getTime() - 7 * 86400000));

    if (matchWeeks[0] === currentWeek || matchWeeks[0] === lastWeek) {
      let checkWeek = matchWeeks[0];
      for (const w of matchWeeks) {
        if (w === checkWeek) {
          streak++;
          const d = new Date(checkWeek + "T00:00:00Z");
          d.setUTCDate(d.getUTCDate() - 7);
          checkWeek = d.toISOString().slice(0, 10);
        }
      }
    }
  }

  return {
    score,
    matches: matches || 0,
    streak,
    frozen_at: new Date().toISOString(),
  };
}
