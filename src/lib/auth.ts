import type { NextRequest } from "next/server";
import { createSupabaseServer } from "./supabase-server";
import { parseGuestToken } from "./guest-token";

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
 * For Watch Together / Group routes: accepts either an authenticated Supabase user
 * or a guest identity via the X-WT-Guest-ID header.
 * Guest header is first tried as a signed guest token (parseGuestToken),
 * then falls back to a raw UUID check.
 * Returns the user/guest ID, or null if neither is present.
 */
export async function getWtUserId(req: NextRequest): Promise<string | null> {
  const user = await getUser();
  if (user) return user.id;
  const header = req.headers.get("x-wt-guest-id");
  if (!header) return null;
  const parsed = parseGuestToken(header);
  if (parsed) return parsed.guestId;
  if (UUID_RE.test(header)) return header;
  return null;
}
