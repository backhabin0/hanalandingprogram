import type {
  ConsultationRequest,
  LandingPage,
  TemplateMeta,
} from "@/types/landing";

/**
 * All data in this file is mock/UI-preview data only. Nothing here is
 * fetched from or written to a database — Stage 1 has no persistence layer.
 * The shapes mirror the future Supabase schema so swapping this module for
 * real queries later should not require touching component code.
 */

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const templates: TemplateMeta[] = [
  {
    id: "template-a",
    name: "기업 서비스형",
    nameEn: "Corporate Service",
    purpose: "설치·컨설팅·전문 서비스·B2B 기술기업을 위한 신뢰 중심 템플릿",
    description:
      "실적 지표와 도입 프로세스를 앞세워 신뢰를 쌓고, 견적/상담 전환으로 이어지는 구조입니다. 기술기업, 설치·시공업, 컨설팅사에 적합합니다.",
    recommendedFor: ["보안/설치 전문기업", "IT 컨설팅", "기술 스타트업", "B2B 솔루션 기업"],
    keySections: [
      "Header",
      "Hero",
      "실적 / 신뢰 지표",
      "서비스 상세 안내",
      "핵심 특징",
      "도입 프로세스",
      "가격 / 견적 안내",
      "FAQ",
      "상담 신청 폼",
      "회사 정보 / Footer",
    ],
    visualDirection: "화이트 & 블루 톤의 전문적이고 신뢰감 있는 B2B 스타일",
    accentColor: "blue",
  },
  {
    id: "template-b",
    name: "제품 판매형",
    nameEn: "Product Showcase",
    purpose: "제품·장비·패키지·솔루션의 판매/렌탈에 최적화된 다크 톤 제품 중심 템플릿",
    description:
      "제품 이미지와 가격을 중심에 두고, 사양표와 옵션 비교로 구매 결정을 돕는 구조입니다. 장비 제조사, 판매몰, 렌탈 서비스에 적합합니다.",
    recommendedFor: ["장비/하드웨어 판매", "패키지 상품", "렌탈 서비스", "솔루션 제조사"],
    keySections: [
      "Header",
      "제품 Hero",
      "제품 상세 설명",
      "핵심 장점",
      "제품 사양표",
      "가격 / 옵션 비교",
      "FAQ",
      "문의하기",
      "회사 정보 / Footer",
    ],
    visualDirection: "다크 배경 + 강조 컬러로 제품과 가격을 부각하는 스타일",
    accentColor: "amber",
  },
  {
    id: "template-c",
    name: "지역 서비스 상담전환형",
    nameEn: "Local Consultation",
    purpose:
      "병원·헬스장·미용·학원·청소 등 지역 기반 서비스업의 상담 전환에 최적화된 웜톤 템플릿",
    description:
      "서비스 소개와 위치 정보를 명확히 전달하고, 부담 없는 상담 신청으로 자연스럽게 유도하는 구조입니다. 지역 밀착형 업체에 적합합니다.",
    recommendedFor: ["병원/의원", "헬스장/필라테스", "미용/뷰티", "학원/교육", "생활 서비스"],
    keySections: [
      "Header",
      "Hero",
      "서비스 소개",
      "이용 혜택",
      "가격 안내",
      "위치 안내",
      "FAQ",
      "상담 신청",
      "회사 정보 / Footer",
    ],
    visualDirection: "따뜻한 뉴트럴 톤과 사람 중심의 상담 전환 강조 스타일",
    accentColor: "orange",
  },
];

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return templates.find((t) => t.id === id);
}

// ---------------------------------------------------------------------------
// Full mock landing pages (used both by /admin/pages and /preview/* demos)
// ---------------------------------------------------------------------------

