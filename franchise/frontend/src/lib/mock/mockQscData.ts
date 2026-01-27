import { Inspection, QSCTemplate, QSCItem } from '@/types';

export const FIXED_QSC_CATEGORIES = {
    quality: {
        id: 'quality', label: '품질 (Quality)',
        subcategories: [],
        maxItems: 15,
        weight: 30
    },
    service: {
        id: 'service', label: '서비스 (Service)',
        subcategories: [],
        maxItems: 15,
        weight: 30
    },
    hygiene: {
        id: 'hygiene', label: '위생 (Hygiene)',
        subcategories: [],
        maxItems: 15,
        weight: 30
    },
    brand: {
        id: 'brand', label: '운영브랜드 (Brand)',
        subcategories: [], // Shared with Safety
        maxItems: 5,
        weight: 10
    },
    safety: {
        id: 'safety', label: '안전 (Safety)',
        subcategories: [], // Shared with Brand
        maxItems: 5,
        weight: 0
    }
};

export const QSC_GRADE_CRITERIA = [
    { grade: 'S', minScore: 95, label: '우수 점포', color: 'text-green-600', bg: 'bg-green-50' },
    { grade: 'A', minScore: 90, label: '정상 점포', color: 'text-blue-600', bg: 'bg-blue-50' },
    { grade: 'B', minScore: 80, label: '관리 권고', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { grade: 'C', minScore: 70, label: '재점검 필요', color: 'text-orange-600', bg: 'bg-orange-50' },
    { grade: 'D', minScore: 0, label: '시정 명령', color: 'text-red-600', bg: 'bg-red-50' },
];

export const MOCK_INSPECTIONS: Inspection[] = [
    { id: '101', date: '2026-01-09', storeId: '1', storeName: '강남역점', region: '서울/경기', sv: '김관리', type: '정기', score: 92, grade: 'S', isPassed: true, isReinspectionNeeded: false, inspector: '김관리', status: '완료' },
    { id: '102', date: '2026-01-08', storeId: '6', storeName: '대구동성로점', region: '대구/경북', sv: '김대구', type: '정기', score: 88, grade: 'A', isPassed: true, isReinspectionNeeded: false, inspector: '김대구', status: '점주확인' },
    { id: '103', date: '2026-01-07', storeId: '5', storeName: '광주수완점', region: '광주/전라', sv: '정광주', type: '특별', score: 65, grade: 'C', isPassed: false, isReinspectionNeeded: true, inspector: '정광주', status: '완료' },
    { id: '104', date: '2026-01-06', storeId: '7', storeName: '인천송도점', region: '서울/경기', sv: '김관리', type: '정기', score: 95, grade: 'S', isPassed: true, isReinspectionNeeded: false, inspector: '김관리', status: '완료' },
    { id: '105', date: '2026-01-05', storeId: '8', storeName: '판교역점', region: '서울/경기', sv: '김관리', type: '재점검', score: 55, grade: 'D', isPassed: false, isReinspectionNeeded: true, inspector: '김관리', status: '임시저장' },
    { id: '106', date: '2026-01-03', storeId: '2', storeName: '홍대입구점', region: '서울/경기', sv: '이성실', type: '정기', score: 78, grade: 'B', isPassed: true, isReinspectionNeeded: false, inspector: '이성실', status: '완료' },
    { id: '107', date: '2026-01-02', storeId: '3', storeName: '부산서면점', region: '부산/경남', sv: '박부산', type: '정기', score: 72, grade: 'C', isPassed: false, isReinspectionNeeded: true, inspector: '박부산', status: '완료' },
    { id: '108', date: '2025-12-28', storeId: '4', storeName: '대전둔산점', region: '대전/충청', sv: '최대전', type: '정기', score: 45, grade: 'D', isPassed: false, isReinspectionNeeded: true, inspector: '최대전', status: '완료' },
    { id: '109', date: '2025-12-25', storeId: '10', storeName: '제주공항점', region: '제주', sv: '한제주', type: '특별', score: 82, grade: 'B', isPassed: true, isReinspectionNeeded: false, inspector: '한제주', status: '완료' },
    { id: '110', date: '2025-12-20', storeId: '9', storeName: '잠실롯데점', region: '서울/경기', sv: '이성실', type: '정기', score: 98, grade: 'S', isPassed: true, isReinspectionNeeded: false, inspector: '이성실', status: '완료' },
    // Add history data for Gangnam (1) to show list
    { id: '111', date: '2025-12-11', storeId: '1', storeName: '강남역점', region: '서울/경기', sv: '김관리', type: '정기', score: 96, grade: 'S', isPassed: true, isReinspectionNeeded: false, inspector: '김관리', status: '완료' },
    { id: '112', date: '2025-11-11', storeId: '1', storeName: '강남역점', region: '서울/경기', sv: '김관리', type: '정기', score: 96, grade: 'S', isPassed: true, isReinspectionNeeded: false, inspector: '김관리', status: '완료' },
    { id: '113', date: '2025-05-08', storeId: '1', storeName: '강남역점', region: '서울/경기', sv: '김관리', type: '정기', score: 40, grade: 'D', isPassed: false, isReinspectionNeeded: true, inspector: '김관리', status: '완료' },
];

// 2. Mock Templates
export const MOCK_TEMPLATES: QSCTemplate[] = [
    {
        id: '1',
        title: '2025 상반기 정기 점검',
        description: '전사 정기 QSC 점검입니다.',
        version: 'Regular_250110', // Example format
        type: '정기 점검',
        scope: '전체 매장',
        effective_from: '2025-01-10',
        effective_to: null,
        isActive: true, // Added for UI
        createdAt: '2025-01-10',
        updatedAt: '2025-01-10',
        createdBy: '김관리',
        items: [
            // Quality (품질)
            { id: 'q1', categoryId: 'quality', subcategory: '원재료 관리', name: '유통기한 경과 식자재 미보관', weight: 5, inputType: 'SCORE', isRequired: true },
            { id: 'q2', categoryId: 'quality', subcategory: '원재료 관리', name: '식자재 선입선출 준수', weight: 5, inputType: 'SCORE', isRequired: true },
            { id: 'q3', categoryId: 'quality', subcategory: '레시피 준수', name: '메뉴 매뉴얼 준수 (레시피)', weight: 5, inputType: 'SCORE' },
            { id: 'q4', categoryId: 'quality', subcategory: '조리완성도', name: '음식 제공 온도 적정성', weight: 5, inputType: 'SCORE' },

            // Service (서비스)
            { id: 's1', categoryId: 'service', subcategory: '고객응대', name: '고객 입/퇴점 인사 철저', weight: 5, inputType: 'SCORE' },
            { id: 's2', categoryId: 'service', subcategory: '복장 및 태도', name: '유니폼 및 명찰 패용 상태', weight: 5, inputType: 'SCORE' },
            { id: 's3', categoryId: 'service', subcategory: '운영 정확성', name: '주문 접수 정확도', weight: 5, inputType: 'SCORE' },

            // Hygiene (청결/위생) - Using 'hygiene' for Cleanliness as per FIXED_CATEGORIES
            { id: 'h1', categoryId: 'hygiene', subcategory: '주방위생', name: '주방 바닥 및 배수구 청결', weight: 5, inputType: 'SCORE' },
            { id: 'h2', categoryId: 'hygiene', subcategory: '개인위생', name: '근무자 보건증 유효성', weight: 5, inputType: 'SCORE', isRequired: true },
            { id: 'h3', categoryId: 'hygiene', subcategory: '냉장냉동', name: '냉장고/냉동고 온도 적정성', weight: 5, inputType: 'SCORE' },

            // Brand (브랜드)
            { id: 'b1', categoryId: 'brand', subcategory: '정책준수', name: 'POS 매출 등록 누락 여부', weight: 5, inputType: 'SCORE' },

            // Safety (안전)
            { id: 'sf1', categoryId: 'safety', subcategory: '화재/비상', name: '소화기 비치 및 점검 상태', weight: 5, inputType: 'SCORE', isRequired: true },
        ]
    }
];

export const CHECKLIST_ITEMS = {
    // Legacy support (to avoid breaking old imports immediately, though ideally we migrate)
    quality: MOCK_TEMPLATES[0].items.filter(i => i.categoryId === 'quality'),
    service: MOCK_TEMPLATES[0].items.filter(i => i.categoryId === 'service'),
    cleanliness: MOCK_TEMPLATES[0].items.filter(i => i.categoryId === 'cleanliness'),
};

// Helper to generate consistent mock detail answers based on score/grade
export const getMockInspectionDetails = (inspectionId: string) => {
    // Return explicit mock for the demo inspection '101'
    if (inspectionId === '101') {
        return {
            overallComment: "전반적으로 우수한 관리 상태를 유지하고 있습니다. 특히 주방 위생이 매우 청결합니다. 다만, 일부 직원들의 고객 응대 톤이 다소 낮아 활기찬 분위기 조성을 위한 교육이 필요합니다.",
            overallPhotos: ['/mock/photo1.jpg', '/mock/photo2.jpg'],
            answers: MOCK_TEMPLATES[0].items.reduce((acc, item) => {
                // Determine mock score
                let score = 5;
                if (item.id === 's1') score = 3; // Mock lower score for Service

                acc[item.id] = {
                    score: score,
                    comment: score < 5 ? '활기찬 목소리로 인사 필요' : undefined,
                    photoUrl: score < 5 ? '/mock/service_issue.jpg' : undefined
                };
                return acc;
            }, {} as Record<string, { score: number, comment?: string, photoUrl?: string }>)
        };
    }

    // Default Fallback
    return {
        overallComment: "특이사항 없음.",
        overallPhotos: [],
        answers: MOCK_TEMPLATES[0].items.reduce((acc, item) => {
            acc[item.id] = { score: 5 };
            return acc;
        }, {} as Record<string, any>)
    };
};
