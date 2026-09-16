import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { getConsultationRequestById } from "@/lib/consultation-admin";
import { INQUIRY_TYPE_LABEL, PREFERRED_CONTACT_LABEL } from "@/lib/consultation-requests";
import { StatusSelect } from "../StatusSelect";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export default async function AdminConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const consultation = await getConsultationRequestById(id);

  if (!consultation) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`${consultation.name}님의 문의`}
        description={formatDateTime(consultation.createdAt)}
        actions={
          <Link href="/admin/consultations" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            ← 목록으로
          </Link>
        }
      />

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">상태</h2>
          <StatusSelect id={consultation.id} status={consultation.status} />
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <Field label="접수시간">{formatDateTime(consultation.createdAt)}</Field>
          <Field label="업체명">
            {consultation.businessName ? (
              <>
                {consultation.businessName}{" "}
                {consultation.slug && <span className="text-slate-400">(/{consultation.slug})</span>}
              </>
            ) : (
              <span className="text-slate-400">삭제된 페이지</span>
            )}
          </Field>
          <Field label="문의 유형">{INQUIRY_TYPE_LABEL[consultation.inquiryType]}</Field>
          <Field label="제품/서비스">
            {consultation.productId ? (consultation.productName ?? <span className="text-slate-400">삭제된 제품/서비스</span>) : "전체 상담"}
          </Field>
          <Field label="이름">{consultation.name}</Field>
          <Field label="전화번호">
            <a href={`tel:${consultation.phone}`} className="text-blue-600 hover:underline">
              {consultation.phone}
            </a>
          </Field>
          <Field label="이메일">
            {consultation.email ? (
              <a href={`mailto:${consultation.email}`} className="text-blue-600 hover:underline">
                {consultation.email}
              </a>
            ) : (
              "-"
            )}
          </Field>
          <Field label="회사명">{consultation.companyName ?? "-"}</Field>
          <Field label="선호 연락 방법">
            {consultation.preferredContact ? PREFERRED_CONTACT_LABEL[consultation.preferredContact] : "상관없음"}
          </Field>
        </dl>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">문의 내용</dt>
          <dd className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-900">
            {consultation.message || <span className="text-slate-400">문의 내용 없음</span>}
          </dd>
        </div>
      </Card>
    </div>
  );
}
