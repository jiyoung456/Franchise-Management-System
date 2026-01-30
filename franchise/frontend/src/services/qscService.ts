import { QSCTemplate, Inspection, QSCItem } from '@/types';
import api from '@/lib/api';

const KEY_TEMPLATES = 'fms_qsc_templates';
const KEY_INSPECTIONS = 'fms_inspections';

// Helper to map backend inspection types to Korean
const inspectionTypeMap: Record<string, '정기' | '특별' | '재점검'> = {
    'REGULAR': '정기',
    'SPECIAL': '특별',
    'REINSPECTION': '재점검'
};

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
            // QscTemplateController is at /qsc/inspection/new (Bypassing /api)
            const response = await api.get('/qsc/inspection/new', { baseURL: 'http://localhost:8080' });
            const data = response.data || [];

            return data.map((item: any) => ({
                id: item.templateId.toString(),
                title: item.templateName,
                description: '백엔드 연동 템플릿',
                version: item.version,
                type: inspectionTypeMap[item.inspectionType] || '정기',
                scope: '전체 매장', // Default as not in Summary DTO
                items: [],
                isActive: true
            }));
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            return [];
        }
    },

    // 템플릿 상세 조회 (카테고리 및 문항 포함)
    getTemplateDetail: async (templateId: string): Promise<QSCTemplate | undefined> => {
        try {
            // QscTemplateDetailController is at /qsc/templates/{id} (Bypassing /api)
            const response = await api.get(`/qsc/templates/${templateId}`, { baseURL: 'http://localhost:8080' });
            const data = response.data;

            if (!data) return undefined;

            // Flatten items for legacy support while keeping categories
            const allItems: QSCItem[] = [];
            const categories = data.categories.map((cat: any) => {
                const catItems = cat.items.map((item: any) => ({
                    id: item.templateItemId.toString(),
                    categoryId: cat.templateCategoryId.toString(),
                    name: item.itemName,
                    weight: 5, // Default weight as not in DTO
                    inputType: 'SCORE',
                    isRequired: item.isRequired,
                    sortOrder: item.sortOrder
                }));
                allItems.push(...catItems);
                return {
                    id: cat.templateCategoryId.toString(),
                    code: cat.categoryCode,
                    name: cat.categoryName,
                    weight: cat.categoryWeight,
                    items: catItems
                };
            });

            return {
                id: data.templateId.toString(),
                title: data.templateName,
                version: data.version,
                type: inspectionTypeMap[data.inspectionType] || '정기',
                items: allItems,
                categories: categories
            };
        } catch (error) {
            console.error(`Failed to fetch template detail (${templateId}):`, error);
            return undefined;
        }
    },

    getTemplate: (id: string): QSCTemplate | undefined => {
        return undefined;
    },

    saveTemplate: (template: QSCTemplate) => {
    },

    deleteTemplate: (id: string) => {
    },

    // Inspections
    getInspections: (): Inspection[] => {
        return [];
    },

    getInspection: (id: string): any | undefined => {
        return undefined;
    },

    // 점포별 QSC 점검 목록 조회
    getStoreQscList: async (storeId: number): Promise<Inspection[]> => {
        try {
            // QscController is at /api/qsc/stores/{id}
            const response = await api.get(`/qsc/stores/${storeId}?limit=100`);
            const data = response.data.data || [];

            return data.map((item: any) => ({
                id: item.inspectionId.toString(),
                date: item.inspectedAt ? item.inspectedAt.split('T')[0] : '',
                storeId: item.storeId.toString(),
                storeName: '',
                region: '',
                sv: '',
                type: '정기', // Default as type not in QscResponse
                score: item.totalScore,
                grade: item.grade,
                isPassed: item.isPassed,
                isReinspectionNeeded: item.needsReinspection,
                inspector: item.inspectorId.toString(),
                status: item.status === 'CONFIRMED' ? '완료' : '작성중',
                templateId: item.templateId.toString(),
                summaryComment: item.summaryComment
            })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        } catch (error) {
            console.error('Failed to fetch QSC inspections:', error);
            return [];
        }
    },

    // 상세 조회
    getInspectionDetail: async (storeId: number, inspectionId: string): Promise<any | undefined> => {
        const list = await QscService.getStoreQscList(storeId);
        const found = list.find(i => i.id === inspectionId);

        if (found) {
            return {
                ...found,
                answers: [],
                overallPhotos: [],
                overallComment: found.summaryComment || ''
            };
        }
        return undefined;
    },

    // 대시보드용: 점포별 최신 QSC 데이터
    getDashboardStats: async (stores: any[]): Promise<Inspection[]> => {
        const promises = stores.map(async store => {
            try {
                // /api/qsc/stores/{id}/latest
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
            }
            return null;
        });

        const results = await Promise.all(promises);
        return results.filter(r => r !== null) as Inspection[];
    },

    saveInspection: async (inspection: any) => {
        // Backend save not yet fully identified, keep log
        console.warn('saveInspection: Backend integration pending for submission logic.');
        return false;
    }
};