const techSecurity: LandingPage = {
  id: "page-001",
  businessName: "테크시큐리티",
  title: "테크시큐리티 | 기업용 CCTV 설치 및 통합 보안 솔루션",
  slug: "cctv-company",
  template: "template-a",
  status: "public",
  heroTitle: "기업용 CCTV 설치와 통합 보안, 한 번에 맡기세요",
  heroDescription:
    "설계부터 시공, 유지보수까지 — 15년 경력의 보안 전문 엔지니어가 매장, 사옥, 물류센터에 최적화된 보안 시스템을 구축합니다.",
  description:
    "테크시큐리티는 2009년 설립 이후 전국 350여 고객사에 CCTV·출입통제·통합 보안 시스템을 공급해 온 기업용 보안 전문기업입니다. 단순 장비 설치가 아니라 현장 실측과 위험 분석을 기반으로 설계하고, 설치 이후에도 24시간 원격 모니터링과 정기 점검으로 시스템을 관리합니다. 제조사에 종속되지 않는 독립 설계로 고객사의 예산과 환경에 맞는 최적의 구성을 제안합니다.",
  phone: "1588-0000",
  kakaoUrl: "https://pf.kakao.com/_techsecurity",
  address: "서울특별시 강남구 테헤란로 123, 4층",
  region: "서울 강남구",
  industry: "CCTV 설치 및 통합 보안 솔루션",
  representativePrice: {
    label: "대표 설치 비용",
    price: "158만원부터",
    description:
      "설치 환경(카메라 수량, 배선 거리, 저장 장치 사양)에 따라 정확한 견적이 달라집니다. 현장 실측 후 정식 견적서를 제공합니다.",
  },
  products: [
    {
      id: "prod-a1",
      name: "4K CCTV 설치",
      shortDescription: "실내외 전 구역을 선명하게 기록하는 4K UHD 카메라 설치",
      description:
        "매장 입구부터 창고, 주차장까지 사각지대 없이 커버하는 4K UHD 카메라를 현장에 맞게 배치합니다. 야간에도 색상을 유지하는 컬러 나이트비전과 IP67 방수 설계로 실외 환경에서도 안정적으로 작동하며, 배선 경로와 저장 장치 위치까지 사전 실측을 거쳐 시공 후 재작업이 없도록 설계합니다.",
      price: "158만원",
      priceUnit: "부터",
      priceNote: "카메라 4대 기준, 배선 거리에 따라 변동",
      ctaText: "무료 견적 받기",
      sortOrder: 1,
    },
    {
      id: "prod-a2",
      name: "AI 지능형 분석",
      shortDescription: "사람·차량을 구분하고 이상 상황을 자동 감지하는 AI 영상 분석",
      description:
        "단순 녹화를 넘어 사람과 차량, 정지된 물체를 자동으로 구분하고 무단 침입이나 배회 등 이상 행동이 감지되면 즉시 담당자에게 알림을 전송합니다. 오탐을 줄이기 위해 설치 초기 2주간 현장 환경에 맞춘 학습 기간을 거칩니다.",
      price: "월 3.9만원",
      priceUnit: "카메라 1대 기준",
      priceNote: "6개월 이상 약정 시 할인 적용",
      ctaText: "도입 문의하기",
      sortOrder: 2,
    },
    {
      id: "prod-a3",
      name: "원격 모니터링",
      shortDescription: "스마트폰과 PC에서 실시간으로 현장을 확인하는 원격 관제 서비스",
      description:
        "전용 앱과 웹 대시보드를 통해 언제 어디서든 매장·사업장 현황을 실시간으로 확인할 수 있습니다. 다중 지점을 운영하는 경우 하나의 계정으로 전 지점을 통합 관제할 수 있으며, 이상 감지 알림은 즉시 담당자 휴대폰으로 전달됩니다.",
      price: "월 1.5만원",
      priceUnit: "지점당",
      ctaText: "서비스 상세보기",
      sortOrder: 3,
    },
    {
      id: "prod-a4",
      name: "출입통제 시스템",
      shortDescription: "카드·안면인식 기반으로 인가된 인원만 출입을 허용하는 통합 출입관리",
      description:
        "사원증 카드, 비밀번호, 안면인식 중 사업장에 맞는 방식으로 출입을 통제하고 모든 출입 기록을 자동으로 로그로 남깁니다. CCTV 시스템과 연동해 출입 이벤트 발생 시점의 영상을 자동으로 매칭해 보여줍니다.",
      price: "별도 견적",
      priceNote: "출입문 수량과 인증 방식에 따라 산정",
      ctaText: "상담 신청하기",
      sortOrder: 4,
    },
  ],
  features: [
    {
      id: "feat-a1",
      title: "4K UHD 화질",
      description: "번호판, 얼굴까지 선명하게 남는 고해상도 촬영으로 사고 발생 시 확실한 증거를 확보합니다.",
      icon: "🎥",
      sortOrder: 1,
    },
    {
      id: "feat-a2",
      title: "AI 객체 감지",
      description: "사람과 차량, 이상 행동을 자동으로 구분해 불필요한 알림 없이 필요한 순간만 안내합니다.",
      icon: "🤖",
      sortOrder: 2,
    },
    {
      id: "feat-a3",
      title: "24시간 모니터링",
      description: "관제 전담팀이 24시간 시스템 상태를 점검하여 장애를 사전에 예방합니다.",
      icon: "🕐",
      sortOrder: 3,
    },
    {
      id: "feat-a4",
      title: "4시간 출동 SLA",
      description: "장애 접수 후 평균 4시간 이내 현장 출동을 보장하는 전국 엔지니어 네트워크를 운영합니다.",
      icon: "🚐",
      sortOrder: 4,
    },
  ],
  metrics: [
    { id: "metric-a1", label: "누적 설치 건수", value: "1,200+", description: "전국 매장·사옥·물류센터" },
    { id: "metric-a2", label: "고객사", value: "350+", description: "제조·유통·의료·교육 전 업종" },
    { id: "metric-a3", label: "업력", value: "15년", description: "2009년 설립" },
    { id: "metric-a4", label: "장애 대응", value: "24시간", description: "전담 관제팀 상시 운영" },
  ],
  specifications: [
    { id: "spec-a1", key: "카메라 해상도", value: "4K UHD (800만 화소)", groupName: "표준 사양", sortOrder: 1 },
    { id: "spec-a2", key: "저장 기간", value: "최대 30일 (연장 가능)", groupName: "표준 사양", sortOrder: 2 },
    { id: "spec-a3", key: "방수 등급", value: "IP67 (실외용)", groupName: "표준 사양", sortOrder: 3 },
    { id: "spec-a4", key: "출동 대응", value: "접수 후 평균 4시간", groupName: "표준 사양", sortOrder: 4 },
  ],
  faqs: [
    {
      id: "faq-a1",
      question: "CCTV 설치 비용은 얼마인가요?",
      answer:
        "카메라 대수, 배선 거리, 저장 장치 용량에 따라 달라지며 기본 구성은 158만원부터 시작합니다. 정확한 비용은 무료 현장 실측 후 견적서로 안내드립니다.",
      sortOrder: 1,
    },
    {
      id: "faq-a2",
      question: "설치에는 얼마나 걸리나요?",
      answer:
        "일반 매장 기준 카메라 4~6대 설치는 하루 안에 완료됩니다. 규모가 크거나 배선 공사가 필요한 현장은 사전 실측 시 예상 소요 기간을 안내해 드립니다.",
      sortOrder: 2,
    },
    {
      id: "faq-a3",
      question: "유지보수도 가능한가요?",
      answer:
        "네, 설치 이후 정기 점검과 장애 출동 서비스를 함께 제공합니다. 장애 접수 후 평균 4시간 이내 전국 엔지니어가 출동합니다.",
      sortOrder: 3,
    },
    {
      id: "faq-a4",
      question: "기존 CCTV를 유지하면서 일부만 추가할 수 있나요?",
      answer:
        "가능합니다. 기존 장비의 제조사와 상태를 확인한 뒤, 호환 가능한 범위에서 신규 카메라를 추가하거나 노후 장비만 선택적으로 교체하는 방식도 상담해 드립니다.",
      sortOrder: 4,
    },
  ],
  processSteps: [
    { id: "step-a1", step: 1, title: "무료 상담 및 현장 실측", description: "전화 또는 온라인 상담 후 담당 엔지니어가 현장을 방문해 환경을 실측합니다." },
    { id: "step-a2", step: 2, title: "맞춤 설계 및 견적", description: "실측 결과를 바탕으로 카메라 배치와 배선 경로를 설계하고 정식 견적서를 제공합니다." },
    { id: "step-a3", step: 3, title: "전문 인력 시공", description: "숙련된 시공팀이 사업장 운영에 지장이 없도록 당일 또는 야간 시공을 진행합니다." },
    { id: "step-a4", step: 4, title: "사후 점검 및 유지보수", description: "설치 후 정기 점검과 24시간 장애 대응 서비스로 시스템을 지속적으로 관리합니다." },
  ],
  trustBadges: [
    "ISO 27001 정보보호 인증",
    "10년 연속 산업재해 0건",
    "공공기관 납품 실적 보유",
    "전국 출동 엔지니어 네트워크",
  ],
  companyInfo: {
    representative: "김보안",
    businessRegistrationNumber: "123-45-67890",
    establishedYear: "2009",
    address: "서울특별시 강남구 테헤란로 123, 4층",
    email: "contact@techsecurity.example.com",
  },
  seo: {
    metaTitle: "테크시큐리티 | 기업용 CCTV 설치 및 통합 보안 솔루션",
    metaDescription:
      "15년 경력의 보안 전문기업 테크시큐리티. 4K CCTV 설치, AI 영상 분석, 원격 모니터링, 출입통제까지 기업용 보안 시스템을 설계·시공·유지보수합니다.",
    keywords: ["CCTV 설치", "기업 보안", "출입통제", "AI 영상분석", "강남 CCTV"],
  },
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-09-10T09:00:00.000Z",
};

