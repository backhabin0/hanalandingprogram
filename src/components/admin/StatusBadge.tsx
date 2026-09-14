import { cn } from "@/lib/utils";
import type { ConsultationStatus, LandingPageStatus } from "@/types/landing";

const PAGE_STATUS_LABEL: Record<LandingPageStatus, string> = {
  public: "공개",
  private: "비공개",
};

const PAGE_STATUS_TONE: Record<LandingPageStatus, string> = {
  public: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  private: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const CONSULTATION_STATUS_LABEL: Record<ConsultationStatus, string> = {
  new: "신규",
  contacted: "연락완료",
  closed: "종료",
};

const CONSULTATION_STATUS_TONE: Record<ConsultationStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-600/20",
  contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  closed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        className
      )}
    >
      {label}
    </span>
  );
}

export function PageStatusBadge({ status }: { status: LandingPageStatus }) {
  return <Badge label={PAGE_STATUS_LABEL[status]} className={PAGE_STATUS_TONE[status]} />;
}

export function ConsultationStatusBadge({ status }: { status: ConsultationStatus }) {
  return (
    <Badge label={CONSULTATION_STATUS_LABEL[status]} className={CONSULTATION_STATUS_TONE[status]} />
  );
}
