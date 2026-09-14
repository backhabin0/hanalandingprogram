/** Minimal single-series bar trend — one hue, baseline-anchored, rounded tops. */
export function BarTrend({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex h-40 items-end gap-3">
      {data.map((point) => {
        const heightPct = Math.max((point.value / max) * 100, 4);
        return (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end justify-center">
              <div
                className="w-full max-w-8 rounded-t bg-blue-500/80 transition-colors hover:bg-blue-600"
                style={{ height: `${heightPct}%` }}
                title={`${point.label}: ${point.value.toLocaleString()}회`}
              />
            </div>
            <span className="text-xs font-medium text-slate-500">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
