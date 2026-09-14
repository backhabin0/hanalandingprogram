import { PageHeader } from "@/components/admin/PageHeader";
import { LandingPageForm } from "@/components/admin/LandingPageForm";
import { createLandingPageAction } from "../actions";

export default function NewLandingPagePage() {
  return (
    <div>
      <PageHeader title="새 랜딩페이지 만들기" description="정보를 입력해 랜딩페이지를 생성하세요." />
      <LandingPageForm mode="create" action={createLandingPageAction} />
    </div>
  );
}