const visionGuardStore: LandingPage = {
  id: "page-002",
  businessName: "비전가드 스토어",
  title: "비전가드 스토어 | 홈·소상공인 CCTV 세트 전문 쇼핑몰",
  slug: "visionguard-store",
  template: "template-b",
  status: "public",
  heroTitle: "설치까지 끝난 CCTV 세트, 박스만 열면 바로 시작",
  heroDescription:
    "카메라, 녹화장치, 설치 부품이 모두 포함된 올인원 패키지. 매장, 사무실, 원룸까지 목적에 맞는 구성으로 지금 바로 주문하세요.",
  description:
    "비전가드 스토어는 소상공인과 1인 가구를 위한 CCTV 완제품 패키지를 판매합니다. 복잡한 견적 없이 정찰가로 구매하고, 필요하면 전문 기사의 유료 설치 서비스도 함께 신청할 수 있습니다. 모든 제품은 KC 인증을 받았으며 1년 무상 A/S를 기본 제공합니다.",
  phone: "1600-1234",
  kakaoUrl: "https://pf.kakao.com/_visionguard",
  address: "경기도 성남시 분당구 판교역로 235",
  region: "경기 성남시",
  industry: "CCTV 완제품 및 설치 패키지 판매",
  representativePrice: {
    label: "대표 상품가",
    price: "189,000원부터",
    description: "카메라 대수와 저장장치 용량에 따라 패키지 구성이 달라집니다.",
  },
  products: [
    {
      id: "prod-b1",
      name: "홈 스타터 패키지",
      shortDescription: "실내 카메라 1대 + 32GB 메모리 구성의 입문형 패키지",
      description:
        "원룸이나 소형 사무실에 적합한 최소 구성입니다. 실내용 카메라 1대와 32GB 메모리카드가 포함되어 있으며, 전용 앱 연동만으로 5분 내 설치가 완료됩니다. 야간에도 사물을 식별할 수 있는 적외선 나이트비전을 지원합니다.",
      price: "189,000원",
      priceNote: "무료배송",
      ctaText: "구매하기",
      sortOrder: 1,
    },
    {
      id: "prod-b2",
      name: "매장 스탠다드 패키지",
      shortDescription: "실내외 카메라 2대 + 128GB 구성으로 소규모 매장에 적합",
      description:
        "출입구와 매장 내부를 함께 확인할 수 있는 실내외 카메라 2대 구성입니다. 128GB 메모리로 넉넉한 저장 기간을 제공하며, 다회선 출입구가 있는 매장에서도 하나의 앱으로 통합 확인이 가능합니다.",
      price: "349,000원",
      priceNote: "무료배송 + 벽걸이 브라켓 포함",
      ctaText: "구매하기",
      sortOrder: 2,
    },
    {
      id: "prod-b3",
      name: "오피스 프로 패키지",
      shortDescription: "카메라 4대 + 1TB 저장 + AI 분석 기능 포함 사무실용 구성",
      description:
        "중대형 사무실이나 다층 매장에 적합한 프리미엄 구성입니다. 카메라 4대와 1TB 저장 공간, AI 사람 감지 알림 기능이 포함되어 있어 이상 상황 발생 시 즉시 알림을 받을 수 있습니다.",
      price: "690,000원",
      priceNote: "전문 설치 서비스 1회 무료 포함",
      ctaText: "구매하기",
      sortOrder: 3,
    },
    {
      id: "prod-b4",
      name: "전문 설치 서비스",
      shortDescription: "제품 구매 후 기사 방문 설치를 원하는 고객을 위한 단독 옵션",
      description:
        "이미 제품을 구매했거나 직접 설치가 어려운 고객을 위한 단독 설치 서비스입니다. 배선 정리와 각도 조정, 앱 연동까지 기사가 현장에서 직접 마무리해 드립니다.",
      price: "90,000원",
      priceUnit: "회당",
      ctaText: "설치 예약하기",
      sortOrder: 4,
    },
  ],
  features: [
    { id: "feat-b1", title: "완제품 박스 구성", description: "카메라, 저장장치, 케이블까지 필요한 모든 부품이 한 박스에 들어있습니다.", icon: "📦", sortOrder: 1 },
    { id: "feat-b2", title: "핸드폰 실시간 연동", description: "전용 앱 설치 후 QR 스캔만으로 5분 내 실시간 영상 확인이 가능합니다.", icon: "📱", sortOrder: 2 },
    { id: "feat-b3", title: "야간 컬러 나이트비전", description: "저조도 환경에서도 색상을 유지하는 컬러 나이트비전을 전 제품에 적용했습니다.", icon: "🌙", sortOrder: 3 },
    { id: "feat-b4", title: "당일 출고", description: "오후 2시 이전 주문 시 당일 출고되며, 수도권은 익일 도착합니다.", icon: "🚚", sortOrder: 4 },
  ],
  metrics: [
    { id: "metric-b1", label: "누적 판매", value: "8,000+", description: "세트 기준" },
    { id: "metric-b2", label: "평균 배송일", value: "1.2일", description: "수도권 기준" },
    { id: "metric-b3", label: "A/S 만족도", value: "98%", description: "구매 후 설문 기준" },
    { id: "metric-b4", label: "무상 보증", value: "1년", description: "전 제품 공통 적용" },
  ],
  specifications: [
    { id: "spec-b1", key: "해상도", value: "4K UHD", groupName: "카메라", sortOrder: 1 },
    { id: "spec-b2", key: "화각", value: "130도 광각", groupName: "카메라", sortOrder: 2 },
    { id: "spec-b3", key: "방수 등급", value: "IP67", groupName: "카메라", sortOrder: 3 },
    { id: "spec-b4", key: "저장 방식", value: "클라우드 + SD카드", groupName: "저장장치", sortOrder: 4 },
    { id: "spec-b5", key: "최대 저장기간", value: "30일", groupName: "저장장치", sortOrder: 5 },
    { id: "spec-b6", key: "최대 용량", value: "2TB", groupName: "저장장치", sortOrder: 6 },
  ],
  faqs: [
    { id: "faq-b1", question: "설치는 직접 해야 하나요?", answer: "네, 기본 패키지는 셀프 설치용으로 구성되어 있으며 앱 안내에 따라 5~10분이면 완료됩니다. 직접 설치가 어려우신 경우 전문 설치 서비스를 별도로 신청하실 수 있습니다.", sortOrder: 1 },
    { id: "faq-b2", question: "기존 와이파이로 연결되나요?", answer: "네, 2.4GHz 대역 와이파이 환경에서 정상 작동합니다. 5GHz 전용 공유기를 사용 중이시라면 듀얼밴드 설정을 확인해 주세요.", sortOrder: 2 },
    { id: "faq-b3", question: "반품/교환 가능한가요?", answer: "제품 수령 후 7일 이내, 미개봉 또는 정상 작동 확인 후 재포장이 가능한 경우 반품·교환이 가능합니다.", sortOrder: 3 },
    { id: "faq-b4", question: "AS 기간은 얼마나 되나요?", answer: "전 제품 구매일로부터 1년간 무상 A/S를 제공하며, 이후에는 유상으로 수리 및 부품 교체가 가능합니다.", sortOrder: 4 },
  ],
  processSteps: [
    { id: "step-b1", step: 1, title: "패키지 선택 및 주문", description: "매장 규모와 목적에 맞는 패키지를 선택해 온라인으로 주문합니다." },
    { id: "step-b2", step: 2, title: "당일 출고 및 배송", description: "오후 2시 이전 주문 시 당일 출고되며 수도권은 익일 도착합니다." },
    { id: "step-b3", step: 3, title: "셀프 설치 또는 기사 방문", description: "앱 안내에 따라 직접 설치하거나 전문 설치 서비스를 함께 신청할 수 있습니다." },
    { id: "step-b4", step: 4, title: "실시간 사용 시작", description: "앱 연동 완료 후 바로 실시간 영상 확인과 알림을 받아볼 수 있습니다." },
  ],
  trustBadges: ["누적 판매 8,000세트+", "KC 인증 제품", "1년 무상 A/S", "전국 무료배송"],
  companyInfo: {
    representative: "박비전",
    businessRegistrationNumber: "234-56-78901",
    establishedYear: "2016",
    address: "경기도 성남시 분당구 판교역로 235",
    email: "help@visionguard.example.com",
  },
  seo: {
    metaTitle: "비전가드 스토어 | 홈·소상공인 CCTV 세트 전문 쇼핑몰",
    metaDescription:
      "설치까지 끝난 CCTV 완제품 패키지. 홈 스타터부터 오피스 프로까지, 목적에 맞는 구성을 정찰가로 구매하세요. 1년 무상 A/S, 당일 출고.",
    keywords: ["CCTV 세트", "CCTV 쇼핑몰", "매장 CCTV", "홈CCTV", "CCTV 패키지"],
  },
  createdAt: "2026-07-12T09:00:00.000Z",
  updatedAt: "2026-09-08T09:00:00.000Z",
};

