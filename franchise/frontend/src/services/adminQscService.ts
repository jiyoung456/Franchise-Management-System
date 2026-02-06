import api from '@/lib/api';
import { QSCTemplate, QSCItem } from '@/types';

export const adminQscService = {
    // 템플릿 목록 조회 (DB 데이터 그대로 사용)
    getTemplates: async (params?: { type?: string; status?: string; keyword?: string }) => {
        try {
            console.log("DEBUG: Fetching templates from DB with params:", params);
            const response = await api.get('/admin/qsc/templates', { params });

            // Backend Response: { success: true, data: { items: [...] } }
            if (response.data && response.data.data && Array.isArray(response.data.data.items)) {
                return response.data.data.items.map((item: any) => ({
                    ...item,
                    templateName: item.title || item.templateName || '',
                    status: item.status || (item.isActive ? 'ACTIVE' : 'INACTIVE') || 'ACTIVE'
                }));
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch templates from DB:', error);
            throw error;
        }
    },

    // 템플릿 상세 조회 (DB 데이터 기반 맵핑)
    getTemplateDetail: async (id: number | string): Promise<QSCTemplate> => {
        try {
            const response = await api.get(`/admin/qsc/templates/${id}`);
            const data = response.data.data;

            // UI를 위해 카테고리별 아이템을 평탄화(Flatten) 처리만 수행
            const flattenedItems: QSCItem[] = [];
            if (data.categories) {
                data.categories.forEach((cat: any) => {
                    if (cat.items) {
                        cat.items.forEach((item: any) => {
                            flattenedItems.push({
                                templateItemId: item.templateItemId,
                                itemName: item.itemName,
                                isRequired: item.isRequired,
                                sortOrder: item.sortOrder,
                                subcategory: cat.categoryName,
                                categoryId: mapCodeToFrontendId(cat.categoryCode)
                            });
                        });
                    }
                });
            }

            return {
                ...data,
                templateName: data.title || data.templateName || '',
                status: data.status || 'ACTIVE',
                scope: data.scope === 'ALL' ? '전체 매장' : data.scope === 'BRAND' ? '브랜드 공통' : (data.scope || '전체 매장'),
                createdAt: data.create_at || '-',
                items: flattenedItems
            };
        } catch (error) {
            console.error(`Failed to fetch template detail ${id}:`, error);
            throw error;
        }
    },

    createTemplate: async (template: QSCTemplate) => {
        const payload = mapToUpsertRequest(template);
        const response = await api.post('/admin/qsc/templates', payload);
        return response.data.data;
    },

    updateTemplate: async (id: string, template: QSCTemplate) => {
        const payload = mapToUpsertRequest(template);
        const response = await api.put(`/admin/qsc/templates/${id}`, payload);
        return response.data.data;
    }
};

function mapCodeToFrontendId(code: string): string {
    const map: Record<string, string> = {
        'QUALITY': 'quality',
        'SERVICE': 'service',
        'CLEANLINESS': 'hygiene',
        'SAFETY': 'safety',
        'BRAND': 'brand'
    };
    return map[code] || 'quality';
}

function mapToUpsertRequest(t: QSCTemplate) {
    const categoryMap: Record<string, any[]> = {
        'QUALITY': [], 'SERVICE': [], 'CLEANLINESS': [], 'SAFETY': [], 'BRAND': []
    };

    const idMap: Record<string, string> = {
        'quality': 'QUALITY', 'service': 'SERVICE', 'hygiene': 'CLEANLINESS', 'brand': 'BRAND', 'safety': 'SAFETY'
    };

    t.items.forEach(item => {
        const backendCode = idMap[item.categoryId || 'quality'] || 'QUALITY';
        categoryMap[backendCode].push({
            itemName: item.itemName,
            isRequired: item.isRequired || false,
            sortOrder: item.sortOrder || 0
        });
    });

    const categories = Object.keys(categoryMap)
        .filter(code => categoryMap[code].length > 0)
        .map(code => ({
            categoryCode: code,
            categoryName: getCategoryName(code),
            items: categoryMap[code]
        }));

    return {
        title: t.templateName,
        description: t.description,
        version: t.version,
        inspectionType: t.inspectionType,
        scope: t.scope || 'ALL',
        isActive: t.status === 'ACTIVE',
        effectiveFrom: t.effectiveFrom || new Date().toISOString().split('T')[0],
        effectiveTo: t.effectiveTo,
        categories: categories
    };
}

function getCategoryName(code: string): string {
    const names: Record<string, string> = {
        'QUALITY': '품질(Quality)', 'SERVICE': '서비스(Service)', 'CLEANLINESS': '청결(Cleanliness)', 'SAFETY': '안전(Safety)', 'BRAND': '브랜드(Brand)'
    };
    return names[code] || '기타';
}
