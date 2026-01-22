'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, Save, User, Calendar, ArrowLeft } from 'lucide-react';
import { FIXED_QSC_CATEGORIES, MOCK_TEMPLATES } from '@/lib/mock/mockQscData';
import { QSCItem } from '@/types';
import { QscService } from '@/services/qscService';

export default function EditTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({
        title: '',
        scope: '전체 매장',
        isActive: true,
        createdBy: '로딩중...',
    });

    // Items State
    const [items, setItems] = useState<QSCItem[]>([]);

    // Adding State
    const [addingTarget, setAddingTarget] = useState<{ catId: string, subCat: string } | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [isNewItemRequired, setIsNewItemRequired] = useState(true);

    // Load Existing Template Data
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const template = QscService.getTemplate(id);
            if (template) {
                setBasicInfo({
                    title: template.title,
                    scope: template.scope as any || '전체 매장',
                    isActive: template.isActive,
                    createdBy: template.createdBy
                });
                setItems(template.items);
            } else {
                // Handle not found
                alert('템플릿을 찾을 수 없습니다.');
                router.push('/qsc/templates');
            }
        }
    }, [id, router]);

    const handleSave = () => {
        if (!basicInfo.title) return alert('템플릿 명을 입력해주세요.');
        if (items.length === 0) return alert('최소 1개 이상의 점검 항목을 등록해주세요.');

        // Get existing template to preserve immutable fields like ID, CreatedAt
        const existing = QscService.getTemplate(id);
        if (!existing) return;

        const updatedTemplate = {
            ...existing,
            title: basicInfo.title,
            scope: basicInfo.scope as any,
            isActive: basicInfo.isActive,
            updatedAt: new Date().toISOString().split('T')[0],
            items: items
        };

        QscService.saveTemplate(updatedTemplate);

        alert('템플릿이 수정되었습니다.');
        router.push(`/qsc/templates`);
    };

    const startAdding = (catId: string, subCat: string) => {
        setAddingTarget({ catId, subCat });
        setNewItemName('');
        setIsNewItemRequired(true);
    };

    const saveNewItem = () => {
        if (!newItemName.trim() || !addingTarget) return;

        const newItem: QSCItem = {
            id: Date.now().toString(),
            categoryId: addingTarget.catId,
            subcategory: addingTarget.subCat,
            name: newItemName,
            weight: 5,
            inputType: 'SCORE',
            isRequired: isNewItemRequired
        };

        setItems([...items, newItem]);
        setNewItemName('');
    };

    const cancelAdding = () => {
        setAddingTarget(null);
        setNewItemName('');
    };

    const deleteItem = (itemId: string) => {
        if (confirm('이 항목을 삭제하시겠습니까?')) {
            setItems(items.filter(i => i.id !== itemId));
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-24 space-y-8 relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-gray-200 sticky top-0 bg-gray-50/95 backdrop-blur z-10 pt-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">템플릿 수정</h1>
                    <p className="text-sm text-gray-500 mt-1">기존 템플릿의 항목을 수정하거나 추가합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        수정 완료
                    </button>
                </div>
            </div>

            {/* Basic Info Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                    <h2 className="font-bold text-lg text-gray-900">템플릿 기본 정보</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500">템플릿 명 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            value={basicInfo.title}
                            onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">적용 범위</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                            value={basicInfo.scope}
                            onChange={(e) => setBasicInfo({ ...basicInfo, scope: e.target.value as any })}
                        >
                            <option>전체 매장</option>
                            <option>서울/경기 권역</option>
                            <option>선택 매장</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">상태 설정</label>
                        <div className="flex items-center gap-3 h-[42px]">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={basicInfo.isActive}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, isActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ms-3 text-sm font-medium text-gray-900">{basicInfo.isActive ? '활성 (사용 중)' : '비활성'}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Categories Loop */}
            <div className="space-y-8">
                {Object.values(FIXED_QSC_CATEGORIES).map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                        {/* Main Category Header */}
                        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                                <span className={`w-3 h-8 rounded-sm ${cat.id === 'quality' ? 'bg-blue-500' :
                                    cat.id === 'service' ? 'bg-green-500' :
                                        cat.id === 'hygiene' ? 'bg-purple-500' :
                                            cat.id === 'brand' ? 'bg-orange-500' :
                                                'bg-red-500'
                                    }`}></span>
                                {cat.label}
                            </h3>
                            <span className="text-sm font-medium text-gray-500">
                                총 {items.filter(i => i.categoryId === cat.id).length} 항목
                            </span>
                        </div>

                        {/* Subcategories */}
                        <div className="p-6 grid grid-cols-1 gap-8">
                            {cat.subcategories.map((subCat) => {
                                const subItems = items.filter(i => i.categoryId === cat.id && i.subcategory === subCat);
                                const isAdding = addingTarget?.catId === cat.id && addingTarget?.subCat === subCat;

                                return (
                                    <div key={subCat} className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                            <h4 className="font-bold text-gray-700 text-md flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                {subCat}
                                            </h4>
                                            {!isAdding && (
                                                <button
                                                    onClick={() => startAdding(cat.id, subCat)}
                                                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" /> 항목 추가
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {subItems.length === 0 && !isAdding && (
                                                <div className="text-xs text-gray-400 italic py-2 pl-4">
                                                    등록된 점검 항목이 없습니다.
                                                </div>
                                            )}

                                            {/* Item List */}
                                            {subItems.map((item, idx) => (
                                                <div key={item.id} className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white transition-all">
                                                    <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                                        {item.isRequired && (
                                                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                                                필수
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => deleteItem(item.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Adding Input */}
                                            {isAdding && (
                                                <div className="flex flex-col gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-top-1">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            className="flex-1 bg-white border border-gray-300 rounded text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="점검 항목 내용을 입력하세요"
                                                            value={newItemName}
                                                            onChange={(e) => setNewItemName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveNewItem();
                                                                if (e.key === 'Escape') cancelAdding();
                                                            }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                                                            <input
                                                                type="checkbox"
                                                                checked={isNewItemRequired}
                                                                onChange={(e) => setIsNewItemRequired(e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                            />
                                                            <span className="text-xs font-bold text-gray-600 group-hover:text-blue-700">필수 항목 설정</span>
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={cancelAdding}
                                                                className="px-3 py-1.5 bg-white text-gray-500 border border-gray-300 rounded text-xs font-bold hover:bg-gray-50"
                                                            >
                                                                취소
                                                            </button>
                                                            <button
                                                                onClick={saveNewItem}
                                                                disabled={!newItemName.trim()}
                                                                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                                                            >
                                                                추가
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
