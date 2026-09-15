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
