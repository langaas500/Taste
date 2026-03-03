import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate:
    process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Don't send events if DSN is not configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Exclude /dev/* routes from tracing
  tracePropagationTargets: [/^\/(?!dev\/)/, /^https:\/\/logflix\.app/],

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],

  // Capture 10% of sessions for replay in production
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  replaysOnErrorSampleRate: 1.0,
});
