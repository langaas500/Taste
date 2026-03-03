/** Generate a 7-char alphanumeric code (no ambiguous chars). */
export function generateGroupCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}
