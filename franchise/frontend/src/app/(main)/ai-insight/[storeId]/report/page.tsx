'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BrainCircuit, Download, PieChart as PieChartIcon, Activity, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip
} from 'recharts';
import axios from 'axios';

interface Props {
    params: Promise<{ storeId: string }>;
}

interface ReportData {
    store_id: number;
    snapshot_date: string;
    risk_label: number;
    qsc_domain_pct: number;
    pos_domain_pct: number;
    qsc_clean_pct: number;
    qsc_service_pct: number;
    qsc_product_pct: number;
    pos_sales_pct: number;
    pos_aov_pct: number;
    pos_margin_pct: number;
    comment_domain: string;
    comment_focus: string;
    detail_comment: string;
    external_factor_comment: string | null;
    analysis_type: 'BOTH' | 'IF_ONLY' | 'Z_ONLY' | null;
}

export default function RiskReportPage({ params }: Props) {
    const { storeId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');

    const snapshotDate = dateParam ? decodeURIComponent(dateParam) : new Date().toISOString().split('T')[0];

    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8080/api/risk/report/${storeId}?snapshotDate=${snapshotDate}`);
                setReportData(response.data);
            } catch (err) {
                console.error('Failed to fetch report:', err);
                setError('리포트 데이터를 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (storeId && snapshotDate) {
            fetchData();
        }
    }, [storeId, snapshotDate]);

    const getAnalysisTypeInfo = (type: string | null) => {
        switch (type) {
            case 'BOTH':
                return {
                    label: '확정 위험 (Critical)',
                    desc: '통계와 AI 패턴 분석이 동시에 지목한 핵심 관리 대상입니다.',
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    icon: <AlertTriangle className="w-5 h-5 text-red-600" />
                };
            case 'IF_ONLY':
                return {
                    label: '잠재적 이상 패턴 (Hidden)',
                    desc: '수치는 정상인 듯 보이나, 운영 패턴이 비정상적인 숨겨진 위험입니다.',
                    color: 'text-orange-600',
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                    icon: <Activity className="w-5 h-5 text-orange-600" />
                };
            case 'Z_ONLY':
                return {
                    label: '단순 수치 이탈 (Alert)',
                    desc: '특정 지표 하나가 일시적으로 튀어 주의가 필요한 상태입니다.',
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    icon: <Info className="w-5 h-5 text-yellow-600" />
                };
            default:
                return {
                    label: '일반 리포트',
                    desc: '정기적인 위험 진단 리포트입니다.',
                    color: 'text-gray-600',
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    icon: <CheckCircle className="w-5 h-5 text-gray-600" />
                };
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">리포트 생성 중...</div>;
    if (error || !reportData) return <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-gray-500">
        <Activity className="w-10 h-10" />
        <p>{error || '데이터가 없습니다.'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">뒤로가기</button>
    </div>;

    const analysisInfo = getAnalysisTypeInfo(reportData.analysis_type);

    const qscData = [
        { name: '청결 (Clean)', value: reportData.qsc_clean_pct },
        { name: '서비스 (Service)', value: reportData.qsc_service_pct },
        { name: '품질 (Product)', value: reportData.qsc_product_pct },
    ].filter(d => d.value > 0);
    const QSC_COLORS = ['#3b82f6', '#93c5fd', '#bfdbfe'];

    const posData = [
        { name: '매출 (Sales)', value: reportData.pos_sales_pct },
        { name: '객단가 (AOV)', value: reportData.pos_aov_pct },
        { name: '마진 (Margin)', value: reportData.pos_margin_pct },
    ].filter(d => d.value > 0);
    const POS_COLORS = ['#8b5cf6', '#c4b5fd', '#ddd6fe'];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 10mm;
                        background: white;
                        box-shadow: none;
                    }
                    ::-webkit-scrollbar {
                        display: none;
                    }
                }
            `}</style>

            <div className="bg-white border-b border-gray-200 sticky top-16 z-10 print:hidden">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> 뒤로가기
                    </button>
                    <button onClick={handlePrint} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                        <Download className="w-4 h-4" /> PDF 다운로드
                    </button>
                </div>
            </div>

            {/* A4 Page Container */}
            <div id="print-area" className="max-w-[210mm] mx-auto bg-white shadow-lg my-8 p-[10mm] min-h-[297mm] print:shadow-none print:my-0 print:w-full max-w-none flex flex-col">

                {/* Header: Compact */}
                <div className="border-b-2 border-gray-900 pb-3 mb-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">위험 진단 리포트</h1>
                            <div className="text-xs font-bold text-gray-600 flex gap-4">
                                <span>가맹점 ID: <span className="text-gray-900">{storeId}</span></span>
                                <span>진단일: <span className="text-gray-900">{reportData.snapshot_date}</span></span>
                            </div>
                        </div>
                        <div className="text-right">
                            <BrainCircuit className="w-8 h-8 text-purple-600 ml-auto mb-1" />
                            <span className="text-[10px] font-bold text-purple-600">AI Risk Engine Powered</span>
                        </div>
                    </div>
                </div>

                {/* Analysis Type Card: Compact */}
                <div className={`mb-6 p-4 rounded-xl border ${analysisInfo.bg} ${analysisInfo.border} flex items-start gap-4`}>
                    <div className="mt-0.5">{analysisInfo.icon}</div>
                    <div>
                        <h3 className={`text-base font-extrabold ${analysisInfo.color} mb-0.5`}>{analysisInfo.label}</h3>
                        <p className="text-gray-800 text-sm font-medium">{analysisInfo.desc}</p>
                    </div>
                </div>

                {/* Part 1: Charts (Compact Height) */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                        1. 정량적 데이터 분석 (Quantitative Analysis)
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* QSC Donut */}
                        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex flex-col items-center h-[260px]">
                            <h3 className="text-xs font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2 flex items-center justify-center gap-2">
                                <PieChartIcon className="w-3 h-3 text-blue-500" />
                                QSC 위험 기여도 ({reportData.qsc_domain_pct}%)
                            </h3>
                            <div className="w-full h-40 relative flex justify-center items-center">
                                <PieChart width={200} height={160} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                                    <Pie
                                        data={qscData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                    >
                                        {qscData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={QSC_COLORS[index % QSC_COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                </PieChart>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                    <span className="text-xl font-bold text-blue-600">QSC</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mt-2 text-[10px] text-gray-600">
                                {qscData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: QSC_COLORS[index % QSC_COLORS.length] }}></div>
                                        <span>{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* POS Donut */}
                        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex flex-col items-center h-[260px]">
                            <h3 className="text-xs font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2 flex items-center justify-center gap-2">
                                <PieChartIcon className="w-3 h-3 text-purple-500" />
                                POS 위험 기여도 ({reportData.pos_domain_pct}%)
                            </h3>
                            <div className="w-full h-40 relative flex justify-center items-center">
                                <PieChart width={200} height={160} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                                    <Pie
                                        data={posData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                    >
                                        {posData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={POS_COLORS[index % POS_COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                </PieChart>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                    <span className="text-xl font-bold text-purple-600">POS</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mt-2 text-[10px] text-gray-600">
                                {posData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: POS_COLORS[index % POS_COLORS.length] }}></div>
                                        <span>{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Part 2: Details (Variable Height) */}
                <div className="mb-6 flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-gray-900 pl-3">
                        2. 상세 분석 내용 (Detailed Insights)
                    </h2>
                    <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 flex flex-col gap-4">
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-full">영역: {reportData.comment_domain}</span>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">중점: {reportData.comment_focus}</span>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-900 mb-1">AI 진단 소견</h3>
                            <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-gray-200">{reportData.detail_comment}</p>
                        </div>
                        {reportData.external_factor_comment && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 mb-1">외부 요인 분석</h3>
                                <p className="text-gray-600 text-xs leading-relaxed bg-white p-3 rounded border border-gray-200 italic">{reportData.external_factor_comment}</p>
                            </div>
                        )}
                        <p className="mt-2 text-gray-400 text-[10px] italic text-right">* 본 리포트는 AI 엔진 v2.5 기반 자동 생성되었습니다.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto border-t border-gray-100 pt-4 text-center text-[10px] text-gray-400">
                    <p>Copyright © 2026 Franchise Management System. All rights reserved.</p>
                </div>

            </div>
        </div>
    );
}
