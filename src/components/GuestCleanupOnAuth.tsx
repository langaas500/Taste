"use client";

import { useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { migrateGuestData } from "@/lib/guest-migration";
import { readGuestTitleActions, clearGuestTitleActions } from "@/lib/guest-actions";

const TITLES_MIGRATED_KEY = "logflix_guest_titles_migrated";

export default function GuestCleanupOnAuth() {
  useEffect(() => {
    (async () => {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Migrate guest title actions to user_titles (once)
      if (!localStorage.getItem(TITLES_MIGRATED_KEY)) {
        const actions = readGuestTitleActions();
        if (actions.length > 0) {
          try {
            const res = await fetch("/api/guest/migrate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ actions }),
            });
            if (res.ok) {
              clearGuestTitleActions();
            }
          } catch {
            /* silent — will retry next load */
          }
        }
        localStorage.setItem(TITLES_MIGRATED_KEY, "1");
      }

      // Clean up old guest tracking keys
      migrateGuestData();
    })();
  }, []);

  return null;
}