const brightDental: LandingPage = {
  id: "page-003",
  businessName: "브라이트치과",
  title: "브라이트치과 | 강남 임플란트·교정 전문 치과",
  slug: "dental-clinic",
  template: "template-c",
  status: "public",
  heroTitle: "아프지 않은 진료, 편안한 브라이트치과",
  heroDescription: "임플란트, 교정, 심미 치료까지 — 20년 경력 원장이 첫 상담부터 끝까지 직접 진료합니다.",
  description:
    "브라이트치과는 강남역 5분 거리에 위치한 치과로, 임플란트와 교정 치료를 중심으로 연간 2,000건 이상의 진료 경험을 쌓아왔습니다. 모든 치료는 원장 직접 진료를 원칙으로 하며, 치료 전 정밀 검사와 상담을 통해 환자에게 맞는 치료 계획을 제안합니다.",
  phone: "02-1234-5678",
  kakaoUrl: "https://pf.kakao.com/_brightdental",
  address: "서울특별시 강남구 강남대로 456, 브라이트빌딩 3층",
  region: "서울 강남구",
  industry: "치과 (임플란트·교정 전문)",
  representativePrice: {
    label: "임플란트 비용 안내",
    price: "1본당 90만원부터",
    description: "골이식 등 추가 치료 여부에 따라 금액이 달라질 수 있어 정확한 비용은 상담 후 안내드립니다.",
  },
  products: [
    {
      id: "prod-c1",
      name: "임플란트",
      shortDescription: "정밀 진단 기반의 1인 맞춤 임플란트 치료",
      description:
        "3D CT 촬영을 통한 정밀 진단으로 신경과 혈관 위치를 사전에 파악해 안전하게 시술합니다. 골밀도가 부족한 경우 골이식을 병행하며, 시술 후에도 정기 검진을 통해 장기간 관리해 드립니다.",
      price: "90만원",
      priceUnit: "1본당",
      priceNote: "정확한 비용은 상담 후 안내",
      ctaText: "상담 예약하기",
      sortOrder: 1,
    },
    {
      id: "prod-c2",
      name: "치아교정",
      shortDescription: "투명교정부터 일반교정까지 생활 패턴에 맞는 교정 방식 제안",
      description:
        "심미성을 중요시하는 분들을 위한 투명교정과, 복잡한 부정교합에 적합한 일반교정 중 구강 상태와 생활 패턴에 맞는 방식을 상담을 통해 함께 결정합니다. 월 1회 정기 내원으로 진행 상황을 관리합니다.",
      price: "350만원",
      priceUnit: "부터",
      ctaText: "상담 예약하기",
      sortOrder: 2,
    },
    {
      id: "prod-c3",
      name: "심미보철 (라미네이트)",
      shortDescription: "자연치아에 가까운 색감과 형태로 앞니 라인을 개선",
      description:
        "치아 삭제를 최소화하는 방식으로 진행하며, 개인별 치아 색상과 얼굴형을 고려해 자연스러운 라인을 디자인합니다. 시술 전 시뮬레이션을 통해 예상 결과를 미리 확인할 수 있습니다.",
      price: "40만원",
      priceUnit: "1개당부터",
      ctaText: "상담 예약하기",
      sortOrder: 3,
    },
    {
      id: "prod-c4",
      name: "정기검진 & 스케일링",
      shortDescription: "치아 건강을 미리 관리하는 정기 검진 및 스케일링",
      description:
        "6개월 주기의 정기 검진으로 충치와 잇몸 질환을 조기에 발견하고, 스케일링을 통해 치석과 착색을 제거합니다. 건강보험 적용 대상 여부는 내원 시 바로 안내해 드립니다.",
      price: "건강보험 적용",
      priceNote: "본인부담금 안내는 내원 시 확인",
      ctaText: "상담 예약하기",
      sortOrder: 4,
    },
  ],
  features: [
    { id: "feat-c1", title: "원장 직접 진료", description: "상담부터 시술, 사후 관리까지 모든 과정을 원장이 직접 진행합니다.", icon: "🦷", sortOrder: 1 },
    { id: "feat-c2", title: "디지털 정밀 진단", description: "3D CT와 구강 스캐너로 눈에 보이지 않는 부분까지 정밀하게 진단합니다.", icon: "🔬", sortOrder: 2 },
    { id: "feat-c3", title: "무통 마취 시스템", description: "전동 마취기를 사용해 주사 시 통증과 부담을 최소화합니다.", icon: "💉", sortOrder: 3 },
    { id: "feat-c4", title: "치료 후 정기 관리", description: "시술 이후에도 정기 검진 일정을 안내해 장기적인 구강 건강을 관리합니다.", icon: "📅", sortOrder: 4 },
  ],
  metrics: [
    { id: "metric-c1", label: "연간 진료", value: "2,000+", description: "임플란트·교정 기준" },
    { id: "metric-c2", label: "원장 경력", value: "20년", description: "치과 전문의" },
    { id: "metric-c3", label: "환자 만족도", value: "4.9/5", description: "내원 후기 기준" },
    { id: "metric-c4", label: "위치", value: "강남역 5분", description: "3, 7, 9호선 인근" },
  ],
  specifications: [],
  faqs: [
    { id: "faq-c1", question: "임플란트 비용은 얼마인가요?", answer: "기본 임플란트는 1본당 90만원부터 시작하며, 골이식 등 추가 치료가 필요한 경우 비용이 달라질 수 있습니다. 정밀 검사 후 정확한 금액을 안내해 드립니다.", sortOrder: 1 },
    { id: "faq-c2", question: "상담만 받아도 되나요?", answer: "네, 부담 없이 상담과 검진만 받으실 수 있습니다. 상담 후 치료 여부는 충분히 고민하신 뒤 결정하셔도 됩니다.", sortOrder: 2 },
    { id: "faq-c3", question: "교정 기간은 얼마나 걸리나요?", answer: "부정교합 정도에 따라 다르지만 평균적으로 투명교정은 6~12개월, 일반교정은 12~24개월 정도 소요됩니다.", sortOrder: 3 },
    { id: "faq-c4", question: "주차 가능한가요?", answer: "건물 내 방문객 전용 주차 공간이 마련되어 있으며, 내원 시 접수처에서 무료 주차 등록을 도와드립니다.", sortOrder: 4 },
  ],
  processSteps: [
    { id: "step-c1", step: 1, title: "온라인/전화 상담", description: "홈페이지 또는 전화로 간단한 상담을 먼저 진행합니다." },
    { id: "step-c2", step: 2, title: "내원 및 정밀검사", description: "3D CT 등 정밀 검사를 통해 구강 상태를 정확히 파악합니다." },
    { id: "step-c3", step: 3, title: "치료 계획 상담", description: "검사 결과를 바탕으로 원장이 직접 치료 계획과 비용을 설명합니다." },
    { id: "step-c4", step: 4, title: "맞춤 치료 진행", description: "동의된 계획에 따라 치료를 진행하고 이후 정기 관리로 이어집니다." },
  ],
  trustBadges: ["누적 진료 2,000건+", "치과 전문의 원장 진료", "야간 진료 운영", "강남역 도보 5분"],
  companyInfo: {
    representative: "이브라이트",
    businessRegistrationNumber: "345-67-89012",
    establishedYear: "2015",
    address: "서울특별시 강남구 강남대로 456, 브라이트빌딩 3층",
    email: "info@brightdental.example.com",
  },
  seo: {
    metaTitle: "브라이트치과 | 강남 임플란트·교정 전문 치과",
    metaDescription:
      "강남역 5분 거리, 20년 경력 원장 직접 진료. 임플란트, 치아교정, 심미보철까지 정밀 진단 기반으로 상담부터 치료까지 책임집니다.",
    keywords: ["강남 치과", "임플란트", "치아교정", "강남역 치과", "라미네이트"],
  },
  createdAt: "2026-06-20T09:00:00.000Z",
  updatedAt: "2026-09-05T09:00:00.000Z",
};

