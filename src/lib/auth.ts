import type { NextRequest } from "next/server";
import { createSupabaseServer } from "./supabase-server";

export async function getUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * For Watch Together routes: accepts either an authenticated Supabase user
 * or a client-generated UUID sent as the X-WT-Guest-ID header.
 * Returns the user/guest ID, or null if neither is present.
 */
export async function getWtUserId(req: NextRequest): Promise<string | null> {
  const user = await getUser();
  if (user) return user.id;
  const guestId = req.headers.get("x-wt-guest-id");
  if (guestId && UUID_RE.test(guestId)) return guestId;
  return null;
}
