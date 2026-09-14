import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * Server-side Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Uses the public anon key — reads are governed by RLS
 * policies (see the migration file), not by an elevated service_role key.
 *
 * No session/auth wiring yet (Stage 3). The cookie adapter is included now
 * so this client keeps working unchanged once Supabase Auth is added.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component that can't mutate cookies (e.g.
          // during static rendering). Safe to ignore until Stage 3 adds
          // middleware to refresh the session on every request.
        }
      },
    },
  });
}
