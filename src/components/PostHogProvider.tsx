"use client";

import { useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { initPostHog, identify, resetIdentity } from "@/lib/posthog";
import CookieBanner, { CONSENT_KEY } from "@/components/CookieBanner";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY) === "all") initPostHog();

    function onConsentUpdate(e: Event) {
      if ((e as CustomEvent).detail === "all") initPostHog();
    }
    window.addEventListener("cookie_consent_updated", onConsentUpdate);

    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) identify(data.session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        identify(session.user.id);
      } else {
        resetIdentity();
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cookie_consent_updated", onConsentUpdate);
    };
  }, []);

  return (
    <>
      {children}
      <CookieBanner />
    </>
  );
}
