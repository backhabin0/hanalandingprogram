"use client";

import { useRef, useState } from "react";
import { ImagePlaceholder } from "@/components/landing/ImagePlaceholder";

interface ImageActionResult {
  error: string | null;
  url?: string | null;
}

/**
 * One upload/replace/remove widget for a single-image slot (logo, hero,
 * product representative image, case image, OG image). Calls its bound
 * Server Actions directly as plain async functions — no `<form>` involved,
 * so this can be dropped inside another component's existing `<form>`
 * (e.g. one row of ProductsEditor's per-product form) without creating an
 * invalid nested `<form>`.
 */
export function ImageUploadField({
  label,
  hint,
  currentUrl,
  altText,
  ratio = "aspect-[4/3]",
  uploadAction,
  removeAction,
  onChange,
}: {
  label: string;
  hint?: string;
  currentUrl?: string | null;
  /** Alt text shown in the preview and used as the placeholder label. */
  altText: string;
  ratio?: string;
  uploadAction: (formData: FormData) => Promise<ImageActionResult>;
  removeAction: () => Promise<ImageActionResult>;
  /** Notified with the new URL (or null) after a successful upload/remove — lets a parent form field (e.g. SeoEditor's OG image URL text input) stay in sync. */
  onChange?: (url: string | null) => void;
}) {
  const [url, setUrl] = useState<string | null | undefined>(currentUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadAction(formData);
    setPending(false);
    if (inputRef.current) inputRef.current.value = "";
    if (result.error) {
      setError(result.error);
      return;
    }
    setUrl(result.url ?? null);
    onChange?.(result.url ?? null);
  }

  async function handleRemove() {
    setPending(true);
    setError(null);
    const result = await removeAction();
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setUrl(null);
    onChange?.(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>

      <ImagePlaceholder label={altText} src={url ?? undefined} ratio={ratio} className="max-w-xs" />

      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
          {url ? "이미지 교체" : "이미지 업로드"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={pending}
          />
        </label>
        {url && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending}
            className="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            삭제
          </button>
        )}
        {pending && <span className="text-xs text-slate-400">처리 중...</span>}
      </div>

      {error && (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
