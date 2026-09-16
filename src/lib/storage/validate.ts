/**
 * Upload-time image validation shared by every image slot (logo, hero,
 * product, case, gallery, OG). Never trusts `File.type` or the filename
 * extension alone — both are trivially spoofable (rename a `.txt` to
 * `.jpg`) — so the actual bytes are sniffed for a known magic number.
 *
 * SVG is deliberately never in `ALLOWED_IMAGE_TYPES`: an uploaded SVG can
 * embed `<script>`/event-handler XSS that runs when served back with an
 * image content-type in some browsers/contexts — out of scope to sanitize
 * safely in this stage, so it's simply not accepted.
 */

export type ImageMimeType = "image/jpeg" | "image/png" | "image/webp";

interface ImageTypeInfo {
  mime: ImageMimeType;
  extension: string;
}

/** Named upload slots, each with its own recommended-and-enforced size ceiling. */
export const IMAGE_SLOT_MAX_BYTES = {
  logo: 3 * 1024 * 1024,
  hero: 10 * 1024 * 1024,
  product: 10 * 1024 * 1024,
  case: 10 * 1024 * 1024,
  gallery: 10 * 1024 * 1024,
  og: 5 * 1024 * 1024,
} as const;

export type ImageSlot = keyof typeof IMAGE_SLOT_MAX_BYTES;

function matchesMagicBytes(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (bytes[offset + i] !== signature[i]) return false;
  }
  return true;
}

/**
 * Sniffs the real image type from file bytes. Returns null for anything
 * that isn't recognizably JPEG, PNG, or WebP — including SVG, PDF, or a
 * renamed non-image file.
 */
export function sniffImageType(bytes: Uint8Array): ImageTypeInfo | null {
  if (matchesMagicBytes(bytes, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (matchesMagicBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", extension: "png" };
  }
  // WebP: "RIFF" .... "WEBP" at bytes 0-3 and 8-11 (bytes 4-7 are the file size).
  if (
    matchesMagicBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    matchesMagicBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return { mime: "image/webp", extension: "webp" };
  }
  return null;
}

export interface ValidatedImage {
  bytes: Uint8Array;
  mime: ImageMimeType;
  extension: string;
}

/**
 * Reads and validates an uploaded file for a given slot. Returns a plain
 * result object (never throws) so every caller can turn it into the same
 * kind of `{ error }` response the rest of this app's Server Actions use.
 */
export async function validateImageFile(
  file: File | null,
  slot: ImageSlot
): Promise<{ ok: true; image: ValidatedImage } | { ok: false; error: string }> {
  if (!file || file.size === 0) {
    return { ok: false, error: "이미지 파일을 선택해주세요." };
  }

  const maxBytes = IMAGE_SLOT_MAX_BYTES[slot];
  if (file.size > maxBytes) {
    return { ok: false, error: `파일 크기는 ${Math.floor(maxBytes / (1024 * 1024))}MB 이하여야 합니다.` };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);
  if (!sniffed) {
    return { ok: false, error: "JPEG, PNG, WebP 형식의 이미지만 업로드할 수 있습니다." };
  }

  return { ok: true, image: { bytes, mime: sniffed.mime, extension: sniffed.extension } };
}
