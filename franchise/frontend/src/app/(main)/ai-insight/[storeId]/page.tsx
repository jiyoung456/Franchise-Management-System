'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Activity, Calendar, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Props {
    params: Promise<{ storeId: string }>;
}

interface RiskHistoryItem {
    snapshot_date: string;
    risk_label: number; // 0: 정상, 1: 주의, 2: 위험
    top_metric_1: string | null;
    top_metric_2: string | null;
    top_metric_3: string | null;
}

const METRIC_NAMES: Record<string, string> = {
    // Sales
    'sales_avg_7d': '최근 7일 평균 매출',
    'order_growth_7d': '최근 7일 주문수 증감률',
    'aov_growth_7d': '최근 7일 객단가 증감률',
    'margin_rate_diff_7d': '최근 7일 마진율 변화',
    'sales_volatility_7d': '최근 7일 매출 변동성',
    'sales_vs_store_avg': '점포 평균 대비 매출 수준',

    // QSC
    'last_qsc_total_score': '최근 QSC 종합 점수',
    'days_since_last_qsc': 'QSC 점검 경과 일수',
    'qsc_diff_prev': 'QSC 점수 변화',
    'hygiene_risk_score': '위생 리스크 점수',
    'service_risk_score': '서비스 리스크 점수',
    'quality_risk_score': '품질 리스크 점수',
    'quality_diff_prev': '품질 점수 변화',
    'safety_risk_score': '안전 리스크 점수',
    'safety_diff_prev': '안전 점수 변화',
    'prev_qsc_total_score': '이전 QSC 종합 점수',

    // Operation (SV / Action)
    'days_since_last_visit': 'SV 미방문 경과 일수',
    'open_action_cnt': '미조치 액션 건수',
    'overdue_action_cnt': '기한 초과 액션 건수',
    'action_completion_rate_30d': '30일 내 조치 완료율',
    'days_since_last_action': '최근 조치 경과 일수',

    // Events
    'neg_event_cnt_30d': '최근 30일 부정 이벤트 수',
    'risk_event_cnt_30d': '최근 30일 위험 이벤트 수',
    'sales_drop_event_cnt_30d': '최근 30일 매출 급락 이벤트 수',
    'inspection_drop_event_cnt_30d': '최근 30일 점검 점수 하락 이벤트 수'
};

