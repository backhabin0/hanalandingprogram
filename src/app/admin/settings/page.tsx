import { PageHeader } from "@/components/admin/PageHeader";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input } from "@/components/admin/FormControls";
import { Card } from "@/components/admin/Card";

const INTEGRATIONS = [
  { name: "Supabase Database", description: "랜딩페이지·상담 데이터 저장", status: "연결 전" },
  { name: "Supabase Auth", description: "관리자 로그인 및 권한 관리", status: "연결 전" },
  { name: "Supabase Storage", description: "이미지/파일 업로드", status: "연결 전" },
  { name: "Vercel", description: "배포 및 도메인 관리", status: "연결 전" },
  { name: "Resend", description: "상담 접수 이메일 알림", status: "연결 전" },
];

export default function AdminSettingsPage() {
  return (
    <div>
      <PageHeader title="설정" description="계정 및 서비스 연동 설정입니다. 현재는 UI만 제공됩니다." />

      <div className="space-y-6">
        <FormSection title="계정 정보" description="로그인 연동 전에는 임시 관리자 계정으로 표시됩니다.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="이름">
              <Input defaultValue="관리자" disabled />
            </FormField>
            <FormField label="이메일" hint="Supabase Auth 연동 후 실제 계정 정보로 대체됩니다.">
              <Input defaultValue="admin@example.com" disabled />
            </FormField>
          </div>
        </FormSection>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">연동 예정 서비스</h2>
          <p className="mt-1 text-sm text-slate-500">2단계 이후 순차적으로 연결될 외부 서비스입니다.</p>
          <ul className="mt-5 divide-y divide-slate-100">
            {INTEGRATIONS.map((integration) => (
              <li key={integration.name} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-900">{integration.name}</p>
                  <p className="text-xs text-slate-400">{integration.description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-500/10">
                  {integration.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
