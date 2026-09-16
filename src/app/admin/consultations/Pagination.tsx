import Link from "next/link";
import { cn } from "@/lib/utils";

/** Preserves every existing query param (q/status/inquiryType/landingPageId, ...) except `page`. */
function pageHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  search.set("page", String(page));
  return `/admin/consultations?${search.toString()}`;
}

export function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const linkClass = (disabled: boolean) =>
    cn(
      "rounded-md px-3 py-1.5 text-xs font-medium",
      disabled ? "cursor-not-allowed text-slate-300" : "text-slate-600 hover:bg-slate-100"
    );

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5">
      <p className="text-xs text-slate-500">
        {page} / {totalPages} 페이지
      </p>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link href={pageHref(params, page - 1)} className={linkClass(false)}>
            이전
          </Link>
        ) : (
          <span className={linkClass(true)}>이전</span>
        )}
        {page < totalPages ? (
          <Link href={pageHref(params, page + 1)} className={linkClass(false)}>
            다음
          </Link>
        ) : (
          <span className={linkClass(true)}>다음</span>
        )}
      </div>
    </div>
  );
}
