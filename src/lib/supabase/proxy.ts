import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * A third cookie adapter, distinct from client.ts (browser) and server.ts
 * (Server Components/Actions via next/headers `cookies()`). Proxy runs
 * outside the render pipeline against `NextRequest`/`NextResponse` directly,
 * which next/headers can't touch — so it needs its own adapter bound to the
 * request/response pair rather than reusing either of the other two. This
 * is the standard three-client shape for @supabase/ssr on Next.js, not
 * incidental duplication.
 *
 * Refreshes the auth session cookie on matched requests (see src/proxy.ts
 * for the matcher). This is a fast refresh only, not an access-control
 * check — real gating happens in requireUser() (src/lib/auth.ts), called
 * from each protected layout/Server Action.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() (not getSession()) so an expired/rotated token is caught and
  // refreshed here, ahead of the authoritative check in requireUser().
  await supabase.auth.getUser();

  return response;
}
