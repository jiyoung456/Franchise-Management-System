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
    };
    return map[code] || 'quality';
}

function mapToUpsertRequest(t: QSCTemplate) {
  const idMap: Record<string, 'QUALITY'|'SERVICE'|'CLEANLINESS'|'SAFETY'> = {
    quality: 'QUALITY',
    service: 'SERVICE',
    hygiene: 'CLEANLINESS',
    safety: 'SAFETY',
  };

  const requiredCodes: Array<'QUALITY'|'SERVICE'|'CLEANLINESS'|'SAFETY'> =
    ['QUALITY','SERVICE','CLEANLINESS','SAFETY'];

  const weights: Record<typeof requiredCodes[number], number> = {
    QUALITY: 30, SERVICE: 30, CLEANLINESS: 30, SAFETY: 10,
  };

  const names: Record<typeof requiredCodes[number], string> = {
    QUALITY: '품질(Quality)',
    SERVICE: '서비스(Service)',
    CLEANLINESS: '청결(Cleanliness)',
    SAFETY: '안전(Safety)',
  };

  // 1) 아이템을 카테고리별로 모으기
  const bucket: Record<typeof requiredCodes[number], any[]> = {
    QUALITY: [], SERVICE: [], CLEANLINESS: [], SAFETY: [],
  };

  (t.items ?? []).forEach((item) => {
    const code = idMap[item.categoryId || 'quality'] || 'QUALITY';
    bucket[code].push(item);
  });

  // 2) 카테고리별 sortOrder를 1..N으로 강제 부여(중복 방지)
  const categories = requiredCodes.map((code) => {
    const items = bucket[code].map((item, idx) => ({
      itemName: item.itemName,
      isRequired: item.isRequired ?? false,
      sortOrder: idx + 1,
    }));

    return {
      categoryCode: code,
      categoryName: names[code],
      categoryWeight: weights[code],
      items,
    };
  });

  return {
    templateName: t.templateName,
    inspectionType: t.inspectionType,
    version: t.version,
    effectiveFrom: t.effectiveFrom,     // "YYYY-MM-DD"
    effectiveTo: t.effectiveTo ?? null,
    passScoreMin: 80,
    status: t.status ?? 'ACTIVE',
    scope: mapScope(t.scope),           // {scopeType, scopeRefId}
    categories,
  };
}


function mapScope(scope?: string) {
  // UI 문자열을 백엔드 enum으로 매핑
  // 지금 UI는 "전체 매장", "브랜드 공통" 같은 값을 쓰고 있음
  if (!scope || scope === '전체 매장') return { scopeType: 'GLOBAL', scopeRefId: null };
  if (scope === '브랜드 공통') return { scopeType: 'GLOBAL', scopeRefId: null }; // 정책에 따라 바꿔도 됨
  return { scopeType: 'GLOBAL', scopeRefId: null };
}

function getCategoryWeight(code: string): number {
  // 너희 규칙: Q/S/C 각 30, 안전 10(2문항), 총합 100 같은 정책이면 이렇게
  const weights: Record<string, number> = {
    QUALITY: 30,
    SERVICE: 30,
    CLEANLINESS: 30,
    SAFETY: 10,
  };
  return weights[code] ?? 0;
}


function getCategoryName(code: string): string {
    const names: Record<string, string> = {
        'QUALITY': '품질(Quality)', 'SERVICE': '서비스(Service)', 'CLEANLINESS': '청결(Cleanliness)', 'SAFETY': '안전(Safety)',
    };
    return names[code] || '기타';
}
