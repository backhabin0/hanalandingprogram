import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 file convention (replaces middleware.ts) — must live at
 * `src/proxy.ts`, the same level as `src/app`.
 *
 * Scoped to only the routes that read auth state (/admin/*, /login) so
 * public/static routes (/, /preview/*) never pay for a Supabase round trip
 * or lose their static rendering.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
