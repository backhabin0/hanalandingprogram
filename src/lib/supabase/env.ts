/**
 * Reads Supabase env vars lazily (via getters) so importing this module never
 * throws. The error only fires when a client is actually constructed at
 * runtime — meaning `next build` stays green even with no `.env.local`,
 * since Stage 2 wires no route that calls these at build time.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.local.example to .env.local and fill in your Supabase project's URL and anon key.`
    );
  }
  return value;
}

export const supabaseEnv = {
  get url(): string {
    return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  },
  get anonKey(): string {
    return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
};
