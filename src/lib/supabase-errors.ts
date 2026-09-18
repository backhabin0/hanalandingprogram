import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Maps a Postgres/PostgREST error to a safe, generic Korean message.
 * Never surface `error.message`/`error.details` to the client — those can
 * contain raw column/constraint names.
 */
export function mapSupabaseError(error: PostgrestError): string {
  if (error.code === "23505") return "이미 사용 중인 값입니다.";
  if (error.code === "23503") return "연결된 데이터를 찾을 수 없습니다.";
  if (error.code === "42501") return "저장 권한을 확인해주세요.";
  return "저장 중 문제가 발생했습니다.";
}

/**
 * Shown when a save action's DB mutation throws instead of returning a
 * normal PostgrestError `{ error }` — a network/timeout/transport failure,
 * not something Postgres itself rejected. supabase-js only returns
 * `{ error }` for a query Postgres/PostgREST rejected; a transport-level
 * failure throws instead, and left uncaught that crashes the whole Server
 * Action, which Next.js turns into an opaque 500/503 with no `state.error`
 * for the client to show (see Stage 12 report: this is how "저장되었습니다"
 * was seen rendering even though a save never reached the database). Every
 * admin save action's DB-mutation block must be wrapped in try/catch and
 * fall back to this exact message on the catch branch — never raw
 * `err.message`, SQL, or a stack trace.
 */
export const SAFE_SAVE_ERROR_MESSAGE = "저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

/**
 * Logs enough to diagnose an unexpected (uncaught) save failure server-side
 * without leaking PII, request payloads, or stack traces into the log.
 */
export function logUnexpectedSaveError(scope: string, err: unknown): void {
  console.error(`[${scope}] unexpected error:`, err instanceof Error ? err.message : "unknown");
}
