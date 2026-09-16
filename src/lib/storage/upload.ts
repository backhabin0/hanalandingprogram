import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { LANDING_ASSETS_BUCKET } from "./paths";
import { validateImageFile, type ImageSlot } from "./validate";

type AnySupabaseClient = SupabaseClient<Database>;

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Validates and uploads one image file to a caller-chosen path, returning
 * its public URL. Never overwrites an existing object at that path
 * (`upsert: false`) — every path already ends in a fresh UUID, so a
 * collision would only ever mean something is wrong.
 */
export async function uploadImageObject(
  supabase: AnySupabaseClient,
  slot: ImageSlot,
  file: File | null,
  buildPath: (extension: string) => string
): Promise<{ ok: true; result: UploadedImage } | { ok: false; error: string }> {
  const validated = await validateImageFile(file, slot);
  if (!validated.ok) return { ok: false, error: validated.error };

  const path = buildPath(validated.image.extension);

  const { error: uploadError } = await supabase.storage
    .from(LANDING_ASSETS_BUCKET)
    .upload(path, validated.image.bytes, { contentType: validated.image.mime, upsert: false });

  if (uploadError) {
    console.error("[storage/upload] upload failed:", uploadError.message);
    return { ok: false, error: "이미지 업로드 중 문제가 발생했습니다." };
  }

  const { data } = supabase.storage.from(LANDING_ASSETS_BUCKET).getPublicUrl(path);
  return { ok: true, result: { url: data.publicUrl, path } };
}
