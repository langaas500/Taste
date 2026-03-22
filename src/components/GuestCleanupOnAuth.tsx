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

      // Migrate guest title actions + Se Sammen swipes to user account (once)
      if (!localStorage.getItem(TITLES_MIGRATED_KEY)) {
        const actions = readGuestTitleActions();
        const wtGuestId = localStorage.getItem("wt_guest_id") || "";
        if (actions.length > 0 || wtGuestId) {
          try {
            const res = await fetch("/api/guest/migrate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ actions, wt_guest_id: wtGuestId }),
            });
            if (res.ok) {
              clearGuestTitleActions();
              if (wtGuestId) localStorage.removeItem("wt_guest_id");
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
