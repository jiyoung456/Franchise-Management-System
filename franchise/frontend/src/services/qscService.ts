import { QSCTemplate, Inspection } from '@/types';
import { MOCK_TEMPLATES, MOCK_INSPECTIONS, getMockInspectionDetails } from '@/lib/mock/mockQscData';
import { StoreService } from './storeService';
import api from '@/lib/api';

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

const KEY_TEMPLATES = 'fms_qsc_templates';
const KEY_INSPECTIONS = 'fms_inspections';

export const QscService = {
    init: () => {
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(KEY_TEMPLATES)) {
            localStorage.setItem(KEY_TEMPLATES, JSON.stringify(MOCK_TEMPLATES));
        }
        if (!localStorage.getItem(KEY_INSPECTIONS)) {
            localStorage.setItem(KEY_INSPECTIONS, JSON.stringify(MOCK_INSPECTIONS));
        }
    },

    // Templates
    getTemplates: (): QSCTemplate[] => {
        if (typeof window === 'undefined') return MOCK_TEMPLATES;
        const json = localStorage.getItem(KEY_TEMPLATES);
        return json ? JSON.parse(json) : MOCK_TEMPLATES;
    },

    // 백엔드 연동: 활성 템플릿 목록 조회
    getActiveTemplates: async (): Promise<QSCTemplate[]> => {
        if (USE_MOCK_API) {
            return QscService.getTemplates();
        }

        try {
            // NOTE: QscTemplateController is at /qsc/inspection/new (NOT /api/qsc/...)
            // So we need to bypass the default baseURL
            const response = await api.get('/qsc/inspection/new', { baseURL: 'http://localhost:8080' });
            // Backend returns List<QscTemplateSummaryResponse>
            const data = response.data.data || response.data || [];

            // Map backend inspection types to Korean
            const inspectionTypeMap: Record<string, '정기' | '특별' | '재점검'> = {
                'REGULAR': '정기',
                'SPECIAL': '특별',
                'REINSPECTION': '재점검'
            };

            const backendTemplates = data.map((item: any) => {
                // Backend template doesn't have items. Use default mock items for now.
                const mockTemplate = MOCK_TEMPLATES[0]; // Use first template as baseline

                return {
                    id: item.templateId.toString(),
                    title: item.templateName,
                    description: '백엔드 연동 템플릿',
                    version: item.version,
                    type: inspectionTypeMap[item.inspectionType] || '정기',
                    scope: '전체 매장',
                    effective_from: '2024-01-01',
                    effective_to: null,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'Admin',
                    items: mockTemplate.items // Use default items (backend doesn't provide items yet)
                };
            });

            // Return ONLY backend templates (no mock mixing)
            return backendTemplates;
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            // Fallback to local only on error
            return QscService.getTemplates();
        }
    },

    getTemplate: (id: string): QSCTemplate | undefined => {
        const templates = QscService.getTemplates();
        return templates.find(t => t.id === id);
    },

    saveTemplate: (template: QSCTemplate) => {
        const templates = QscService.getTemplates();
        const index = templates.findIndex(t => t.id === template.id);

        if (index !== -1) {
            templates[index] = template;
        } else {
            templates.push(template);
        }
        localStorage.setItem(KEY_TEMPLATES, JSON.stringify(templates));
    },

    deleteTemplate: (id: string) => {
        const templates = QscService.getTemplates();
        const newTemplates = templates.filter(t => t.id !== id);
        localStorage.setItem(KEY_TEMPLATES, JSON.stringify(newTemplates));
    },

    // Inspections
    getInspections: (): Inspection[] => {
        if (typeof window === 'undefined') return MOCK_INSPECTIONS;
        const json = localStorage.getItem(KEY_INSPECTIONS);
        return json ? JSON.parse(json) : MOCK_INSPECTIONS;
    },

    getInspection: (id: string): any | undefined => {
        const inspections = QscService.getInspections();
        const found = inspections.find(i => i.id === id);

        if (found) {
            // Merge with details if available (for demo consistency)
            const details = getMockInspectionDetails(id);
            return { ...found, ...details };
        }

        // Fallback for new/unknown IDs (Demo Mode)
        // If ID looks like a timestamp or just unknown, generate a mock result
        const details = getMockInspectionDetails(id);
        return {
            id,
            date: new Date().toISOString().split('T')[0],
            storeId: '1',
            storeName: '강남역점 (Demo)',
            region: '서울/경기',
            sv: '김관리',
            type: '정기',
            inspector: '김관리',
            status: '완료',
            score: 85,
            grade: 'A',
            isPassed: true,
            isReinspectionNeeded: false,
            templateId: '1',
            ...details
        };
    },

    // 점포별 QSC 점검 목록 조회 (백엔드 API + 로컬 병합)
    getStoreQscList: async (storeId: number): Promise<Inspection[]> => {
        let localInspections: Inspection[] = [];

        // 1. Get Local Storage Data (for newly added items not yet in backend)
        if (typeof window !== 'undefined') {
            const allLocal = QscService.getInspections();
            localInspections = allLocal.filter(i => i.storeId === storeId.toString());
        }

        if (USE_MOCK_API) {
            return localInspections;
        }

        try {
            const response = await api.get(`/qsc/stores/${storeId}?limit=100`);
            // Backend returns ApiResponse wrapper: { success: true, data: [...] }
            const data = response.data.data || response.data || [];

            const backendInspections = data.map((item: any) => ({
                id: item.inspectionId.toString(),
                date: item.inspectedAt ? item.inspectedAt.split('T')[0] : '',
                storeId: item.storeId.toString(),
                storeName: '', // Need to fill separately if needed
                region: '',
                sv: '',
                type: '정기',
                score: item.totalScore,
                grade: item.grade,
                isPassed: item.isPassed,
                isReinspectionNeeded: item.needsReinspection,
                inspector: item.inspectorId.toString(),
                status: item.status === 'CONFIRMED' ? '완료' : '작성중',
                templateId: item.templateId.toString(),
                summaryComment: item.summaryComment
            }));

            // Merge: Local items first (newer) + Backend items
            // Filter out duplicates if any (though IDs should differ)
            const backendIds = new Set(backendInspections.map((i: any) => i.id));
            const uniqueLocal = localInspections.filter(i => !backendIds.has(i.id));

            return [...uniqueLocal, ...backendInspections].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        } catch (error) {
            console.error('Failed to fetch QSC inspections:', error);
            return localInspections;
        }
    },

    // 상세 조회 (백엔드 연동: storeId 필요)
    getInspectionDetail: async (storeId: number, inspectionId: string): Promise<any | undefined> => {
        if (USE_MOCK_API) {
            return QscService.getInspection(inspectionId);
        }

        // 1. Fetch List
        const list = await QscService.getStoreQscList(storeId);
        const found = list.find(i => i.id === inspectionId);

        if (found) {
            // 2. Fetch Mock Details (because backend qsc_master table doesn't have answers/photos in this endpoint context mostly, 
            // or the user said "qsc_master table has history, result". 
            // Assuming QSC Master API only returns master data, not detail answers.
            // But since I CANNOT touch backend, I must rely on what I have.
            // If backend doesn't provide detailed answers, I have to fallback to mock details or empty for answers.
            // Let's use getMockInspectionDetails for answers part to avoid breaking UI, 
            // but use Master data for score/grade/comment etc.
            const details = getMockInspectionDetails(inspectionId);
            return {
                ...found,
                answers: details.answers,
                overallPhotos: details.overallPhotos, // Backend doesn't seem to have photos in QscMaster
                overallComment: found.summaryComment || details.overallComment
            };
        }
        return undefined;
    },

    // 대시보드용: 모든/담당 점포의 최신 QSC 데이터 가져오기 (N+1 Fetch workaround + Local Merge)
    getDashboardStats: async (stores: any[]): Promise<Inspection[]> => {
        let localInspections: Inspection[] = [];
        if (typeof window !== 'undefined') {
            localInspections = QscService.getInspections();
        }

        if (USE_MOCK_API) return MOCK_INSPECTIONS;

        // Fetch latest QSC for each store in parallel
        const promises = stores.map(async store => {
            // 1. Get Backend Latest
            let backendLatest: Inspection | null = null;
            try {
                const res = await api.get(`/qsc/stores/${store.id}/latest`);
                const item = res.data.data;
                if (item) {
                    backendLatest = {
                        id: item.inspectionId.toString(),
                        date: item.inspectedAt ? item.inspectedAt.split('T')[0] : '',
                        storeId: item.storeId.toString(),
                        storeName: store.name,
                        region: store.region,
                        sv: store.supervisor,
                        type: '정기',
                        score: item.totalScore,
                        grade: item.grade,
                        isPassed: item.isPassed,
                        isReinspectionNeeded: item.needsReinspection,
                        inspector: item.inspectorId.toString(),
                        status: item.status,
                        templateId: item.templateId.toString()
                    } as Inspection;
                }
            } catch (e) {
                // Ignore backend error, try local
            }

            // 2. Get Local Latest for this store
            const storeLocals = localInspections.filter(i => i.storeId === store.id.toString());
            // Sort by date desc
            storeLocals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const localLatest = storeLocals.length > 0 ? storeLocals[0] : null;

            // 3. Compare and Pick Newest
            if (!backendLatest && !localLatest) return null;
            if (!backendLatest) return localLatest;
            if (!localLatest) return backendLatest;

            // Compare dates
            const backendDate = new Date(backendLatest.date).getTime();
            const localDate = new Date(localLatest.date).getTime();

            return localDate >= backendDate ? localLatest : backendLatest;
        });

        const results = await Promise.all(promises);
        return results.filter(r => r !== null) as Inspection[];
    },

    saveInspection: (inspection: Inspection) => {
        // Backend save not fully implemented yet without POST endpoint info, keeping local/mock for save
        const inspections = QscService.getInspections();
        const index = inspections.findIndex(i => i.id === inspection.id);
        if (index !== -1) {
            inspections[index] = inspection;
        } else {
            inspections.unshift(inspection);
        }
        localStorage.setItem(KEY_INSPECTIONS, JSON.stringify(inspections));
    }
};
