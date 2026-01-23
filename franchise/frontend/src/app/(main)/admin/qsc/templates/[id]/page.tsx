'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StorageService, QSCTemplate, QSCItem } from '@/lib/storage';
import { FIXED_QSC_CATEGORIES } from '@/lib/mock/mockQscData';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, CheckCircle, Info } from 'lucide-react';

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // In Next.js 15, params is a Promise. We need to unwrap it.

    const [templateId, setTemplateId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState<QSCTemplate>({
        id: '',
        title: '',
        description: '',
        version: `Regular_${new Date().toISOString().slice(2, 4)}${new Date().toISOString().slice(5, 7)}${new Date().toISOString().slice(8, 10)}`, // Default: Regular_YYMMDD
        scope: '전체 매장',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: null,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: '김관리', // Mock User
        items: []
    });

    // Unwrap params
    useEffect(() => {
        params.then(unwrapped => {
            setTemplateId(unwrapped.id);
            if (unwrapped.id !== 'new') {
                StorageService.init();
                const found = StorageService.getTemplate(unwrapped.id);
                if (found) {
                    setForm(found);
                } else {
                    alert('템플릿을 찾을 수 없습니다.');
                    router.push('/admin/qsc/templates');
                }
            } else {
                // Initialize ID for new template
                setForm(prev => ({ ...prev, id: `tpl_${Date.now()}` }));
            }
            setIsLoading(false);
        });
    }, [params, router]);

    const handleSave = () => {
        if (!form.title) {
            alert('템플릿 명칭을 입력해주세요.');
            return;
        }

        // Validate Constraints
        const qItems = form.items.filter(i => i.categoryId === 'quality').length;
        const sItems = form.items.filter(i => i.categoryId === 'service').length;
        const hItems = form.items.filter(i => i.categoryId === 'hygiene').length;
        const otherItems = form.items.filter(i => i.categoryId === 'brand' || i.categoryId === 'safety').length;

        if (qItems !== 6) { alert(`품질(Quality) 항목은 정확히 6개여야 합니다. (현재: ${qItems}개)`); return; }
        if (sItems !== 6) { alert(`서비스(Service) 항목은 정확히 6개여야 합니다. (현재: ${sItems}개)`); return; }
        if (hItems !== 6) { alert(`위생(Hygiene) 항목은 정확히 6개여야 합니다. (현재: ${hItems}개)`); return; }
        if (otherItems !== 2) { alert(`안전(Safety) 항목은 합계 정확히 2개여야 합니다. (현재: ${otherItems}개)`); return; }

        StorageService.saveTemplate(form);
        alert('저장되었습니다.');
        router.push('/admin/qsc/templates');
    };

    const handleDeleteItem = (itemId: string) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.filter(i => i.id !== itemId)
        }));
    };

    const handleUpdateItem = (itemId: string, field: keyof QSCItem, value: any) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
        }));
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    const categories = [
        FIXED_QSC_CATEGORIES.quality,
        FIXED_QSC_CATEGORIES.service,
        FIXED_QSC_CATEGORIES.hygiene,
    ];

    const otherCategories = [FIXED_QSC_CATEGORIES.safety];


    const updateVersion = (newType: string) => {
        const typeMap: Record<string, string> = { '정기 점검': 'R', '특별 점검': 'S' };
        const prefix = typeMap[newType] || 'R';

        // Get all templates to find max version
        const allTemplates = StorageService.getTemplates();
        const sameTypeTemplates = allTemplates.filter(t => t.version.startsWith(prefix + '_'));

        let maxVer = 0;
        sameTypeTemplates.forEach(t => {
            const parts = t.version.split('_');
            if (parts.length > 1) {
                const verNum = parseFloat(parts[1]);
                if (!isNaN(verNum) && verNum > maxVer) {
                    maxVer = verNum;
                }
            }
        });

        const nextVer = maxVer + 1;

        setForm(prev => ({
            ...prev,
            type: newType,
            version: `${prefix}_${nextVer}.0`
        }));
    };

    const renderCategoryBlock = (cat: typeof FIXED_QSC_CATEGORIES.quality, isOtherGroup = false) => {
        // For Other Group (Brand/Safety), we count them together
        const targetItems = isOtherGroup
            ? form.items.filter(i => i.categoryId === 'brand' || i.categoryId === 'safety')
            : form.items.filter(i => i.categoryId === cat.id);

        const currentCount = targetItems.length;
        const limit = isOtherGroup ? 2 : 6;
        const canAddItem = currentCount < limit;

        // Subcategories for this specific category ID
        const myItems = form.items.filter(i => i.categoryId === cat.id);
        const subcategories = Array.from(new Set(myItems.map(i => i.subcategory)));

        return (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            {cat.label}
                            {/* Show count only for the main block leader or combined */}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${currentCount === limit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {isOtherGroup ? `Other 합계 ${currentCount} / ${limit}` : `${currentCount} / ${limit}`}
                            </span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                            대분류는 고정입니다. 하위에 중분류를 추가하여 항목을 구성하세요.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            const newSub = prompt('새로운 중분류 명칭을 입력하세요:');
                            if (newSub) {
                                if (!canAddItem) {
                                    alert(`항목 수 제한(${limit}개)에 도달했습니다.`);
                                    return;
                                }
                                const newItem: QSCItem = {
                                    id: `item_${Date.now()}`,
                                    categoryId: cat.id,
                                    subcategory: newSub,
                                    name: '새 항목',
                                    weight: 5,
                                    inputType: 'SCORE',
                                    isRequired: false
                                };
                                setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
                            }
                        }}
                        className="text-xs flex items-center gap-1 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-bold text-gray-700 transition-colors"
                    >
                        <Plus className="w-3 h-3" /> 중분류 추가
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {subcategories.length === 0 && (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                            등록된 중분류가 없습니다. 우측 상단 버튼을 눌러 추가하세요.
                        </div>
                    )}

                    {subcategories.map(sub => (
                        <div key={sub} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            {/* Subcategory Header */}
                            <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Middle Category</span>
                                        <input
                                            type="text"
                                            value={sub}
                                            onChange={(e) => {
                                                const newName = e.target.value;
                                                setForm(prev => ({
                                                    ...prev,
                                                    items: prev.items.map(i =>
                                                        (i.categoryId === cat.id && i.subcategory === sub)
                                                            ? { ...i, subcategory: newName }
                                                            : i
                                                    )
                                                }));
                                            }}
                                            className="font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            if (!canAddItem) {
                                                alert(`항목 수 제한(${limit}개)에 도달했습니다.`);
                                                return;
                                            }
                                            const newItem: QSCItem = {
                                                id: `item_${Date.now()}_${Math.random()}`,
                                                categoryId: cat.id,
                                                subcategory: sub,
                                                name: '새 항목',
                                                weight: 5,
                                                inputType: 'SCORE',
                                                isRequired: false
                                            };
                                            setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-1 bg-blue-50 rounded"
                                    >
                                        + 항목 추가
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`'${sub}' 중분류와 포함된 모든 항목을 삭제하시겠습니까?`)) {
                                                setForm(prev => ({
                                                    ...prev,
                                                    items: prev.items.filter(i => !(i.categoryId === cat.id && i.subcategory === sub))
                                                }));
                                            }
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 bg-red-50 p-1 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="divide-y divide-gray-100 bg-white">
                                {myItems.filter(i => i.subcategory === sub).map((item, idx) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-gray-50 group transition-colors">
                                        <div className="col-span-1 text-center text-xs text-gray-400 font-mono">
                                            {idx + 1}
                                        </div>
                                        <div className="col-span-9 flex items-center gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                                                    className="w-full text-sm border-b border-transparent focus:border-blue-500 bg-transparent focus:outline-none py-1"
                                                    placeholder="점검 항목 내용을 입력하세요..."
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleUpdateItem(item.id, 'isRequired', !item.isRequired)}
                                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-all ${item.isRequired ? 'bg-red-100 text-red-600 font-bold' : 'text-gray-400 hover:bg-gray-100'}`}
                                                title="중요 항목 설정 (필수)"
                                            >
                                                <CheckCircle className={`w-3 h-3 ${item.isRequired ? 'fill-current' : ''}`} />
                                                {item.isRequired ? '중요' : '일반'}
                                            </button>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">5점</span>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            {templateId === 'new' ? '새 템플릿 생성' : '템플릿 수정'}
                        </h1>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center"
                >
                    <Save className="w-4 h-4 mr-2" />
                    저장하기
                </button>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                    <strong>템플릿 작성 규칙 안내</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>총 100점 만점 기준을 위해 항목 수가 고정되어 있습니다.</li>
                        <li>Q(품질), S(서비스), C(청결) 각 6문항</li>
                        <li>기타(안전) 합계 2문항 (총 20문항 × 5점 = 100점)</li>
                    </ul>
                </div>
            </div>

            {/* Meta Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">템플릿 명칭</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="예: 2024 상반기 정기 점검"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">생성일시</label>
                            <input
                                type="text"
                                value={form.createdAt}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">생성자</label>
                            <input
                                type="text"
                                value={form.createdBy}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">점검 유형</label>
                            <select
                                value={form.type}
                                onChange={(e) => updateVersion(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">선택하세요</option>
                                <option value="정기 점검">정기 점검 (R)</option>
                                <option value="특별 점검">특별 점검 (S)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">적용 범위</label>
                            <select
                                value={form.scope}
                                onChange={(e) => setForm({ ...form, scope: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="전체 매장">전체 매장</option>
                                <option value="브랜드 공통">브랜드 공통</option>
                                <option value="서울/경기">서울/경기 (지역)</option>
                                <option value="직영점">직영점</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">버전 (자동 생성)</label>
                            <input
                                type="text"
                                value={form.version}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-blue-50/50 text-blue-800 font-mono font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">상태 설정</label>
                            <div className="flex items-center gap-4 mt-2">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.effective_to === null}
                                        onChange={(e) => {
                                            const isActive = e.target.checked;
                                            setForm({
                                                ...form,
                                                effective_to: isActive ? null : new Date().toISOString().split('T')[0]
                                            });
                                        }}
                                        className="sr-only peer"
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-700">
                                        {form.effective_to === null ? '활성 (Active)' : '비활성 (Inactive)'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Editors */}
            <div className="space-y-8">
                {categories.map(cat => renderCategoryBlock(cat))}

                {/* Other (Brand + Safety) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">기타 (안전) - 합계 2문항</h2>
                    <div className="space-y-8">
                        {otherCategories.map(cat => renderCategoryBlock(cat, true))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function generateStaticParams() {
    return [{ id: 'new' }];
}
