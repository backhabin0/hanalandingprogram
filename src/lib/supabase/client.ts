"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/** Browser-side Supabase client. Uses the public anon key only. */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseEnv.url, supabaseEnv.anonKey);
}