// Lightweight extra rows so the admin table shows realistic variety
// (drafts / archived, other templates) without needing full detail content.
const powerFitGym: LandingPage = {
  id: "page-004",
  businessName: "파워핏짐",
  title: "파워핏짐 | 강서구 프리미엄 퍼스널 트레이닝 센터",
  slug: "fitness-center",
  template: "template-c",
  status: "private",
  heroTitle: "3개월이면 몸이 달라집니다, 파워핏짐",
  heroDescription: "1:1 맞춤 PT와 회원 전용 식단 관리로 목표 체형까지 함께합니다.",
  description: "파워핏짐은 강서구 지역 밀착형 퍼스널 트레이닝 센터로, 회원 개개인의 체형과 목표에 맞춘 운동 프로그램을 제공합니다.",
  phone: "070-4321-0000",
  address: "서울특별시 강서구 화곡로 89",
  region: "서울 강서구",
  industry: "퍼스널 트레이닝 / 헬스장",
  representativePrice: { label: "PT 대표 가격", price: "회당 8만원", description: "패키지 구매 시 회당 단가 할인" },
  products: [
    { id: "prod-d1", name: "1:1 퍼스널 트레이닝", shortDescription: "전담 트레이너의 1:1 맞춤 운동 지도", description: "체성분 분석을 기반으로 개인별 운동 프로그램을 설계하고 매 세션마다 자세를 교정합니다.", price: "8만원", priceUnit: "회당", ctaText: "상담 신청하기", sortOrder: 1 },
  ],
  features: [
    { id: "feat-d1", title: "체성분 정밀 분석", description: "인바디 기반 정밀 분석으로 맞춤 프로그램을 설계합니다.", icon: "📊", sortOrder: 1 },
  ],
  metrics: [{ id: "metric-d1", label: "회원 수", value: "600+", description: "누적 등록 회원" }],
  specifications: [],
  faqs: [{ id: "faq-d1", question: "PT 가격은 얼마인가요?", answer: "회당 8만원이며 패키지 구매 시 할인됩니다.", sortOrder: 1 }],
  processSteps: [],
  trustBadges: ["체형 분석 무료 제공"],
  companyInfo: { representative: "최파워", establishedYear: "2019", address: "서울특별시 강서구 화곡로 89" },
  createdAt: "2026-08-20T09:00:00.000Z",
  updatedAt: "2026-09-01T09:00:00.000Z",
};

