'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FIXED_QSC_CATEGORIES, QSC_GRADE_CRITERIA } from '@/lib/mock/mockQscData';
import { QSCItem, QSCTemplate } from '@/types';
import { AuthService } from '@/services/authService';
import { StorageService } from '@/lib/storage';
import { Camera, ChevronRight, ChevronLeft, ChevronDown, Trash2, Plus, Info, Search } from 'lucide-react';

export default function NewInspectionPage() {
    const router = useRouter();

    // Steps: 'SELECT_TEMPLATE' -> 'INSPECTION'
    const [step, setStep] = useState<'SELECT_TEMPLATE' | 'INSPECTION'>('SELECT_TEMPLATE');

    // Data State
    const [stores, setStores] = useState<any[]>([]);
    const [inspectorName, setInspectorName] = useState('로딩중...');

    // Template State
    const [templates, setTemplates] = useState<QSCTemplate[]>([]);

    // Selection State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedType, setSelectedType] = useState('정기');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [searchStoreTerm, setSearchStoreTerm] = useState('');

    // Form State
    const [scores, setScores] = useState<Record<string, number>>({});
    const [overallComment, setOverallComment] = useState('');
    const [overallPhotos, setOverallPhotos] = useState<string[]>([]);

    // Load Initial Data
    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setInspectorName(user.userName);
            // SV's Stores Only
            if (user.role === 'SUPERVISOR') {
                // Fix: Use StorageService instead of StoreService
                const myStores = StorageService.getStoresBySv(user.id);
                setStores(myStores);
            } else if (user.role === 'ADMIN') {
                // Fix: Use StorageService instead of StoreService
                setStores(StorageService.getStores());
            } else {
                setStores([]);
            }
        }

        // Use StorageService to connect to Admin Data
        StorageService.init();
        const allTemplates = StorageService.getTemplates();

        // DISABLE FILTER to ensure templates appear
        // const today = new Date().toISOString().split('T')[0];
        // const activeTemplates = allTemplates.filter(t => !t.effective_to || t.effective_to > today);
        const activeTemplates = allTemplates;

        console.log('SV Loaded Templates:', activeTemplates);
        setTemplates(activeTemplates);
    }, []);

    // Helper: Select Template and Go Next
    const handleTemplateSelect = (template: QSCTemplate) => {
        setSelectedTemplateId(template.id);
        setSelectedType(template.type);
        setStep('INSPECTION');
    };

    // Derived Data
    const availableTypes = Array.from(new Set(templates.map(t => t.type)));
    const availableVersions = templates
        .filter(t => t.type === selectedType)
        .sort((a, b) => b.version.localeCompare(a.version));

    const currentTemplate = templates.find(t => t.id === selectedTemplateId) || availableVersions[0];
    const templateItems: QSCItem[] = currentTemplate ? currentTemplate.items : [];

    // Store Logic
    const selectedStore = stores.find(s => s.id === selectedStoreId);
    const filteredStores = stores.filter(s => s.name.toLowerCase().includes(searchStoreTerm.toLowerCase()));

    // Update Scores
    const handleScoreChange = (itemId: string, value: number) => {
        setScores(prev => ({ ...prev, [itemId]: value }));
    };

    const addOverallPhoto = () => {
        const newPhoto = `/mock/photo_${Date.now()}.jpg`;
        setOverallPhotos(prev => [...prev, newPhoto]);
    };

    const removeOverallPhoto = (idx: number) => {
        setOverallPhotos(prev => prev.filter((_, i) => i !== idx));
    };

    // Calculate Result
    const result = useMemo(() => {
        let currentTotal = 0;
        let maxTotal = 0;

        templateItems.forEach(item => {
            const rawScore = scores[item.id] || 0;
            // Direct 1-5 score sum
            currentTotal += rawScore;
            // Max score sum (weight)
            maxTotal += (item.weight || 5);
        });

        // Normalize to 100 point scale
        const percentage = maxTotal > 0 ? (currentTotal / maxTotal) * 100 : 0;
        const finalScore = Math.round(percentage * 10) / 10;

        // Grade
        const criteria = [...QSC_GRADE_CRITERIA].reverse();
        let gradeDesc = QSC_GRADE_CRITERIA[QSC_GRADE_CRITERIA.length - 1];
        for (const c of QSC_GRADE_CRITERIA) {
            if (finalScore >= c.minScore) {
                gradeDesc = c;
                break;
            }
        }

        const isPassed = finalScore >= 80;
        return { totalScore: finalScore, finalGrade: gradeDesc.grade, gradeLabel: gradeDesc.label, isPassed };
    }, [scores, templateItems]);


    const handleSave = (status: 'DRAFT' | 'COMPLETED') => {
        if (!selectedStoreId) { alert('점포를 선택해주세요.'); return; }
        if (!currentTemplate) { alert('템플릿을 선택해주세요.'); return; }

        if (status === 'COMPLETED') {
            const answeredCount = Object.keys(scores).length;
            if (answeredCount < templateItems.length) {
                if (!confirm(`미평가 항목이 ${templateItems.length - answeredCount}개 있습니다. 완료하시겠습니까?`)) return;
            }
        }

        const newInspection: any = {
            id: Date.now().toString(),
            date: date,
            storeId: selectedStoreId,
            storeName: selectedStore?.name,
            region: selectedStore?.region,
            sv: inspectorName,
            type: currentTemplate.type,
            score: result.totalScore,
            grade: result.finalGrade,
            isPassed: result.isPassed,
            isReinspectionNeeded: !result.isPassed,
            inspector: inspectorName,
            status: status === 'DRAFT' ? '임시저장' : '완료',
            answers: scores,
            overallComment: overallComment,
            overallPhotos: overallPhotos,
            templateId: currentTemplate.id
        };

        // Use StorageService for saving
        StorageService.saveInspection(newInspection);

        alert(`${status === 'DRAFT' ? '임시 저장' : '점검 완료'} 되었습니다.`);
        router.push(status === 'COMPLETED' ? `/qsc/report/${newInspection.id}` : `/qsc`);
    };

    // STEP 1: TEMPLATE SELECTION
    if (step === 'SELECT_TEMPLATE') {
        return (
            <div className="max-w-5xl mx-auto space-y-8 pb-24 text-gray-900">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">새 점검 시작</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        진행할 점검의 템플릿을 선택해주세요.
                    </p>
                </div>

                {/* Group Templates by Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableTypes.length > 0 ? (
                        availableTypes.map(type => {
                            const typeTemplates = templates.filter(t => t.type === type).sort((a, b) => b.version.localeCompare(a.version));
                            const latest = typeTemplates[0];
                            return (
                                <div key={latest.id} onClick={() => handleTemplateSelect(latest)}
                                    className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Search className="w-16 h-16 text-blue-500" />
                                    </div>
                                    <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">{latest.type}</span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{latest.title}</h3>
                                    <div className="text-sm text-gray-500 mb-4 line-clamp-2">{latest.description || '설명이 없습니다.'}</div>
                                    <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-4">
                                        <span className="text-xs font-mono text-gray-400">Latest v{latest.version}</span>
                                        <button className="text-sm font-bold text-blue-600 flex items-center group-hover:translate-x-1 transition-transform">
                                            점검 시작 <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                            <p className="text-gray-500 font-medium">사용 가능한 템플릿이 없습니다.</p>
                            <p className="text-xs text-gray-400 mt-2">관리자에게 템플릿 생성을 요청하세요.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // STEP 2: INSPECTION FORM
    if (!currentTemplate) {
        return <div className="p-10 text-center">템플릿을 불러오는 중 오류가 발생했습니다.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-32 space-y-6 text-gray-900">
            {/* Nav Back */}
            <button onClick={() => setStep('SELECT_TEMPLATE')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium">
                <ChevronLeft className="w-4 h-4" /> 템플릿 다시 선택
            </button>

            {/* 1. Controller Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">점검 일자</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    {/* Type */}
                    {/* Type - Read Only */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">점검 유형</label>
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-bold text-gray-600">
                            {currentTemplate.type}
                        </div>
                    </div>
                    {/* Version - Read Only */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">점검 템플릿 버전</label>
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-bold text-gray-600">
                            {currentTemplate.title} (v{currentTemplate.version})
                        </div>
                    </div>
                    {/* Store Search - Improved */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">점포 선택</label>
                        <div className="relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="점포명 검색..."
                                    value={searchStoreTerm}
                                    onChange={(e) => setSearchStoreTerm(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 pl-9 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            </div>

                            {/* Always show list (filtered) */}
                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                {filteredStores.length > 0 ? (
                                    filteredStores.map(s => (
                                        <div
                                            key={s.id}
                                            className={`p-2.5 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center border-b border-gray-50 last:border-0 ${selectedStoreId === s.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'}`}
                                            onClick={() => {
                                                setSelectedStoreId(s.id);
                                                // setSearchStoreTerm(''); // Keep term or clear? Better to keep or clear? Clearing might hide list if logic changes. Let's keep for now or clear to reset. User wants to "select".
                                            }}
                                        >
                                            <span>{s.name}</span>
                                            <span className="text-xs text-gray-400 font-normal">{s.region}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-xs text-gray-400 text-center">검색 결과가 없습니다.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Store Display Row */}
                <div className="border-t border-gray-100 pt-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1">선택된 점포</label>
                    <div className={`w-full p-3 rounded-lg border ${selectedStore ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-400'} font-bold flex items-center justify-between`}>
                        <span>{selectedStore ? selectedStore.name : '점포를 선택해주세요 (본인 담당 점포만 표시됩니다)'}</span>
                        {selectedStore && <span className="text-xs font-normal text-blue-600">{selectedStore.region} / {selectedStore.owner}</span>}
                    </div>
                </div>
            </div>

            {/* 2. Checklist Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Checklist (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                    {currentTemplate ? Object.values(FIXED_QSC_CATEGORIES).map(cat => {
                        const catItems = templateItems.filter(i => i.categoryId === cat.id);
                        if (catItems.length === 0) return null;
                        const subcategories = Array.from(new Set(catItems.map(i => i.subcategory)));

                        return (
                            <div key={cat.id} className="space-y-3">
                                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                                    <span className={`w-1.5 h-5 rounded-full ${cat.id === 'quality' ? 'bg-blue-600' : cat.id === 'service' ? 'bg-green-600' : cat.id === 'hygiene' ? 'bg-purple-600' : 'bg-orange-500'}`}></span>
                                    <h2 className="text-lg font-bold text-gray-900">{cat.label}</h2>
                                </div>
                                {subcategories.map(sub => (
                                    <div key={sub || 'common'} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                            <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                                                {sub || '일반 항목'}
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {catItems.filter(i => i.subcategory === sub).map(item => {
                                                const val = scores[item.id] || 0;
                                                return (
                                                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {item.isRequired && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 py-0.5 rounded">필수</span>}
                                                                    <span className="font-bold text-gray-800 text-sm">{item.name}</span>
                                                                </div>
                                                                {item.criteria && <p className="text-xs text-gray-500 ml-1 whitespace-pre-line">{item.criteria}</p>}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                {['매우 나쁨', '나쁨', '보통', '만족', '매우 만족'].map((label, idx) => {
                                                                    const score = idx + 1; // 1~5
                                                                    return (
                                                                        <button
                                                                            key={score}
                                                                            onClick={() => handleScoreChange(item.id, score)}
                                                                            className={`flex-1 py-1.5 text-xs font-bold rounded border ${val === score
                                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                                                                        >
                                                                            {label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    }) : (
                        <div className="p-10 text-center bg-gray-50 rounded-xl">템플릿을 불러올 수 없습니다.</div>
                    )}
                </div>

                {/* Right: Evidence & Comment (1/3 width, Sticky) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-lg p-5 space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Camera className="w-5 h-5 text-gray-800" />
                            <h2 className="font-bold text-gray-900">증빙 자료 및 의견</h2>
                        </div>

                        {/* Photos */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-gray-500">현장 사진</label>
                                <button onClick={addOverallPhoto} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> 추가
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {overallPhotos.map((p, idx) => (
                                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg border border-gray-200 group">
                                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 font-bold">IMG</div>
                                        <button onClick={() => removeOverallPhoto(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {overallPhotos.length === 0 && (
                                    <div className="col-span-3 py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                                        <Camera className="w-6 h-6 mb-1" />
                                        <span className="text-xs">사진 없음</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">종합 의견</label>
                            <textarea
                                value={overallComment}
                                onChange={(e) => setOverallComment(e.target.value)}
                                className="w-full h-40 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="총평을 작성해주세요."
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                            <button onClick={() => handleSave('DRAFT')} className="py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200">임시 저장</button>
                            <button onClick={() => handleSave('COMPLETED')} className="py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md">점검 완료</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
