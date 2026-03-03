"use client";

import { useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { initPostHog, identify, resetIdentity } from "@/lib/posthog";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();

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

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
