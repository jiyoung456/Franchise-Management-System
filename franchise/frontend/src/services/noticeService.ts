import { Notice } from '@/types';

const STORAGE_KEY = 'fms_notices';

const MOCK_NOTICES: Notice[] = [
    {
        id: '1',
        title: '[필독] 2026년 상반기 위생 점검 가이드라인 배포',
        content: '2026년 상반기 위생 점검 가이드라인입니다. 첨부드린 파일을 확인하고 숙지 바랍니다.\n\n주요 변경 사항:\n1. 개인 위생 점검 항목 강화\n2. 주방 기기 청결 기준 세분화',
        author: '김관리',
        date: '2025-12-28T09:00:00',
        role: 'ADMIN',
        isImportant: true,
        viewCount: 142
    },
    {
        id: '2',
        title: '설 연휴 기간 매장 운영 지침 안내',
        content: '설 연휴 기간 매장 운영에 대한 본사 지침입니다. 특이 사항 발생 시 SV에게 즉시 보고 바랍니다.',
        author: '박본사',
        date: '2026-01-10T14:30:00',
        role: 'ADMIN',
        isImportant: false,
        viewCount: 56
    }
];

export const NoticeService = {
    init: () => {
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_NOTICES));
        }
    },

    getNotices: (): Notice[] => {
        if (typeof window === 'undefined') return MOCK_NOTICES;
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : MOCK_NOTICES;
    },

    getNotice: (id: string): Notice | undefined => {
        const notices = NoticeService.getNotices();
        return notices.find(n => n.id === id);
    },

    saveNotice: (notice: Notice) => {
        const notices = NoticeService.getNotices();
        const index = notices.findIndex(n => n.id === notice.id);

        if (index !== -1) {
            notices[index] = notice;
        } else {
            notices.unshift(notice); // Add new to top
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
    },

    deleteNotice: (id: string) => {
        const notices = NoticeService.getNotices();
        const newNotices = notices.filter(n => n.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotices));
    },

    incrementNoticeView: (id: string) => {
        const notices = NoticeService.getNotices();
        const index = notices.findIndex(n => n.id === id);
        if (index !== -1) {
            notices[index].viewCount += 1;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
        }
    }
};
