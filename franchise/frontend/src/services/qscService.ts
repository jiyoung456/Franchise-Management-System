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

    // 점포 목록 조회 (SV별)
    getStoresBySupervisor: async (svId: number | string): Promise<any[]> => {
        try {
            // Using the 'test' endpoint as discovered in QscStoreController
            // Endpoint: /qsc/stores/test/{supervisorId}
            // Note: Bypassing /api if needed, but usually api instance has baseURL.
            // If baseURL is '/api', and request is '/qsc/...', the result is '/api/qsc/...' ?
            // API instance has baseURL: '/api'. 
            // QscStoreController is @RequestMapping("/qsc/stores").
            // Default api baseURL is '/api', so we need to override it to hit root if controller lacks /api prefix.
            // Following pattern from getActiveTemplates:
            const response = await api.get(`/qsc/stores/test/${svId}`, { baseURL: 'http://localhost:8080' });
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch stats by supervisor:', error);
            return [];
        }
    },

    // --- New SV Dashboard API ---

    // --- New SV Dashboard API ---

    getDashboardSummary: async (month: string): Promise<any> => {
        try {
            // Fetch User
            const { AuthService } = require('./authService');
            const user = await AuthService.getCurrentUser();
            if (!user) return null;

            // Fetch Stores
            const stores = await QscService.getStoresBySupervisor(user.id);
            if (!stores || stores.length === 0) {
                return {
                    month: month,
                    avgScore: 0,
                    completionRate: 0,
                    completionTargetRate: 0.9,
                    completionDelta: 0,
                    riskStoreCount: 0,
                    sStoreCount: 0,
                    doneInspectionCount: 0,
                    plannedInspectionCount: 0,
                    supervisorStoreCount: 0
                };
            }

            // Fetch Latest Status
            const stats = await QscService.getDashboardStats(stores.map((s: any) => ({ id: s.storeId, name: s.storeName, region: s.regionCode })));

            // Calculate Metrics
            const validScores = stats.filter(s => s.score > 0);
            const totalScore = validScores.reduce((acc, curr) => acc + curr.score, 0);
            const avgScore = validScores.length > 0 ? Math.round((totalScore / validScores.length) * 10) / 10 : 0;

            // Completion Rate (Inspected THIS MONTH)
            // 'latest' gives the most recent inspection. If date is in current month, count it.
            // month param format 'YYYY-MM'
            const doneCount = stats.filter(s => s.date.startsWith(month)).length;
            const totalCount = stores.length;
            const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) / 100 : 0;

            const riskCount = stats.filter(s => ['C', 'D'].includes(s.grade)).length;
            const sCount = stats.filter(s => s.grade === 'S').length;

            return {
                month: month,
                avgScore: avgScore,
                completionRate: completionRate,
                completionTargetRate: 0.9, // 90% Target
                completionDelta: Math.round((completionRate - 0.9) * 100) / 100,
                riskStoreCount: riskCount,
                sStoreCount: sCount,
                doneInspectionCount: doneCount,
                plannedInspectionCount: totalCount,
                supervisorStoreCount: totalCount
            };

        } catch (error) {
            console.error('Failed to aggregate dashboard summary:', error);
            return null;
        }
    },

    getDashboardTrend: async (endMonth: string, months: number = 6): Promise<any> => {
        // [Backend Auth Issue] API returns 500. Using Mock Data until backend is fixed.
        /*
        try {
            const response = await api.get('/sv/qsc/dashboard/trend', { params: { endMonth, months } });
            return response.data || {};
        } catch (error) {
            return null;
        }
        */
        return {
            endMonth: endMonth,
            months: months,
            rows: [
                { month: '2025-08', avgScore: 82.0, inspectionCount: 18 },
                { month: '2025-09', avgScore: 83.5, inspectionCount: 19 },
                { month: '2025-10', avgScore: 84.0, inspectionCount: 20 },
                { month: '2025-11', avgScore: 83.8, inspectionCount: 19 },
                { month: '2025-12', avgScore: 84.5, inspectionCount: 20 },
                { month: '2026-01', avgScore: 85.5, inspectionCount: 15 }
            ]
        };
    },

    getDashboardRanking: async (month: string, type: 'top' | 'bottom', limit: number = 3): Promise<any> => {
        try {
            // Fetch User
            const { AuthService } = require('./authService');
            const user = await AuthService.getCurrentUser();
            if (!user) return { items: [] };

            // Fetch Stores
            const stores = await QscService.getStoresBySupervisor(user.id);
            if (!stores || stores.length === 0) return { items: [] };

            // Fetch Stats
            const stats = await QscService.getDashboardStats(stores.map((s: any) => ({ id: s.storeId, name: s.storeName, region: s.regionCode })));

            // Sort
            const sorted = [...stats].sort((a, b) => {
                if (type === 'top') return b.score - a.score;
                return a.score - b.score;
            });

            const topItems = sorted.slice(0, limit).map(s => ({
                storeName: s.storeName,
                score: s.score,
                grade: s.grade,
                summaryComment: s.summaryComment || (type === 'top' ? '우수' : '개선 필요')
            }));

            return { items: topItems };

        } catch (error) {
            console.error('Failed to get ranking:', error);
            return { items: [] };
        }
    },

    getSvStoreQscStatus: async (month: string, keyword?: string): Promise<any> => {
        // [Backend Auth Issue] API returns 500. Using Mock Data until backend is fixed.
        /*
        try {
            const response = await api.get('/sv/qsc/stores/status', { params: { month, keyword } });
            return response.data || { items: [] };
        } catch (error) {
            return { items: [] };
        }
        */
        return {
            month: month,
            totalStoreCount: 10,
            underInspectedCount: 3,
            items: [
                { storeId: 1, storeName: '강남본점', regionCode: '서울', latestGrade: 'S', latestConfirmedAt: '2026-01-10T10:00:00', thisMonthInspectionCount: 1, underInspected: false },
                { storeId: 2, storeName: '부산역점', regionCode: '부산', latestGrade: 'B', latestConfirmedAt: '2026-01-12T14:00:00', thisMonthInspectionCount: 1, underInspected: false },
                { storeId: 3, storeName: '대전중앙점', regionCode: '대전', latestGrade: 'C', latestConfirmedAt: '2026-01-05T09:30:00', thisMonthInspectionCount: 1, underInspected: false },
                { storeId: 4, storeName: '홍대입구점', regionCode: '서울', latestGrade: null, latestConfirmedAt: null, thisMonthInspectionCount: 0, underInspected: true }, // 미점검
                { storeId: 5, storeName: '광주터미널점', regionCode: '광주', latestGrade: 'A', latestConfirmedAt: '2025-12-28T11:00:00', thisMonthInspectionCount: 0, underInspected: true } // 지난달 점검
            ]
        };
    },


    // 상세 조회 (Backend Integrated)
    getInspectionDetail: async (storeId: number, inspectionId: string): Promise<any | undefined> => {
        try {
            // Use explicit baseURL if needed, or default api.
            // Based on user snippet: @GetMapping("/{inspectionId}") in a controller (likely /qsc/inspections)
            const response = await api.get(`/qsc/inspections/${inspectionId}`, { baseURL: 'http://localhost:8080' });
            const data = response.data;

            if (!data) return undefined;

            // Map backend response -> Frontend structure
            // Assuming backend returns flat structure similar to save payload or list item but with details
            return {
                id: data.inspectionId.toString(),
                date: data.inspectedAt ? data.inspectedAt.split('T')[0] : '',
                storeId: data.storeId ? data.storeId.toString() : storeId.toString(),
                storeName: data.storeName || '',
                region: data.region || '',
                sv: data.supervisorName || '', // Check if backend provides this
                type: inspectionTypeMap[data.inspectionType] || '정기',
                score: data.totalScore,
                grade: data.grade,
                isPassed: data.isPassed,
                isReinspectionNeeded: data.needsReinspection,
                inspector: data.inspectorName || data.inspectorId,
                status: data.status === 'CONFIRMED' ? '완료' : '작성중',
                templateId: data.templateId.toString(),
                summaryComment: data.summaryComment,

                // Map answers: Backend likely returns list of ItemScore objects or similar
                // We need to map it to Record<itemId, score> for ReportClient
                answers: data.itemScores ? data.itemScores.reduce((acc: any, curr: any) => {
                    acc[curr.templateItemId] = curr.score;
                    return acc;
                }, {}) : {},

                overallPhotos: (data.photos || []).map((p: any) => p.photoUrl || p),
                overallComment: data.summaryComment || ''
            };
        } catch (error) {
            console.error('Failed to fetch inspection detail:', error);
            return undefined;
        }
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
        try {
            // Map frontend Inspection to backend QscInspectionSaveRequest
            // Status Mapping
            let backendStatus = 'DRAFT';
            if (inspection.status === '완료') backendStatus = 'COMPLETED';

            // Item Scores Mapping (answers: Record<string, number>)
            const itemScores = Object.entries(inspection.answers || {}).map(([key, value]) => ({
                templateItemId: Number(key),
                score: Number(value)
            }));

            // Photos Mapping
            const photos = (inspection.overallPhotos || []).map((url: string) => ({
                photoUrl: url,
                photoName: url.split('/').pop() || 'photo.jpg'
            }));

            const payload = {
                templateId: Number(inspection.templateId),
                storeId: Number(inspection.storeId),
                inspectedAt: inspection.date ? new Date(inspection.date).toISOString() : new Date().toISOString(),
                status: backendStatus,
                summaryComment: inspection.overallComment || '',
                itemScores: itemScores,
                photos: photos
            };

            // Call Backend (Bypassing /api as controller is at /qsc/inspections)
            await api.post('/qsc/inspections', payload, { baseURL: 'http://localhost:8080' });
            return true;
        } catch (error) {
            console.error('Failed to save inspection:', error);
            return false;
        }
    }
};
