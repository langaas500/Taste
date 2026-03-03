import { createHmac, timingSafeEqual, randomUUID } from "crypto";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSecret(): string {
  return process.env.GUEST_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function hmacSign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/**
 * Generate an HMAC-SHA256 signed guest token binding guestId + sessionId + timestamp.
 * The guestId is the caller's existing UUID (client-generated or server-generated).
 */
export function generateGuestToken(guestId: string, sessionId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${guestId}.${sessionId}.${timestamp}`;
  const signature = hmacSign(payload);
  return `${payload}.${signature}`;
}

/**
 * Parse and verify a signed guest token (signature check only, no session binding check).
 * Returns { guestId, sessionId } if valid, null otherwise.
 */
export function parseGuestToken(token: string): { guestId: string; sessionId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [guestId, sessionId, timestamp, signature] = parts;
  if (!UUID_RE.test(guestId)) return null;
  if (!timestamp || !/^\d+$/.test(timestamp)) return null;

  const payload = `${guestId}.${sessionId}.${timestamp}`;
  const expected = hmacSign(payload);

  if (signature.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  return { guestId, sessionId };
}

/**
 * Verify a signed guest token AND check that it is bound to the given sessionId.
 * Returns { guestId } if valid and bound, null otherwise.
 */
export function verifyGuestToken(
  token: string,
  sessionId: string
): { guestId: string } | null {
  const parsed = parseGuestToken(token);
  if (!parsed) return null;
  if (parsed.sessionId !== sessionId) return null;
  return { guestId: parsed.guestId };
}