const greenCleanHomecare: LandingPage = {
  id: "page-005",
  businessName: "그린클린 홈케어",
  title: "그린클린 홈케어 | 신뢰할 수 있는 가정·사무실 청소 서비스",
  slug: "cleaning-service",
  template: "template-c",
  status: "private",
  heroTitle: "우리 집처럼 청소합니다, 그린클린 홈케어",
  heroDescription: "검증된 매니저가 정기 방문 청소부터 입주 청소까지 책임집니다.",
  description: "그린클린 홈케어는 검증된 청소 매니저를 매칭해 가정과 사무실에 정기 청소 서비스를 제공합니다.",
  phone: "070-8765-1111",
  address: "서울특별시 마포구 월드컵로 12",
  region: "서울 마포구",
  industry: "가정/사무실 청소 서비스",
  representativePrice: { label: "정기청소 대표 가격", price: "회당 6만원부터", description: "평수와 청소 범위에 따라 변동" },
  products: [
    { id: "prod-e1", name: "정기 방문 청소", shortDescription: "주 1회 또는 격주 정기 청소 서비스", description: "동일한 매니저가 매회 방문해 청소 상태를 꾸준히 관리합니다.", price: "6만원", priceUnit: "회당부터", ctaText: "상담 신청하기", sortOrder: 1 },
  ],
  features: [
    { id: "feat-e1", title: "검증된 매니저", description: "신원 확인과 교육을 거친 매니저만 배정됩니다.", icon: "✅", sortOrder: 1 },
  ],
  metrics: [{ id: "metric-e1", label: "누적 방문", value: "15,000+", description: "누적 청소 횟수" }],
  specifications: [],
  faqs: [{ id: "faq-e1", question: "비용은 어떻게 산정되나요?", answer: "평수와 청소 범위에 따라 회당 6만원부터 시작합니다.", sortOrder: 1 }],
  processSteps: [],
  trustBadges: ["매니저 신원 검증 완료"],
  companyInfo: { representative: "정그린", establishedYear: "2020", address: "서울특별시 마포구 월드컵로 12" },
  createdAt: "2026-08-25T09:00:00.000Z",
  updatedAt: "2026-08-30T09:00:00.000Z",
};

