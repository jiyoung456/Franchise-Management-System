'use client';

import { QscService } from '@/services/qscService';
import { FIXED_QSC_CATEGORIES, QSC_GRADE_CRITERIA } from '@/lib/mock/mockQscData';
import {
    Calendar, User, ArrowLeft, Download, ExternalLink,
    MessageSquare, FileText, Camera
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ReportClient({ id, storeId }: { id: string, storeId?: string }) {
    const router = useRouter();

    const [reportData, setReportData] = useState<any | null>(null); // Extended Inspection type
    const [loading, setLoading] = useState(true);

    // Tab State
    // const [activeTab, setActiveTab] = useState('quality'); // Default first tab (Unused in original code but kept for consistency if needed later)

    useEffect(() => {
        const fetchInspection = async () => {
            setLoading(true);
            try {
                let data;
                if (storeId) {
                    // Fetch using backend list filtering
                    data = await QscService.getInspectionDetail(Number(storeId), id);
                } else {
                    // Fallback to purely local mock if no storeId provided (Demo mode compatibility)
                    data = QscService.getInspection(id);
                }

                if (data) {
                    setReportData(data);
                }
            } catch (error) {
                console.error("Failed to load inspection:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInspection();
    }, [id, storeId]);

    const [template, setTemplate] = useState<any>(null);

    useEffect(() => {
        const fetchTemplate = async () => {
            if (reportData?.templateId) {
                const tpl = await QscService.getTemplateDetail(reportData.templateId);
                setTemplate(tpl);
            }
        };
        fetchTemplate();
    }, [reportData]);

    if (loading) return <div className="p-20 text-center">로딩중...</div>;
    if (!reportData) return <div className="p-20 text-center">점검 정보를 찾을 수 없습니다.</div>;

    const templateItems = template ? template.items : [];

    // Find grade label
    const gradeInfo = QSC_GRADE_CRITERIA.find(c => c.grade === reportData.grade);

    return (
        <div className="max-w-7xl mx-auto pb-24 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {reportData.storeName} 점검 결과
                            <span className={`text-sm px-2 py-1 rounded border ${reportData.isPassed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {reportData.isPassed ? 'Pass' : 'Fail'}
                            </span>
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {reportData.date}</span>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {reportData.inspector}</span>
                            {template && (
                                <>
                                    <span className="text-gray-300">|</span>
                                    <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {template.title} (v{template.version})</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => alert('PDF 다운로드 기능은 준비 중입니다.')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 text-sm shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        리포트 다운로드 (PDF)
                    </button>
                </div>
            </div>

            {/* Score Summary / Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">영역별 점수 (클릭하여 이동)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {template?.categories?.map(cat => {
                        const catItems = cat.items;
                        const catMaxScore = cat.weight;

                        let catScore = 0;
                        if (reportData.answers) {
                            catItems.forEach((item: any) => {
                                const ans = reportData.answers[item.id];
                                const raw = typeof ans === 'number' ? ans : (ans?.score || 0);
                                catScore += Number(raw);
                            });
                        }

                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    const el = document.getElementById(`category-${cat.id}`);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="flex flex-col p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 text-left group"
                            >
                                <span className={`text-xs font-bold mb-1 ${cat.code === 'QUALITY' ? 'text-blue-600' :
                                    cat.code === 'SERVICE' ? 'text-green-600' :
                                        cat.code === 'CLEANLINESS' ? 'text-purple-600' :
                                            cat.code === 'SAFETY' ? 'text-orange-600' : 'text-red-600'
                                    }`}>{cat.name}</span>
                                <div className="flex items-end gap-1">
                                    <span className="text-xl font-extrabold text-gray-900">{catScore}</span>
                                    {catMaxScore && <span className="text-xs text-gray-400 mb-1">/ {catMaxScore}</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Layout: Split View (Data vs Evidence) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* [Left] Data Column (7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Items Grouped by Category */}
                    {template?.categories?.map((cat: any) => {
                        const catItems = cat.items;
                        if (catItems.length === 0) return null;

                        return (
                            <div id={`category-${cat.id}`} key={cat.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="font-extrabold text-gray-800 flex items-center gap-2">
                                        <span className={`w-3 h-6 rounded-sm ${cat.code === 'QUALITY' ? 'bg-blue-500' :
                                            cat.code === 'SERVICE' ? 'bg-green-500' :
                                                cat.code === 'CLEANLINESS' ? 'bg-purple-500' :
                                                    cat.code === 'SAFETY' ? 'bg-orange-500' : 'bg-red-500'
                                            }`}></span>
                                        {cat.name}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{catItems.length} 항목</span>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        {catItems.map((item: any) => {
                                            const answerVal = reportData.answers ? reportData.answers[item.id] : 0;
                                            const rawScore = typeof answerVal === 'number' ? answerVal : (answerVal?.score || 0);
                                            const rawScoreNum = Number(rawScore);

                                            const labelMap: Record<number, string> = { 5: '매우만족', 4: '만족', 3: '보통', 2: '나쁨', 1: '매우나쁨', 0: '-' };
                                            const ratingLabel = labelMap[rawScoreNum] || '-';
                                            const colorClass = rawScoreNum >= 4 ? 'text-blue-600' : rawScoreNum === 3 ? 'text-yellow-600' : 'text-red-600';

                                            return (
                                                <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50/50 rounded-lg">
                                                    <div className="flex-1 pr-4">
                                                        <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                                        {item.criteria && <div className="text-xs text-gray-500 mt-0.5">{item.criteria}</div>}
                                                    </div>
                                                    <div className="text-right whitespace-nowrap">
                                                        <div className={`text-xs font-bold ${colorClass}`}>{ratingLabel}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{rawScoreNum} / {item.weight || 5}.0</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* [Right] Evidence Column (5 cols) - Sticky */}
                <div className="lg:col-span-5 space-y-6 sticky top-6">
                    {/* Overall Score Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                        <h3 className="text-gray-500 font-bold mb-4">점검 종합 결과</h3>
                        <div className="mb-4">
                            <span className={`text-6xl font-black ${['S', 'A'].includes(reportData.grade) ? 'text-green-600' :
                                reportData.grade === 'B' ? 'text-yellow-500' : 'text-red-600'
                                }`}>
                                {reportData.score}
                            </span>
                            <span className="text-2xl font-bold text-gray-400 ml-1">점</span>
                        </div>
                        <div className={`inline-block px-4 py-1.5 rounded-full text-lg font-extrabold ${reportData.grade === 'S' ? 'bg-green-100 text-green-700' :
                            reportData.grade === 'A' ? 'bg-blue-100 text-blue-700' :
                                reportData.grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {reportData.grade} 등급
                            {gradeInfo && <span className="ml-2 text-sm opacity-75">({gradeInfo.label})</span>}
                        </div>
                    </div>

                    {/* Overall Comment */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            종합 코멘트
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed min-h-[100px] whitespace-pre-wrap">
                            {reportData.overallComment || '작성된 코멘트가 없습니다.'}
                        </div>
                    </div>

                    {/* Overall Photos & AI Analysis */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                            {/* Left: Photos Section */}
                            <div className="border-r border-gray-200">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-900 flex items-center gap-2">
                                    <Camera className="w-4 h-4" /> 사진 첨부
                                </div>
                                <div className="p-4 h-[300px] overflow-y-auto">
                                    {(!reportData.overallPhotos || reportData.overallPhotos.length === 0) ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                            <span>사진 없음</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {reportData.overallPhotos.map((photo: string, idx: number) => (
                                                <div key={idx} className="relative aspect-video bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                                    <div className="text-gray-400 text-xs text-center">
                                                        <span className="block font-bold mb-1">원본 사진 {idx + 1}</span>
                                                        (이미지 미리보기)
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: AI Analysis Section */}
                            <div>
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">AI</div>
                                    AI 이미지 분석 실행
                                </div>
                                <div className="p-4 h-[300px] flex flex-col">
                                    <div className="flex-1 border border-gray-200 rounded p-4 space-y-4">
                                        <div className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">
                                            AI 이미지 분석 결과
                                        </div>
                                        <ul className="space-y-3 text-sm text-gray-700">
                                            <li className="flex items-start gap-2">
                                                <span className="text-gray-400">-</span>
                                                <span>
                                                    <span className="font-bold">위험 점수 : </span>
                                                    <span className="text-red-600 font-bold text-lg">72</span> / 100
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-gray-400">-</span>
                                                <span>
                                                    <span className="font-bold">위험 태그 : </span><br />
                                                    바닥 청결 미흡
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-gray-400">-</span>
                                                <span>
                                                    <span className="font-bold">근거 문장 : </span><br />
                                                    바닥 오염 징후가 감지되었습니다.
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
