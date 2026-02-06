'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QSCTemplate, QSCItem } from '@/types';
import { adminQscService } from '@/services/adminQscService';
import { AuthService } from '@/services/authService';
import { FIXED_QSC_CATEGORIES } from '@/lib/mock/mockQscData';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Info } from 'lucide-react';

export default function TemplateClient({ id }: { id: string }) {
    const router = useRouter();

console.log("TemplateClient mounted, id =", id);

    const [form, setForm] = useState<QSCTemplate>({
        templateId: '',
        templateName: '',
        description: '',
        version: '',
        scope: '전체 매장',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: null,
        status: 'ACTIVE',
        createdAt: '-',
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: '관리자',
        items: [],
        inspectionType: ''
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            const currentUser = await AuthService.getCurrentUser();

            if (id !== 'new') {
                try {
                    const data = await adminQscService.getTemplateDetail(id);
                    if (data) {
                        // DB 데이터를 불러오되, 생성자는 현재 로그인한 사람으로 덮어씌웁니다.
                        setForm({
                            ...data,
                            createdBy: currentUser?.userName || data.createdBy
                        });
                    }
                } catch (error) {
                    alert('템플릿 정보를 불러오는데 실패했습니다.');
                    router.push('/qsc/templates');
                }
            } else {
                const dateStr = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7) + new Date().toISOString().slice(8, 10);
                setForm(prev => ({
                    ...prev,
                    version: `v${dateStr.slice(0, 1)}.${dateStr.slice(1, 2)}`,
                    createdAt: new Date().toISOString().split('T')[0],
                    createdBy: currentUser?.userName || '관리자'
                }));
            }
            setIsLoading(false);
        };
        fetchInitialData();
    }, [id]);

    const handleSave = async () => {
        if (!form.templateName) {
            alert('템플릿 명칭을 입력해주세요.');
            return;
        }

        try {
            if (id === 'new') {
                await adminQscService.createTemplate(form);
            } else {
                await adminQscService.updateTemplate(id as string, form);
            }
            alert('성공적으로 저장되었습니다.');
            router.push('/qsc/templates');
        } catch (error) {
            console.error('Save failed:', error);
            alert('저장에 실패했습니다.');
        }
    };

    const handleDeleteItem = (itemId: string | number) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.filter(i => i.templateItemId !== itemId)
        }));
    };

    const handleUpdateItem = (itemId: string | number, field: keyof QSCItem, value: any) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.map(i => i.templateItemId === itemId ? { ...i, [field]: value } : i)
        }));
    };

    const addSubcategory = (catId: string) => {
        const name = prompt('중분류 명칭을 입력하세요:');
        if (name) {
            const newItem: QSCItem = {
                templateItemId: `temp_${Date.now()}`,
                itemName: '새 점검 항목',
                isRequired: false,
                sortOrder: form.items.length + 1,
                subcategory: name,
                categoryId: catId,
                weight: 5
            };
            setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
        }
    };

    if (isLoading) return <div className="p-20 text-center text-gray-400">Loading...</div>;

    const mainCategories = [
        FIXED_QSC_CATEGORIES.quality,
        FIXED_QSC_CATEGORIES.service,
        FIXED_QSC_CATEGORIES.hygiene,
    ];

    const renderCategoryBlock = (cat: any) => {
        const items = form.items.filter(i => i.categoryId === cat.id);
        const subcategories = Array.from(new Set(items.map(i => i.subcategory || '기타')));
        const itemCount = items.length;
        const limit = cat.id === 'brand' || cat.id === 'safety' ? 2 : 6;

        return (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                {/* Category Header */}
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">
                            {cat.label} <span className="text-blue-600 ml-1 text-lg">{itemCount}/{limit}</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => addSubcategory(cat.id)}
                        className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> 중분류 추가
                    </button>
                </div>

                <div className="px-6 py-2">
                    <p className="text-xs text-gray-400 font-medium italic">대분류는 고정입니다. 하위에 중분류를 추가하여 항목을 구성하세요.</p>
                </div>

                {/* Subcategories & Items */}
                <div className="p-6 space-y-8">
                    {subcategories.map(sub => (
                        <div key={sub} className="bg-gray-50/30 rounded-2xl border border-gray-100/50 p-6 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-gray-300" />
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">MIDDLE CATEGORY</p>
                                        <h4 className="text-lg font-bold text-gray-800">{sub}</h4>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            const newItem: QSCItem = {
                                                templateItemId: `temp_${Date.now()}_${Math.random()}`,
                                                itemName: '새 점검 항목',
                                                isRequired: false,
                                                sortOrder: form.items.length + 1,
                                                subcategory: sub,
                                                categoryId: cat.id,
                                                weight: 5
                                            };
                                            setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
                                        }}
                                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mr-4"
                                    >
                                        + 항목 추가
                                    </button>
                                    <button className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {items.filter(i => (i.subcategory || '기타') === sub).map((item, idx) => (
                                    <div key={item.templateItemId} className="flex items-center gap-4 py-3 px-4 bg-white rounded-xl border border-gray-50 group hover:border-blue-100 transition-all shadow-sm">
                                        <span className="text-xs font-bold text-gray-300 w-4">{idx + 1}</span>
                                        <input
                                            type="text"
                                            value={item.itemName}
                                            onChange={(e) => handleUpdateItem(item.templateItemId, 'itemName', e.target.value)}
                                            className="flex-1 text-sm font-bold text-gray-700 bg-transparent focus:outline-none"
                                            placeholder="점검 항목 내용을 입력하세요..."
                                        />
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleUpdateItem(item.templateItemId, 'isRequired', !item.isRequired)}
                                                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md transition-all ${item.isRequired ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${item.isRequired ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                                                중요
                                            </button>
                                            <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-md border border-gray-100">
                                                5점
                                            </span>
                                            <button
                                                onClick={() => handleDeleteItem(item.templateItemId)}
                                                className="p-1 text-gray-200 hover:text-red-400 transition-colors"
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
        <div className="max-w-6xl mx-auto space-y-6 pb-20 mt-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/qsc/templates')}
                        className="text-gray-400 hover:text-gray-900 transition-all font-bold"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{id === 'new' ? '템플릿 등록' : '템플릿 수정'}</h1>
                </div>
                <button
                    onClick={handleSave}
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                    <Save className="w-4 h-4" />
                    {id === 'new' ? '등록' : '수정'}
                </button>
            </div>

            {/* Guide Banner */}
            <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-6 flex items-start gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-yellow-600 shadow-sm mt-0.5">
                    <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-yellow-800 text-sm">템플릿 작성 규칙 안내</h4>
                    <ul className="text-xs text-yellow-700/80 space-y-1 font-bold list-disc ml-4">
                        <li>총 100점 만점 기준을 위해 항목 수가 고정되어 있습니다.</li>
                        <li>Q(품질), S(서비스), C(청결) 각 6문항</li>
                        <li>S(안전) 합계 2문항 (총 20문항 x 5점 = 100점)</li>
                    </ul>
                </div>
            </div>

            {/* Basic Information Card */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 mb-10">
                <div className="grid grid-cols-12 gap-x-6 gap-y-6">
                    <div className="col-span-12 lg:col-span-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">템플릿 명칭</label>
                        <input
                            type="text"
                            placeholder="명칭을 입력하세요"
                            value={form.templateName}
                            onChange={(e) => setForm({ ...form, templateName: e.target.value })}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                        />
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">점검 유형</label>
                        <select
                            value={form.inspectionType}
                            onChange={(e) => setForm({ ...form, inspectionType: e.target.value })}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        >
                            <option value="">선택하세요</option>
                            <option value="REGULAR">정기 점검</option>
                            <option value="SPECIAL">특별 점검</option>
                            <option value="REINSPECTION">재점검</option>
                        </select>
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">적용 범위</label>
                        <select
                            value={form.scope}
                            onChange={(e) => setForm({ ...form, scope: e.target.value as any })}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        >
                            <option value="전체 매장">전체 매장</option>
                            <option value="브랜드 공통">브랜드 공통</option>
                        </select>
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">생성일시</label>
                        <input
                            type="date"
                            value={form.createdAt?.split('T')[0] || ''}
                            onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">생성자</label>
                        <input
                            type="text"
                            value={form.createdBy || ''}
                            onChange={(e) => setForm({ ...form, createdBy: e.target.value })}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">버전 정보</label>
                        <div className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-blue-600">
                            {form.version}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">템플릿 상태</label>
                        <div className="h-[46px] flex items-center px-2">
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.status === 'ACTIVE'}
                                    onChange={(e) => setForm({ ...form, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ms-3 text-xs font-bold text-gray-500">활성 (Active)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Editor Components */}
            <div className="space-y-10">
                {mainCategories.map(cat => renderCategoryBlock(cat))}
                {renderCategoryBlock({ id: 'safety', label: '안전 (Safety)' })}
            </div>
        </div>
    );
}
