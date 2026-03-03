import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

/* ── Server-side client ─────────────────────────────── */

let _stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  _stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  return _stripe;
}

/* ── Client-side (lazy singleton) ───────────────────── */

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = key ? loadStripe(key) : Promise.resolve(null);
  }
  return stripePromise;
}

/* ── Price IDs ──────────────────────────────────────── */

export const FOUNDING_PRICE_ID = process.env.STRIPE_FOUNDING_PRICE_ID ?? "";
export const STANDARD_PRICE_ID = process.env.STRIPE_STANDARD_PRICE_ID ?? "";
