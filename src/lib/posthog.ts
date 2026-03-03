import posthog from "posthog-js";

const key = typeof window !== "undefined"
  ? process.env.NEXT_PUBLIC_POSTHOG_KEY
  : undefined;

let initialized = false;

export function initPostHog() {
  if (initialized || !key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
  initialized = true;
}

export function track(event: string, properties?: Record<string, unknown>) {
  try {
    if (key && initialized) posthog.capture(event, properties);
  } catch {
    /* never throw */
  }
}

export function identify(userId: string) {
  try {
    if (key && initialized) posthog.identify(userId);
  } catch {
    /* never throw */
  }
}

export function resetIdentity() {
  try {
    if (key && initialized) posthog.reset();
  } catch {
    /* never throw */
  }
}

export { posthog };
