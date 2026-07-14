// Demo-grade password hashing only — client-side SHA-256 with no salt.
// This is NOT secure storage and must not be relied on for real credentials.
// It exists purely so the mock AuthRepository has a plausible-looking
// implementation; real auth arrives with the Supabase swap.
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
