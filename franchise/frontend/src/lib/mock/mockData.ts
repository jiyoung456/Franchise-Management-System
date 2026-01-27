import { Store } from '@/types';

export const MOCK_STORES: Store[] = [
    {
        id: 1, name: '강남역점', region: '서울/경기', supervisor: '김관리',
        qscScore: 92, lastInspectionDate: '2025-11-20',
        description: '', manager: '', storePhone: '',

        // New fields for StoreDetailContent
        state: 'NORMAL',
        currentState: 'NORMAL',
        regionCode: 'SEOUL_GYEONGGI',
        currentSupervisorId: '김관리',
        operationStatus: 'OPEN',
        currentStateScore: 95,
        openedAt: '2023-01-15T09:00:00',
        statusHistory: [
            { date: '2025-11-01', reason: '정기 점검 양호', oldStatus: 'NORMAL', newStatus: 'NORMAL', changer: 'System' }
        ],
        ownerName: '홍길동', ownerPhone: '010-1234-5678',
        address: '서울시 강남구 강남대로 123',
        contractType: '가맹점',
        contractEndAt: '2028-01-14T00:00:00'
    },
    {
        id: 2, name: '홍대입구점', region: '서울/경기', supervisor: '이성실',
        qscScore: 85, lastInspectionDate: null,
        description: '', manager: '', storePhone: '',

        state: 'NORMAL',
        currentState: 'NORMAL',
        regionCode: 'SEOUL_GYEONGGI',
        currentSupervisorId: '이성실',
        operationStatus: 'OPEN',
        currentStateScore: 88,
        openedAt: '2023-03-20T09:00:00',
        statusHistory: [],
        ownerName: '김철수', ownerPhone: '010-1234-5678',
        address: '서울시 마포구 양화로 100',
        contractType: '가맹점',
        contractEndAt: '2028-03-19T00:00:00'
    },
    {
        id: 3, name: '부산서면점', region: '부산/경남', supervisor: '박부산',
        qscScore: 72, lastInspectionDate: '2025-10-15',
        description: '', manager: '', storePhone: '',

        state: 'WATCHLIST',
        currentState: 'WATCHLIST',
        regionCode: 'BUSAN_GYEONGNAM',
        currentSupervisorId: '박부산',
        operationStatus: 'OPEN',
        currentStateScore: 72,
        openedAt: '2022-05-10T09:00:00',
        statusHistory: [
            { date: '2025-10-16', reason: '위생 점검 미흡', oldStatus: 'NORMAL', newStatus: 'WATCHLIST', changer: '박부산' }
        ],
        ownerName: '박영희', ownerPhone: '010-1234-5678',
        address: '부산광역시 부산진구 중앙대로 700',
        contractType: '가맹점',
        contractEndAt: '2027-05-09T00:00:00'
    },
    {
        id: 4, name: '대전둔산점', region: '강원/충청', supervisor: '최대전',
        qscScore: 45, lastInspectionDate: '2025-10-01',
        description: '', manager: '', storePhone: '',

        state: 'RISK',
        currentState: 'RISK',
        regionCode: 'GANGWON_CHUNGCHEONG',
        currentSupervisorId: '최대전',
        operationStatus: 'OPEN',
        currentStateScore: 45,
        openedAt: '2024-01-05T09:00:00',
        statusHistory: [
            { date: '2025-10-02', reason: '점검 불합격 누적', oldStatus: 'WATCHLIST', newStatus: 'RISK', changer: 'System' }
        ],
        ownerName: '이민수', ownerPhone: '010-1234-5678',
        address: '대전광역시 서구 둔산로 50',
        contractType: '위탁점',
        contractEndAt: '2026-01-04T00:00:00'
    },
    {
        id: 5, name: '광주수완점', region: '전라/광주', supervisor: '정광주',
        qscScore: 65, lastInspectionDate: '2025-11-05',
        description: '', manager: '', storePhone: '',

        state: 'WATCHLIST',
        currentState: 'WATCHLIST',
        regionCode: 'JEONLA_GWANGJU',
        currentSupervisorId: '정광주',
        operationStatus: 'OPEN',
        currentStateScore: 68,
        openedAt: '2022-11-15T09:00:00',
        statusHistory: [],
        ownerName: '최자영', ownerPhone: '010-1234-5678',
        address: '광주광역시 광산구 장신로 80',
        contractType: '가맹점',
        contractEndAt: '2027-11-14T00:00:00'
    },
    {
        id: 6, name: '대구동성로점', region: '대구/울산/경북', supervisor: '김대구',
        qscScore: 88, lastInspectionDate: '2025-11-10',
        description: '', manager: '', storePhone: '',

        state: 'NORMAL',
        currentState: 'NORMAL',
        regionCode: 'DAEGU_ULSAN_GYEONGBUK',
        currentSupervisorId: '김대구',
        operationStatus: 'OPEN',
        currentStateScore: 90,
        openedAt: '2023-06-20T09:00:00',
        statusHistory: [],
        ownerName: '강호동', ownerPhone: '010-1234-5678',
        address: '대구광역시 중구 동성로 30',
        contractType: '가맹점',
        contractEndAt: '2028-06-19T00:00:00'
    },
    {
        id: 7, name: '송도센트럴점', region: '서울/경기', supervisor: '김관리',
        qscScore: 95, lastInspectionDate: '2025-11-25',
        description: '', manager: '', storePhone: '',

        state: 'NORMAL',
        currentState: 'NORMAL',
        regionCode: 'SEOUL_GYEONGGI',
        currentSupervisorId: '김관리',
        operationStatus: 'OPEN',
        currentStateScore: 96,
        openedAt: '2024-02-10T09:00:00',
        statusHistory: [],
        ownerName: '유재석', ownerPhone: '010-1234-5678',
        address: '인천광역시 연수구 컨벤시아대로 100',
        contractType: '가맹점',
        contractEndAt: '2029-02-09T00:00:00'
    },
    {
        id: 8, name: '제주공항점', region: '제주', supervisor: '한제주',
        qscScore: 91, lastInspectionDate: '2025-09-20',
        description: '', manager: '', storePhone: '',

        state: 'NORMAL',
        currentState: 'NORMAL',
        regionCode: 'JEJU',
        currentSupervisorId: '한제주',
        operationStatus: 'OPEN',
        currentStateScore: 92,
        openedAt: '2021-08-15T09:00:00',
        statusHistory: [],
        ownerName: '이효리', ownerPhone: '010-1234-5678',
        address: '제주특별자치도 제주시 공항로 2',
        contractType: '직영점',
        contractEndAt: '2099-12-31T00:00:00'
    },
    {
        id: 9, name: '판교역점', region: '서울/경기', supervisor: '이성실',
        qscScore: 55, lastInspectionDate: '2025-12-01',
        description: '', manager: '', storePhone: '',

        state: 'RISK',
        currentState: 'RISK',
        regionCode: 'SEOUL_GYEONGGI',
        currentSupervisorId: '이성실',
        operationStatus: 'CLOSED_TEMPORARY',
        currentStateScore: 50,
        openedAt: '2022-04-01T09:00:00',
        statusHistory: [],
        ownerName: '박명수', ownerPhone: '010-1234-5678',
        address: '경기도 성남시 분당구 판교역로 150',
        contractType: '가맹점',
        contractEndAt: '2027-03-31T00:00:00'
    },
    {
        id: 10, name: '해운대점', region: '부산/경남', supervisor: '박부산',
        qscScore: 82, lastInspectionDate: '2025-10-30',
        description: '', manager: '', storePhone: '',

        state: 'NORMAL',
        currentState: 'NORMAL',
        regionCode: 'BUSAN_GYEONGNAM',
        currentSupervisorId: '박부산',
        operationStatus: 'OPEN',
        currentStateScore: 85,
        openedAt: '2023-07-25T09:00:00',
        statusHistory: [],
        ownerName: '장도연', ownerPhone: '010-1234-5678',
        address: '부산광역시 해운대구 해운대해변로 200',
        contractType: '가맹점',
        contractEndAt: '2028-07-24T00:00:00'
    },
    {
        id: 11, name: '서초역점', region: '서울/경기', supervisor: '김관리',
        qscScore: 94, lastInspectionDate: '2025-11-28',
        description: '', manager: '', storePhone: '',

        state: 'NORMAL',
        currentState: 'NORMAL',
        regionCode: 'SEOUL_GYEONGGI',
        currentSupervisorId: '김관리',
        operationStatus: 'OPEN',
        currentStateScore: 94,
        openedAt: '2023-09-01T09:00:00',
        statusHistory: [],
        ownerName: '신동엽', ownerPhone: '010-1234-5678',
        address: '서울시 서초구 서초대로 250',
        contractType: '가맹점',
        contractEndAt: '2028-08-31T00:00:00'
    },
    {
        id: 12, name: '잠실역점', region: '서울/경기', supervisor: '김관리',
        qscScore: 78, lastInspectionDate: '2025-10-05',
        description: '', manager: '', storePhone: '',

        state: 'WATCHLIST',
        currentState: 'WATCHLIST',
        regionCode: 'SEOUL_GYEONGGI',
        currentSupervisorId: '김관리',
        operationStatus: 'OPEN',
        currentStateScore: 79,
        openedAt: '2022-12-10T09:00:00',
        statusHistory: [],
        ownerName: '김구라', ownerPhone: '010-1234-5678',
        address: '서울시 송파구 올림픽로 300',
        contractType: '가맹점',
        contractEndAt: '2027-12-09T00:00:00'
    }
];