export default function AiRiskHistoryPage({ params }: Props) {
    const { storeId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const storeNameParam = searchParams.get('storeName');
    const displayStoreName = storeNameParam ? decodeURIComponent(storeNameParam) : `가맹점 ${storeId}`;

    const [history, setHistory] = useState<RiskHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter & Sort State
    const [sortOption, setSortOption] = useState<'LATEST' | 'OLDEST' | 'RISK_LEVEL'>('LATEST');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // GET /api/risk/report/{storeId}/history
                const response = await axios.get(`http://localhost:8080/api/risk/report/${storeId}/history`);

                if (Array.isArray(response.data)) {
                    setHistory(response.data);
                } else if (response.data && Array.isArray(response.data.history)) {
                    setHistory(response.data.history);
                } else {
                    console.warn('Unexpected API response format', response.data);
                    setHistory([]);
                }
            } catch (err) {
                console.error('Failed to fetch store history:', err);
                setError('데이터를 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchData();
        }
    }, [storeId]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate, sortOption]);

    // Filter & Sort Logic
    const sortedHistory = useMemo(() => {
        let result = [...history];

        // 1. Date Filter
        if (startDate) {
            result = result.filter(item => item.snapshot_date >= startDate);
        }
        if (endDate) {
            result = result.filter(item => item.snapshot_date <= endDate);
        }

        // 2. Sort
        result.sort((a, b) => {
            if (sortOption === 'RISK_LEVEL') {
                // High risk (2) first
                if (b.risk_label !== a.risk_label) {
                    return b.risk_label - a.risk_label;
                }
            } else if (sortOption === 'OLDEST') {
                return new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime();
            }
            // Default: LATEST (Date Desc)
            return new Date(b.snapshot_date).getTime() - new Date(a.snapshot_date).getTime();
        });

        return result;
    }, [history, startDate, endDate, sortOption]);

    // Pagination Slicing
    const totalPages = Math.ceil(sortedHistory.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = sortedHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Helper Functions
    const getRiskStatus = (label: number) => {
        switch (label) {
            case 2: return { text: '위험', className: 'bg-red-50 text-red-600 border-red-200', icon: <AlertTriangle className="w-4 h-4" /> };
            case 1: return { text: '주의', className: 'bg-orange-50 text-orange-600 border-orange-200', icon: <Activity className="w-4 h-4" /> };
            default: return { text: '정상', className: 'bg-green-50 text-green-600 border-green-200', icon: <CheckCircle className="w-4 h-4" /> };
        }
    };

    const getMetricName = (key: string | null) => {
        if (!key) return null;
        return METRIC_NAMES[key] || key;
    };

    // UI for Loading
    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <div className="text-gray-500">데이터를 불러오는 중입니다...</div>
            </div>
        );
    }

    // UI for No Data (Initial Load Error)
    if (error || (history.length === 0 && !startDate && !endDate)) {
        return (
            <div className="flex h-[400px] items-center justify-center flex-col gap-4">
                <AlertCircle className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">
                    {error || '해당 점포의 위험 감지 이력이 없습니다.'}
                </h3>
                <p className="text-sm text-gray-500">
                    DB에 데이터가 존재하는지 확인해주세요.
                </p>
                <div className="text-xs text-gray-400 mt-2">
                    Store ID: {storeId}
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 mx-auto w-full max-w-5xl">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-6 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{displayStoreName} 위험 감지 이력</h1>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                        History
                    </span>
                </div>
                <p className="text-sm text-gray-500">
                    과거부터 현재까지 AI가 감지한 위험 분석 이력을 확인할 수 있습니다.
                </p>
            </div>

            {/* Filter & Sort Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                {/* Date Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm focus:outline-none text-gray-700"
                        />
                        <span className="text-gray-400">~</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm focus:outline-none text-gray-700"
                        />
                    </div>
                </div>

                {/* Sort & Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setStartDate(''); setEndDate(''); setSortOption('LATEST'); }}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        초기화
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-1"></div>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 shadow-sm bg-white"
                    >
                        <option value="LATEST">최신순</option>
                        <option value="OLDEST">오래된순</option>
                        <option value="RISK_LEVEL">위험도순</option>
                    </select>
                </div>
            </div>

            {/* History List */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 w-1/4">감지 일시 (Snapshot Date)</th>
                                <th className="px-6 py-4 w-1/4 text-center">위험 등급</th>
                                <th className="px-6 py-4 w-1/3 text-center">주요 위험 요인 (Top 3)</th>
                                <th className="px-6 py-4 w-auto text-right">상세보기</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentData.map((item, index) => {
                                const status = getRiskStatus(item.risk_label);
                                const metrics = [item.top_metric_1, item.top_metric_2, item.top_metric_3]
                                    .map(getMetricName)
                                    .filter(Boolean);

                                return (
                                    <tr
                                        key={`${item.snapshot_date}-${index}`}
                                        onClick={() => router.push(`/ai-insight/${storeId}/${item.snapshot_date}?storeName=${encodeURIComponent(displayStoreName)}`)}
                                        className="hover:bg-indigo-50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-gray-900 font-bold">
                                                <Calendar className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                                {item.snapshot_date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${status.className}`}>
                                                {status.icon}
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {metrics.length > 0 ? (
                                                    metrics.map((m, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                            {m}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 group-hover:text-indigo-600 font-medium flex items-center gap-1 justify-end transition-colors">
                                                분석 결과
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Empty State for Filter Result */}
                            {currentData.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        {history.length > 0
                                            ? '검색 조건에 맞는 위험 감지 이력이 없습니다.'
                                            : '저장된 위험 감지 이력이 없습니다.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center p-4 border-t border-gray-200 gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>

                        <div className="flex gap-1">
                            {(() => {
                                const PAGES_PER_BLOCK = 10;
                                const startPage = Math.floor((currentPage - 1) / PAGES_PER_BLOCK) * PAGES_PER_BLOCK + 1;
                                const endPage = Math.min(startPage + PAGES_PER_BLOCK - 1, totalPages);

                                return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === page
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ));
                            })()}
                        </div>

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
