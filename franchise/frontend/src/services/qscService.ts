import { QSCTemplate, Inspection } from '@/types';
import api from '@/lib/api';

const KEY_TEMPLATES = 'fms_qsc_templates';
const KEY_INSPECTIONS = 'fms_inspections';

export const QscService = {
    init: () => {
    },

    // Templates
    getTemplates: (): QSCTemplate[] => {
        return [];
    },

    // 백엔드 연동: 활성 템플릿 목록 조회
    getActiveTemplates: async (): Promise<QSCTemplate[]> => {

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
                    items: []
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
        return [];
    },

    getInspection: (id: string): any | undefined => {
        return undefined;
    },

    // 점포별 QSC 점검 목록 조회 (백엔드 API + 로컬 병합)
    getStoreQscList: async (storeId: number): Promise<Inspection[]> => {
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

            return backendInspections.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        } catch (error) {
            console.error('Failed to fetch QSC inspections:', error);
            return [];
        }
    },

    // 상세 조회 (백엔드 연동: storeId 필요)
    getInspectionDetail: async (storeId: number, inspectionId: string): Promise<any | undefined> => {
        // 1. Fetch List
        const list = await QscService.getStoreQscList(storeId);
        const found = list.find(i => i.id === inspectionId);

        if (found) {
            // Assuming we don't have detail API yet, return what we have in the list
            return {
                ...found,
                answers: [],
                overallPhotos: [],
                overallComment: found.summaryComment || ''
            };
        }
        return undefined;
    },

    // 대시보드용: 모든/담당 점포의 최신 QSC 데이터 가져오기 (N+1 Fetch workaround)
    getDashboardStats: async (stores: any[]): Promise<Inspection[]> => {
        // Fetch latest QSC for each store in parallel
        const promises = stores.map(async store => {
            // 1. Get Backend Latest
            try {
                const res = await api.get(`/qsc/stores/${store.id}/latest`);
                const item = res.data.data;
                if (item) {
                    return {
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
                // Ignore backend error
            }
            return null;
        });

        const results = await Promise.all(promises);
        return results.filter(r => r !== null) as Inspection[];
    },

    saveInspection: (inspection: Inspection) => {
        // Backend save not fully implemented without POST endpoint info
        console.warn('saveInspection: Backend integration not completed for save.');
    }
};
