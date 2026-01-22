'use client';

import { RiskProfile } from '@/lib/mock/mockRiskData';
import {
    AlertTriangle, Brain, CheckCircle, TrendingDown,
    FileText, Activity, AlertOctagon, Info, Share2, Download, X
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface RiskDiagnosisReportProps {
    riskProfile: RiskProfile;
    onClose: () => void;
}

export function RiskDiagnosisReport({ riskProfile, onClose }: RiskDiagnosisReportProps) {
    const today = new Date().toISOString().split('T')[0];

    const getRiskColor = (level: string) => {
        if (level === 'RISK') return 'text-red-500 bg-red-50 border-red-200';
        if (level === 'WATCHLIST') return 'text-yellow-500 bg-yellow-50 border-yellow-200';
        return 'text-green-500 bg-green-50 border-green-200';
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl sticky top-0 z-10 backdrop-blur-sm">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900">위험 진단 리포트</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskColor(riskProfile.riskLevel)}`}>
                                {riskProfile.riskLevel === 'RISK' ? '위험 (RISK)' :
                                    riskProfile.riskLevel === 'WATCHLIST' ? '관찰 (WATCHLIST)' : '정상 (NORMAL)'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            점포명: <span className="font-bold text-gray-700">{riskProfile.storeName}</span> | 진단일: {today} | Report ID: #{Math.floor(Math.random() * 10000)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-sm font-medium border border-gray-200">
                            <Download className="w-4 h-4" /> PDF
                        </button>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200">
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-2">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                    {/* Section 1: Overview & Trend */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Gauge / Score */}
                        <div className="md:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"></div>
                            <h3 className="text-gray-500 font-medium mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> 종합 위험 점수
                            </h3>
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                {/* Simple CSS Gauge Circle */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" stroke="#f3f4f6" strokeWidth="16" fill="transparent" />
                                    <circle cx="96" cy="96" r="88" stroke={riskProfile.totalRiskScore >= 75 ? '#ef4444' : riskProfile.totalRiskScore >= 50 ? '#eab308' : '#22c55e'} strokeWidth="16" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * riskProfile.totalRiskScore) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-5xl font-bold text-gray-900">{riskProfile.totalRiskScore}</span>
                                    <span className="text-sm text-gray-400 mt-1">/ 100점</span>
                                </div>
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-4">
                                전주 대비 <span className="font-bold text-red-500">+5점</span> 상승했습니다.
                            </p>
                        </div>

                        {/* Trend Chart */}
                        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-gray-500" />
                                위험 점수 변화 추이 (30일)
                            </h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={riskProfile.history}>
                                        <defs>
                                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 100]} hide />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: AI Diagnosis Summary */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Brain className="w-24 h-24 text-indigo-600" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">
                                <Brain className="w-5 h-5 mr-2 text-indigo-600" />
                                AI 위험 분석 요약 (Gemini Analysis)
                            </h3>
                            <p className="text-indigo-800 leading-relaxed font-medium text-lg">
                                &quot;{riskProfile.anomaly ? riskProfile.anomaly.summary : '현재 특이한 위험 징후나 이상 패턴이 감지되지 않았습니다. 안정적인 운영 상태를 유지하고 있습니다.'}&quot;
                            </p>

                            {riskProfile.anomaly && (
                                <div className="mt-4 flex gap-2">
                                    {riskProfile.anomaly.features.map((feature, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/60 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700">
                                            #{feature}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Evidence Breakdown */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <AlertOctagon className="w-5 h-5 mr-2 text-gray-900" />
                            위험 근거 상세 분석 (Risk Evidence)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Col 1: Numerical Evidence */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h4 className="font-bold text-gray-800 flex items-center text-sm">
                                        <Activity className="w-4 h-4 mr-2 text-blue-500" /> 정량적 근거 (Numerical)
                                    </h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    {riskProfile.factors.length > 0 ? riskProfile.factors.map(factor => (
                                        <div key={factor.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                            <div>
                                                <span className="text-xs font-bold text-gray-500 block mb-1">{factor.category}</span>
                                                <span className="text-sm font-medium text-gray-900">{factor.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-red-500 font-bold">+{factor.impactScore}</span>
                                                <span className="text-xs text-gray-400">기여도</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-6 text-gray-400 text-sm">특이 사항 없음</div>
                                    )}
                                </div>
                            </div>

                            {/* Col 2: Pattern Evidence */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h4 className="font-bold text-gray-800 flex items-center text-sm">
                                        <TrendingDown className="w-4 h-4 mr-2 text-purple-500" /> 패턴 기반 근거 (Pattern)
                                    </h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    {riskProfile.patterns && riskProfile.patterns.length > 0 ? riskProfile.patterns.map(pattern => (
                                        <div key={pattern.id} className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs font-bold text-purple-600 px-2 py-0.5 bg-white rounded border border-purple-200">
                                                    {pattern.type}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">{pattern.detectedCount}회 감지</span>
                                            </div>
                                            <p className="text-sm text-gray-800 font-medium mt-2">{pattern.description}</p>
                                        </div>
                                    )) : (
                                        <div className="text-center py-6 text-gray-400 text-sm">감지된 패턴 없음</div>
                                    )}
                                </div>
                            </div>

                            {/* Col 3: Context Evidence */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h4 className="font-bold text-gray-800 flex items-center text-sm">
                                        <FileText className="w-4 h-4 mr-2 text-orange-500" /> 맥락 기반 근거 (Context)
                                    </h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    {riskProfile.context && riskProfile.context.length > 0 ? riskProfile.context.map(ctx => (
                                        <div key={ctx.id} className="flex gap-3 items-start p-3 bg-orange-50/30 border border-orange-100 rounded-lg">
                                            <Info className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm text-gray-800 font-medium leading-snug">{ctx.description}</p>
                                                <p className="text-xs text-gray-400 mt-1">{ctx.date}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-6 text-gray-400 text-sm">관련 맥락 정보 없음</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-between items-center text-xs text-gray-400">
                    <p>
                        * 본 리포트는 AI 분석 결과로 실제 현장 상황과 일부 다를 수 있습니다. 정확한 원인은 현장 방문을 통해 확인하시기 바랍니다.
                    </p>
                    <p>Generated by Franchise Management System</p>
                </div>
            </div>
        </div>
    );
}
