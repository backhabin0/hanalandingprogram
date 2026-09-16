"use client";

import { useRef, useState } from "react";
import { ImagePlaceholder } from "@/components/landing/ImagePlaceholder";
import { ReorderControls } from "@/components/admin/EditorControls";

interface GalleryImageLike {
  id: string;
  imageUrl: string;
  altText?: string;
  caption?: string;
  sortOrder: number;
  isActive?: boolean;
}

interface GalleryMetaPayload {
  id: string;
  altText: string;
  caption: string;
  isActive: boolean;
  sortOrder: number;
}

interface GalleryActionResult<T> {
  error: string | null;
  images?: T[];
}

interface GalleryDraft {
  id: string;
  imageUrl: string;
  altText: string;
  caption: string;
  isActive: boolean;
}

function toDraft(image: GalleryImageLike): GalleryDraft {
  return {
    id: image.id,
    imageUrl: image.imageUrl,
    altText: image.altText ?? "",
    caption: image.caption ?? "",
    isActive: image.isActive ?? true,
  };
}

/**
 * Reusable multi-image manager (product gallery, page gallery): add a new
 * image (uploads immediately), edit each image's alt/caption/visibility and
 * reorder them (batch-saved together, matching this app's other list
 * editors), and delete one image immediately.
 *
 * No `<form>` anywhere here — every action is a direct async call — so
 * there's no native form-reset to defend against; checkboxes here are
 * ordinary controlled React state.
 */
export function GalleryEditor<T extends GalleryImageLike>({
  images,
  fallbackAlt,
  addAction,
  saveAction,
  deleteAction,
  onImagesChange,
}: {
  images: T[];
  /** Shown as the placeholder/alt fallback when an image has no alt text yet. */
  fallbackAlt: string;
  addAction: (formData: FormData) => Promise<GalleryActionResult<T>>;
  saveAction: (images: GalleryMetaPayload[]) => Promise<GalleryActionResult<T>>;
  deleteAction: (imageId: string) => Promise<GalleryActionResult<T>>;
  onImagesChange?: (images: T[]) => void;
}) {
  const [drafts, setDrafts] = useState<GalleryDraft[]>(() => images.map(toDraft));
  const [pendingAdd, setPendingAdd] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Every action (add/save/delete) returns the server's authoritative full
  // list, but adding or deleting one image must not silently discard
  // not-yet-saved alt/caption/visibility edits the admin made to OTHER rows
  // in the same list — merge by id instead of replacing wholesale.
  function applyFresh(fresh: T[] | undefined) {
    if (!fresh) return;
    setDrafts((prevDrafts) => {
      const prevById = new Map(prevDrafts.map((d) => [d.id, d]));
      return fresh.map((image) => prevById.get(image.id) ?? toDraft(image));
    });
    onImagesChange?.(fresh);
  }

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAdd(true);
    setError(null);
    setSaved(false);
    const formData = new FormData();
    formData.set("file", file);
    const result = await addAction(formData);
    setPendingAdd(false);
    if (inputRef.current) inputRef.current.value = "";
    if (result.error) {
      setError(result.error);
      return;
    }
    applyFresh(result.images);
  }

  function updateDraft(id: string, patch: Partial<GalleryDraft>) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function moveDraft(index: number, direction: -1 | 1) {
    setDrafts((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setPendingSave(true);
    setError(null);
    setSaved(false);
    const payload: GalleryMetaPayload[] = drafts.map((d, index) => ({
      id: d.id,
      altText: d.altText,
      caption: d.caption,
      isActive: d.isActive,
      sortOrder: index,
    }));
    const result = await saveAction(payload);
    setPendingSave(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    applyFresh(result.images);
    setSaved(true);
  }

  async function handleDelete(id: string) {
    setPendingDeleteId(id);
    setError(null);
    setSaved(false);
    const result = await deleteAction(id);
    setPendingDeleteId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    applyFresh(result.images);
  }

  return (
    <div className="space-y-3">
      {drafts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {drafts.map((draft, index) => (
            <div key={draft.id} className="space-y-1.5 rounded-lg border border-slate-200 p-2">
              <ImagePlaceholder label={draft.altText || fallbackAlt} src={draft.imageUrl} ratio="aspect-square" />
              <input
                value={draft.altText}
                onChange={(e) => updateDraft(draft.id, { altText: e.target.value })}
                placeholder={`대체 텍스트 (예: ${fallbackAlt})`}
                className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
              />
              <input
                value={draft.caption}
                onChange={(e) => updateDraft(draft.id, { caption: e.target.value })}
                placeholder="캡션 (선택)"
                className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
              />
              <div className="flex items-center justify-between gap-1">
                <label className="flex items-center gap-1 text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) => updateDraft(draft.id, { isActive: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  노출
                </label>
                <div className="flex items-center gap-1">
                  <ReorderControls
                    onMoveUp={() => moveDraft(index, -1)}
                    onMoveDown={() => moveDraft(index, 1)}
                    disableUp={index === 0}
                    disableDown={index === drafts.length - 1}
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(draft.id)}
                    disabled={pendingDeleteId === draft.id}
                    className="text-[11px] font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-600">
          + 이미지 추가
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAdd}
            disabled={pendingAdd}
          />
        </label>
        {pendingAdd && <span className="text-xs text-slate-400">업로드 중...</span>}
        {drafts.length > 0 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={pendingSave}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingSave ? "저장 중..." : "갤러리 정보 저장"}
          </button>
        )}
        {saved && !pendingSave && <span className="text-xs text-emerald-600">저장되었습니다.</span>}
      </div>

      {error && (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