const cloudFlowConsulting: LandingPage = {
  id: "page-006",
  businessName: "클라우드플로우 컨설팅",
  title: "클라우드플로우 컨설팅 | 중소기업 클라우드 전환 컨설팅",
  slug: "cloudflow-consulting",
  template: "template-a",
  status: "private",
  heroTitle: "클라우드 전환, 시행착오 없이 진행하세요",
  heroDescription: "인프라 진단부터 마이그레이션, 운영 안정화까지 원스톱으로 지원합니다.",
  description: "클라우드플로우 컨설팅은 중소기업의 클라우드 전환을 돕는 IT 컨설팅 기업입니다.",
  phone: "02-9876-5432",
  address: "서울특별시 서초구 서초대로 77",
  region: "서울 서초구",
  industry: "클라우드 인프라 컨설팅",
  representativePrice: { label: "컨설팅 대표 가격", price: "별도 견적", description: "프로젝트 범위에 따라 산정" },
  products: [
    { id: "prod-f1", name: "인프라 진단", shortDescription: "현행 IT 인프라 구조 진단 및 리포트 제공", description: "현재 서버/네트워크 구조를 분석해 클라우드 전환 시 예상되는 리스크와 비용을 리포트로 제공합니다.", price: "별도 견적", ctaText: "상담 신청하기", sortOrder: 1 },
  ],
  features: [
    { id: "feat-f1", title: "무중단 마이그레이션", description: "서비스 운영을 중단하지 않고 단계적으로 전환합니다.", icon: "☁️", sortOrder: 1 },
  ],
  metrics: [{ id: "metric-f1", label: "전환 프로젝트", value: "80+", description: "누적 수행 건수" }],
  specifications: [],
  faqs: [{ id: "faq-f1", question: "비용은 어떻게 책정되나요?", answer: "프로젝트 범위에 따라 별도 견적으로 산정됩니다.", sortOrder: 1 }],
  processSteps: [],
  trustBadges: ["대기업 클라우드 전환 경험 보유"],
  companyInfo: { representative: "한클라우드", establishedYear: "2017", address: "서울특별시 서초구 서초대로 77" },
  createdAt: "2026-03-10T09:00:00.000Z",
  updatedAt: "2026-06-01T09:00:00.000Z",
};

