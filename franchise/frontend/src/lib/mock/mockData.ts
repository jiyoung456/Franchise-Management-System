import { Store } from '@/types';

export const MOCK_STORES: Store[] = [
    {
        id: '1', name: '강남역점', regionCode: '서울/경기', currentSupervisorId: 'sv-uuid-1', // 김관리
        operationStatus: 'OPEN', currentState: 'NORMAL', currentStateScore: 95,
        qscScore: 92,
        openedAt: '2024-03-15T00:00:00',
        address: '서울 강남구 강남대로 123', tradeAreaType: 'OFFICE',
        ownerName: '박점주', ownerPhone: '010-1234-5678', contractType: 'FRANCHISE', contractEndAt: '2027-03-14T00:00:00',
        createdAt: '2024-03-15T00:00:00', updatedAt: '2026-01-19T00:00:00',
        statusHistory: [
            { date: '2025-11-20', reason: '정기 점검 우수', oldStatus: 'WATCHLIST', newStatus: 'NORMAL', changer: '김관리' }
        ],
        monthlyRevenue: 85000000, growthRate: 5.2
    },
    {
        id: '2', name: '홍대입구점', regionCode: '서울/경기', currentSupervisorId: 'sv-uuid-2', // 이성실
        operationStatus: 'OPEN', currentState: 'NORMAL', currentStateScore: 88,
        qscScore: 85,
        openedAt: '2024-04-20T00:00:00',
        address: '서울 마포구 홍익로 10', tradeAreaType: 'UNIVERSITY',
        ownerName: '최홍대', ownerPhone: '010-2222-3333', contractType: 'FRANCHISE', contractEndAt: '2027-04-19T00:00:00',
        createdAt: '2024-04-20T00:00:00', updatedAt: '2026-01-19T00:00:00',
        statusHistory: [],
        monthlyRevenue: 62000000, growthRate: -1.5
    },
    {
        id: '3', name: '부산서면점', regionCode: '부산/경남', currentSupervisorId: 'sv-uuid-3', // 박부산
        operationStatus: 'OPEN', currentState: 'WATCHLIST', currentStateScore: 72,
        qscScore: 78,
        openedAt: '2023-11-10T00:00:00',
        address: '부산 부산진구 중앙대로 600', tradeAreaType: 'MIXED',
        ownerName: '김부산', ownerPhone: '010-4444-5555', contractType: 'DIRECT', contractEndAt: undefined,
        createdAt: '2023-11-10T00:00:00', updatedAt: '2026-01-02T00:00:00',
        statusHistory: [
            { date: '2026-01-02', reason: '매출 감소 추세', oldStatus: 'NORMAL', newStatus: 'WATCHLIST', changer: '시스템(AI)' }
        ],
        monthlyRevenue: 45000000, growthRate: -8.4
    },
    {
        id: '4', name: '대전둔산점', regionCode: '대전/충청', currentSupervisorId: 'sv-uuid-4', // 최대전
        operationStatus: 'CLOSED_TEMPORARY', currentState: 'RISK', currentStateScore: 45,
        qscScore: 0,
        openedAt: '2023-09-01T00:00:00',
        address: '대전 서구 둔산로 50', tradeAreaType: 'RESIDENTIAL',
        ownerName: '이대전', ownerPhone: '010-6666-7777', contractType: 'FRANCHISE', contractEndAt: '2026-08-31T00:00:00',
        createdAt: '2023-09-01T00:00:00', updatedAt: '2025-12-20T00:00:00',
        statusHistory: [
            { date: '2025-12-20', reason: '장기 휴업 신청', oldStatus: 'WATCHLIST', newStatus: 'RISK', changer: '최대전' }
        ],
        monthlyRevenue: 0, growthRate: 0
    },
    {
        id: '5', name: '광주수완점', regionCode: '광주/전라', currentSupervisorId: 'sv-uuid-5', // 정광주
        operationStatus: 'OPEN', currentState: 'RISK', currentStateScore: 58,
        qscScore: 65,
        openedAt: '2025-01-15T00:00:00',
        address: '광주 광산구 장신로 80', tradeAreaType: 'RESIDENTIAL',
        ownerName: '박광주', ownerPhone: '010-8888-9999', contractType: 'FRANCHISE', contractEndAt: '2028-01-14T00:00:00',
        createdAt: '2025-01-15T00:00:00', updatedAt: '2026-01-05T00:00:00',
        statusHistory: [
            { date: '2026-01-05', reason: '위생 점검 부적합', oldStatus: 'NORMAL', newStatus: 'RISK', changer: '정광주' }
        ],
        monthlyRevenue: 38000000, growthRate: -12.1
    },
    {
        id: '6', name: '대구동성로점', regionCode: '대구/경북', currentSupervisorId: 'sv-uuid-6', // 김대구
        operationStatus: 'OPEN', currentState: 'NORMAL', currentStateScore: 90,
        qscScore: 88,
        openedAt: '2024-06-30T00:00:00',
        address: '대구 중구 동성로 30', tradeAreaType: 'STATION',
        ownerName: '최대구', ownerPhone: '010-1111-2222', contractType: 'DIRECT', contractEndAt: undefined,
        createdAt: '2024-06-30T00:00:00', updatedAt: '2026-01-19T00:00:00',
        statusHistory: [],
        monthlyRevenue: 55000000, growthRate: 3.8
    },
    {
        id: '7', name: '인천송도점', regionCode: '서울/경기', currentSupervisorId: 'sv-uuid-1', // 김관리
        operationStatus: 'OPEN', currentState: 'NORMAL', currentStateScore: 94,
        qscScore: 95,
        openedAt: '2024-08-15T00:00:00',
        address: '인천 연수구 송도국제대로 150', tradeAreaType: 'MIXED',
        ownerName: '한송도', ownerPhone: '010-3333-4444', contractType: 'FRANCHISE', contractEndAt: '2027-08-14T00:00:00',
        createdAt: '2024-08-15T00:00:00', updatedAt: '2026-01-19T00:00:00',
        statusHistory: [],
        monthlyRevenue: 72000000, growthRate: 8.5
    },
    {
        id: '8', name: '판교역점', regionCode: '서울/경기', currentSupervisorId: 'sv-uuid-1', // 김관리
        operationStatus: 'OPEN', currentState: 'WATCHLIST', currentStateScore: 68,
        qscScore: 55,
        openedAt: '2023-05-20T00:00:00',
        address: '경기 성남시 분당구 판교역로 100', tradeAreaType: 'OFFICE',
        ownerName: '오판교', ownerPhone: '010-5555-6666', contractType: 'FRANCHISE', contractEndAt: '2026-05-19T00:00:00',
        createdAt: '2023-05-20T00:00:00', updatedAt: '2025-12-15T00:00:00',
        statusHistory: [
            { date: '2025-12-15', reason: 'QSC 점수 하락', oldStatus: 'NORMAL', newStatus: 'WATCHLIST', changer: '시스템' }
        ],
        monthlyRevenue: 48000000, growthRate: -5.0
    },
    {
        id: '9', name: '잠실롯데점', regionCode: '서울/경기', currentSupervisorId: 'sv-uuid-2', // 이성실
        operationStatus: 'OPEN', currentState: 'NORMAL', currentStateScore: 100,
        qscScore: 0,
        openPlannedAt: '2026-02-01T00:00:00',
        address: '서울 송파구 올림픽로 300', tradeAreaType: 'TOURISM',
        ownerName: '롯데', ownerPhone: '010-7777-8888', contractType: 'DIRECT', contractEndAt: undefined,
        createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00',
        statusHistory: [],
        monthlyRevenue: 0, growthRate: 0
    },
    {
        id: '10', name: '제주공항점', regionCode: '제주', currentSupervisorId: 'sv-uuid-7', // 한제주
        operationStatus: 'CLOSED', currentState: 'NORMAL', currentStateScore: 0,
        qscScore: 0,
        openedAt: '2022-01-10T00:00:00', closedAt: '2025-11-01T00:00:00',
        address: '제주 제주시 공항로 2', tradeAreaType: 'TOURISM',
        ownerName: '김제주', ownerPhone: '010-9999-0000', contractType: 'FRANCHISE', contractEndAt: '2025-11-01T00:00:00',
        createdAt: '2022-01-10T00:00:00', updatedAt: '2025-11-01T00:00:00',
        statusHistory: [
            { date: '2025-11-01', reason: '계약 만료 폐업', oldStatus: 'NORMAL', newStatus: 'NORMAL', changer: '한제주' }
        ],
        monthlyRevenue: 0, growthRate: 0
    },
];
