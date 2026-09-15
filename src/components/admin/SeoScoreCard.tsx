import { FormSection } from "@/components/admin/FormField";
import type { SeoScoreResult } from "@/lib/seo/score";
import { cn } from "@/lib/utils";

export function SeoScoreCard({
  score,
  duplicateWarnings,
}: {
  score: SeoScoreResult;
  duplicateWarnings: string[];
}) {
  return (
    <FormSection
      title="검색 최적화 상태"
      description="검색엔진 순위를 보장하는 점수가 아니라, 페이지 콘텐츠 완성도를 확인하는 체크리스트입니다."
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold",
            score.displayScore >= 80
              ? "bg-emerald-100 text-emerald-700"
              : score.displayScore >= 50
                ? "bg-amber-100 text-amber-700"
                : "bg-rose-100 text-rose-700"
          )}
        >
          {score.displayScore}
        </div>
        <p className="text-sm text-slate-500">
          100점 만점 환산 점수입니다. 순위나 AI 추천 노출을 보장하지 않으며, 실제 콘텐츠 완성도를 스스로 점검하기 위한
          체크리스트입니다.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
        {score.items.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span className={item.points >= item.maxPoints ? "text-emerald-600" : "text-slate-300"}>
              {item.points >= item.maxPoints ? "✓" : item.points > 0 ? "△" : "○"}
            </span>
            <span className={item.points >= item.maxPoints ? "text-slate-700" : "text-slate-400"}>{item.label}</span>
          </li>
        ))}
      </ul>

      {score.suggestions.length > 0 && (
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">검색 경쟁력을 높이려면</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {score.suggestions.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
      )}

      {duplicateWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-700">콘텐츠 중복 경고</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {duplicateWarnings.map((w) => (
              <li key={w}>· {w}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-700">
            지역명만 바꾼 중복 페이지보다, 각 지역에 실제 서비스 정보·사례·FAQ를 작성하는 것을 권장합니다.
          </p>
        </div>
      )}
    </FormSection>
  );
}
