
export interface QscCategory {
    id: string;
    name: string;
    weight: number;
}

export interface QscItem {
    id: string;
    categoryId: string;
    subcategory: string;
    name: string;
    criteria: string;
    weight: number;
    isPhotoRequired: boolean;
}

export interface PenaltyRule {
    id: string;
    name: string;
    condition: string;
    maxGrade: 'B' | 'C' | 'D' | null;
    description: string;
}

export const QSC_CATEGORIES: QscCategory[] = [
    { id: 'Q', name: 'Quality (품질)', weight: 30 },
    { id: 'S', name: 'Service (서비스)', weight: 25 },
    { id: 'C', name: 'Cleanliness (위생)', weight: 30 },
    { id: 'Brand', name: 'Brand (운영/브랜드)', weight: 15 },
];

export const QSC_ITEMS: QscItem[] = [
    // Q-Quality (30)
    // 원재료 관리(8)
    { id: 'q1', categoryId: 'Q', subcategory: '원재료 관리', name: '도우 유통기한 준수', criteria: '기준 내 사용(라벨/보관)', weight: 2, isPhotoRequired: true },
    { id: 'q2', categoryId: 'Q', subcategory: '원재료 관리', name: '치즈 신선도', criteria: '변색·이취 없음', weight: 2, isPhotoRequired: false },
    { id: 'q3', categoryId: 'Q', subcategory: '원재료 관리', name: '토핑 식재 상태', criteria: '수분/변질 없음', weight: 2, isPhotoRequired: false },
    { id: 'q4', categoryId: 'Q', subcategory: '원재료 관리', name: '소스 보관/라벨', criteria: '밀폐·라벨 부착', weight: 2, isPhotoRequired: false },
    // 레시피 준수(10)
    { id: 'q5', categoryId: 'Q', subcategory: '레시피 준수', name: '도우 중량', criteria: '기준 ±5%', weight: 3, isPhotoRequired: false },
    { id: 'q6', categoryId: 'Q', subcategory: '레시피 준수', name: '토핑 정량', criteria: '기준표 준수', weight: 3, isPhotoRequired: true },
    { id: 'q7', categoryId: 'Q', subcategory: '레시피 준수', name: '소스 사용량', criteria: '과다/부족 없음', weight: 2, isPhotoRequired: false },
    { id: 'q8', categoryId: 'Q', subcategory: '레시피 준수', name: '치즈 분포', criteria: '쏠림 없음', weight: 2, isPhotoRequired: true },
    // 조리 완성도(8)
    { id: 'q9', categoryId: 'Q', subcategory: '조리 완성도', name: '굽기 상태', criteria: '과/미숙 없음', weight: 4, isPhotoRequired: true },
    { id: 'q10', categoryId: 'Q', subcategory: '조리 완성도', name: '외형 균형', criteria: '찌그러짐/눌림 없음', weight: 2, isPhotoRequired: false },
    { id: 'q11', categoryId: 'Q', subcategory: '조리 완성도', name: '절단 상태', criteria: '규격 컷팅', weight: 2, isPhotoRequired: false },
    // 포장 품질(4)
    { id: 'q12', categoryId: 'Q', subcategory: '포장 품질', name: '박스 청결', criteria: '이물·오염 없음', weight: 2, isPhotoRequired: true },
    { id: 'q13', categoryId: 'Q', subcategory: '포장 품질', name: '눅눅함 방지', criteria: '환기홀/패킹 상태 양호', weight: 2, isPhotoRequired: false },

    // S-Service (25)
    // 고객 응대(10)
    { id: 's1', categoryId: 'S', subcategory: '고객 응대', name: '인사/멘트', criteria: '표준 멘트 사용', weight: 3, isPhotoRequired: false },
    { id: 's2', categoryId: 'S', subcategory: '고객 응대', name: '주문 확인', criteria: '재확인(메뉴/옵션/주소)', weight: 3, isPhotoRequired: false },
    { id: 's3', categoryId: 'S', subcategory: '고객 응대', name: '응대 태도', criteria: '불친절 요소 없음', weight: 4, isPhotoRequired: false },
    // 복장·태도(7)
    { id: 's4', categoryId: 'S', subcategory: '복장·태도', name: '유니폼', criteria: '착용·청결', weight: 3, isPhotoRequired: true },
    { id: 's5', categoryId: 'S', subcategory: '복장·태도', name: '위생모/모자', criteria: '착용', weight: 2, isPhotoRequired: false },
    { id: 's6', categoryId: 'S', subcategory: '복장·태도', name: '근무 자세', criteria: '무성의/잡담 과다 없음', weight: 2, isPhotoRequired: false },
    // 운영 정확성(8)
    { id: 's7', categoryId: 'S', subcategory: '운영 정확성', name: '주문 오류', criteria: '누락·오류 없음', weight: 4, isPhotoRequired: false },
    { id: 's8', categoryId: 'S', subcategory: '운영 정확성', name: '조리/대기 시간', criteria: '기준 시간 내(피크 타임 포함)', weight: 4, isPhotoRequired: false },

    // C-Cleanliness (30)
    // 개인 위생(8)
    { id: 'c1', categoryId: 'C', subcategory: '개인 위생', name: '손 위생', criteria: '수시 세척/손소독', weight: 3, isPhotoRequired: false },
    { id: 'c2', categoryId: 'C', subcategory: '개인 위생', name: '장갑 교체', criteria: '식재/업무 전환 시 교체', weight: 3, isPhotoRequired: false },
    { id: 'c3', categoryId: 'C', subcategory: '개인 위생', name: '악세서리/손톱', criteria: '착용 없음·손톱 청결', weight: 2, isPhotoRequired: true },
    // 주방 위생(10)
    { id: 'c4', categoryId: 'C', subcategory: '주방 위생', name: '조리대 청결', criteria: '기름·찌꺼기 없음', weight: 4, isPhotoRequired: true },
    { id: 'c5', categoryId: 'C', subcategory: '주방 위생', name: '오븐 상태', criteria: '탄화물/이물 없음', weight: 3, isPhotoRequired: true },
    { id: 'c6', categoryId: 'C', subcategory: '주방 위생', name: '바닥 청결', criteria: '미끄럼·오염 없음', weight: 3, isPhotoRequired: false },
    // 냉장·냉동(8)
    { id: 'c7', categoryId: 'C', subcategory: '냉장·냉동', name: '온도 관리', criteria: '기준 범위 준수', weight: 3, isPhotoRequired: true },
    { id: 'c8', categoryId: 'C', subcategory: '냉장·냉동', name: '정리/구역 분리', criteria: '원재료/완제품/폐기 분리', weight: 3, isPhotoRequired: true },
    { id: 'c9', categoryId: 'C', subcategory: '냉장·냉동', name: '라벨링', criteria: '식재명·입고/개봉일', weight: 2, isPhotoRequired: true },
    // 홀/공용(4)
    { id: 'c10', categoryId: 'C', subcategory: '홀/공용', name: '카운터/홀', criteria: '정돈·이물 없음', weight: 2, isPhotoRequired: false },
    { id: 'c11', categoryId: 'C', subcategory: '홀/공용', name: '화장실/세면', criteria: '청결·소모품 비치', weight: 2, isPhotoRequired: false },

    // Brand (15)
    // 정책 준수(7)
    { id: 'b1', categoryId: 'Brand', subcategory: '정책 준수', name: '가격 준수', criteria: '임의 변경 없음', weight: 3, isPhotoRequired: false },
    { id: 'b2', categoryId: 'Brand', subcategory: '정책 준수', name: '프로모션 이행', criteria: '미이행 없음', weight: 4, isPhotoRequired: false },
    // 시스템/정산(5)
    { id: 'b3', categoryId: 'Brand', subcategory: '시스템/정산', name: 'POS 입력', criteria: '누락 없음', weight: 3, isPhotoRequired: false },
    { id: 'b4', categoryId: 'Brand', subcategory: '시스템/정산', name: '정산 오류', criteria: '이상 없음', weight: 2, isPhotoRequired: false },
    // 브랜드 이미지(3)
    { id: 'b5', categoryId: 'Brand', subcategory: '브랜드 이미지', name: 'POP/포스터', criteria: '최신 유지', weight: 2, isPhotoRequired: true },
    { id: 'b6', categoryId: 'Brand', subcategory: '브랜드 이미지', name: '훼손 여부', criteria: '파손/오염 없음', weight: 1, isPhotoRequired: false },
];

export const PENALTY_RULES: PenaltyRule[] = [
    { id: 'p1', name: '유통기한 경과', condition: '유통기한 경과 식자재 발견', maxGrade: 'B', description: '발견 즉시 폐기/원인 기록 권장' },
    { id: 'p2', name: '위생 중대 위반', condition: '벌레/악취/심각 오염', maxGrade: 'D', description: '현장 시정 + 재점검 필수' },
    { id: 'p3', name: '레시피 고의 위반', condition: '정량 미준수/재료 누락', maxGrade: 'C', description: '반복 시 가맹 정책 적용' },
];
