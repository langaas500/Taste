// Server-side environment variable validation
// Throws at import time if required vars are missing

function required(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Add it to .env.local or your deployment environment.`
    );
  }
  return val;
}

// --- Required ---
const NEXT_PUBLIC_SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL");
const NEXT_PUBLIC_SUPABASE_ANON_KEY = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = required("SUPABASE_SERVICE_ROLE_KEY");
const TMDB_API_KEY = required("TMDB_API_KEY");

// At least one AI key required
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!ANTHROPIC_API_KEY && !OPENAI_API_KEY) {
  throw new Error(
    "Missing AI API key: set ANTHROPIC_API_KEY or OPENAI_API_KEY. " +
    "At least one is required for AI features."
  );
}

// --- Stripe (required for billing) ---
const STRIPE_SECRET_KEY = required("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = required("STRIPE_WEBHOOK_SECRET");
const STRIPE_FOUNDING_PRICE_ID = required("STRIPE_FOUNDING_PRICE_ID");
const STRIPE_STANDARD_PRICE_ID = required("STRIPE_STANDARD_PRICE_ID");

// --- Warn only ---
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.warn("Optional env var NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set.");
}
if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
  console.warn("Optional env var NEXT_PUBLIC_SENTRY_DSN is not set.");
}

// --- Warn + fallback ---
if (!process.env.GUEST_TOKEN_SECRET) {
  console.warn("GUEST_TOKEN_SECRET is not set. Falling back to SUPABASE_SERVICE_ROLE_KEY.");
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  TMDB_API_KEY,

  // AI
  ANTHROPIC_API_KEY,
  OPENAI_API_KEY,
  AI_PROVIDER: (process.env.AI_PROVIDER || "anthropic") as "anthropic" | "openai",
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929",

  // Observability
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Guest auth
  GUEST_TOKEN_SECRET: process.env.GUEST_TOKEN_SECRET || SUPABASE_SERVICE_ROLE_KEY,

  // Trakt (optional integration)
  TRAKT_CLIENT_ID: process.env.TRAKT_CLIENT_ID,
  TRAKT_CLIENT_SECRET: process.env.TRAKT_CLIENT_SECRET,
  TRAKT_REDIRECT_URI: process.env.TRAKT_REDIRECT_URI,

  // Backfill
  BACKFILL_SECRET: process.env.BACKFILL_SECRET,

  // Stripe
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_FOUNDING_PRICE_ID,
  STRIPE_STANDARD_PRICE_ID,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

  // Admin
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || "martinrlangaas@protonmail.com").split(",").map(e => e.trim()),
} as const;