export const landingPages: LandingPage[] = [
  techSecurity,
  visionGuardStore,
  brightDental,
  powerFitGym,
  greenCleanHomecare,
  cloudFlowConsulting,
];

export function getLandingPageBySlug(slug: string): LandingPage | undefined {
  return landingPages.find((p) => p.slug === slug);
}

/** Template demo pages pull their mock content from here. */
export const templateDemoContent: Record<string, LandingPage> = {
  "template-a": techSecurity,
  "template-b": visionGuardStore,
  "template-c": brightDental,
};

// ---------------------------------------------------------------------------
// Consultations
// ---------------------------------------------------------------------------

export const consultations: ConsultationRequest[] = [
  { id: "cons-001", landingPageId: "page-001", businessName: "테크시큐리티", customerName: "이현우", phone: "010-1234-5678", message: "물류센터 CCTV 신규 설치 견적 문의드립니다.", status: "new", createdAt: "2026-09-13T10:20:00.000Z" },
  { id: "cons-002", landingPageId: "page-001", businessName: "테크시큐리티", customerName: "박소연", phone: "010-2345-6789", message: "기존 CCTV 노후 교체 상담 원합니다.", status: "contacted", createdAt: "2026-09-11T14:05:00.000Z" },
  { id: "cons-003", landingPageId: "page-003", businessName: "브라이트치과", customerName: "김민지", phone: "010-3456-7890", message: "임플란트 상담 예약하고 싶습니다.", status: "new", createdAt: "2026-09-13T09:40:00.000Z" },
  { id: "cons-004", landingPageId: "page-003", businessName: "브라이트치과", customerName: "정우성", phone: "010-4567-8901", message: "투명교정 비용이 궁금합니다.", status: "closed", createdAt: "2026-09-05T11:15:00.000Z" },
  { id: "cons-005", landingPageId: "page-002", businessName: "비전가드 스토어", customerName: "최유진", phone: "010-5678-9012", message: "오피스 프로 패키지 설치 문의드립니다.", status: "contacted", createdAt: "2026-09-09T16:30:00.000Z" },
  { id: "cons-006", landingPageId: "page-004", businessName: "파워핏짐", customerName: "오지훈", phone: "010-6789-0123", message: "PT 체험 상담 신청합니다.", status: "new", createdAt: "2026-09-12T18:00:00.000Z" },
];

// ---------------------------------------------------------------------------
// Dashboard / analytics mock summaries
// ---------------------------------------------------------------------------

export const dashboardStats = {
  totalPages: landingPages.length,
  public: landingPages.filter((p) => p.status === "public").length,
  private: landingPages.filter((p) => p.status === "private").length,
  consultations: consultations.length,
  newConsultations: consultations.filter((c) => c.status === "new").length,
};

export const pageViewsTrend = [
  { label: "9/8", value: 320 },
  { label: "9/9", value: 410 },
  { label: "9/10", value: 380 },
  { label: "9/11", value: 460 },
  { label: "9/12", value: 512 },
  { label: "9/13", value: 470 },
  { label: "9/14", value: 545 },
];

export const topPerformingPages = [
  { businessName: "테크시큐리티", slug: "cctv-company", views: 2140, consultations: 18 },
  { businessName: "브라이트치과", slug: "dental-clinic", views: 1870, consultations: 24 },
  { businessName: "비전가드 스토어", slug: "visionguard-store", views: 1320, consultations: 9 },
];
