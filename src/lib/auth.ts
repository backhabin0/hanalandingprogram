import { redirect } from "next/navigation";
import type { AuthUser as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns the current authenticated user, or `null`. Never redirects — use
 * this where "logged in or not" is just a branch (e.g. the /login page
 * deciding whether to redirect to /admin).
 *
 * Uses `auth.getUser()`, not `auth.getSession()`: getUser() revalidates the
 * token against the Supabase Auth server instead of only trusting whatever
 * is in the (possibly stale/forged) session cookie.
 */
export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Requires an authenticated user for the current request; redirects to
 * /login if there isn't one. Call this at the top of every admin-only
 * Server Component, layout, or Server Action.
 *
 * `src/proxy.ts` only refreshes the session cookie on the way in — it is
 * not the access-control gate. This function is the actual gate, and it
 * must be called by every protected entry point individually, not assumed
 * from the proxy having run.
 */
export async function requireUser(): Promise<SupabaseUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
