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

// Legacy single-price (still used as NOK fallback if new env vars not set)
export const FOUNDING_PRICE_ID = process.env.STRIPE_FOUNDING_PRICE_ID ?? "";
export const STANDARD_PRICE_ID = process.env.STRIPE_STANDARD_PRICE_ID ?? "";

// Multi-currency price IDs
export const FOUNDING_PRICES: Record<string, string> = {
  NOK: process.env.STRIPE_PRICE_FOUNDING_NOK || FOUNDING_PRICE_ID,
  USD: process.env.STRIPE_PRICE_FOUNDING_USD || "",
  EUR: process.env.STRIPE_PRICE_FOUNDING_EUR || "",
};

export const STANDARD_PRICES: Record<string, string> = {
  NOK: process.env.STRIPE_PRICE_STANDARD_NOK || STANDARD_PRICE_ID,
  USD: process.env.STRIPE_PRICE_STANDARD_USD || "",
  EUR: process.env.STRIPE_PRICE_STANDARD_EUR || "",
};

const USD_REGIONS = ["US", "CA", "AU"];
const NOK_REGIONS = ["NO", "DK", "SE", "FI"];

export function regionToCurrency(region: string): string {
  const r = region.toUpperCase();
  if (NOK_REGIONS.includes(r)) return "NOK";
  if (USD_REGIONS.includes(r)) return "USD";
  return "EUR";
}

export function getPriceId(isFounding: boolean, currency: string): string {
  const prices = isFounding ? FOUNDING_PRICES : STANDARD_PRICES;
  return prices[currency] || prices.NOK || "";
}
