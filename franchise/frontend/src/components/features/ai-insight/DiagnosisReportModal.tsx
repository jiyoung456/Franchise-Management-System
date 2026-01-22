'use client';

import { RiskProfile } from '@/lib/mock/mockRiskData';
import { X, Printer, AlertTriangle, TrendingDown, Clock, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    profile: RiskProfile;
}

export function DiagnosisReportModal({ isOpen, onClose, profile }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* 1. Header (Print Friendly) */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-slate-900 text-white rounded-t-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-purple-400" />
                            <h2 className="text-xl font-bold">AI 경영 위험 진단 리포트</h2>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-400 mt-2">
                            <span>점포명: <b className="text-white">{profile.storeName}</b></span>
                            <span>진단일: <b className="text-white">{new Date().toLocaleDateString()}</b></span>
                            <span>Report ID: <b className="text-white">R-{profile.storeId}-{new Date().getTime().toString().slice(-6)}</b></span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white"
                            title="인쇄"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50">
                    {/* 2. Summary Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-purple-600" />
                            진단 요약
                        </h3>
                        <p className="text-gray-700 leading-relaxed bg-purple-50 p-4 rounded-lg border border-purple-100">
                            {profile.anomaly?.summary || '특이사항이 발견되지 않았습니다.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 3. Metric Analysis (QSC/POS) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <TrendingDown className="w-5 h-5 mr-2 text-blue-600" />
                                핵심 지표 이탈 분석 (Metric Anomalies)
                            </h3>

                            {/* Metric Table */}
                            <div className="overflow-hidden border border-gray-200 rounded-lg mb-6">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 text-left">지표 (KPI)</th>
                                            <th className="px-4 py-2 text-right">현재값</th>
                                            <th className="px-4 py-2 text-right">정상 기준</th>
                                            <th className="px-4 py-2 text-right">이탈률</th>
                                            <th className="px-4 py-2 text-center">심각도</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {profile.metricAnomalies && profile.metricAnomalies.length > 0 ? (
                                            profile.metricAnomalies.map((m, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{m.label}</td>
                                                    <td className="px-4 py-3 text-right">{m.current}</td>
                                                    <td className="px-4 py-3 text-right text-gray-500">{m.baseline}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-red-600">{m.deviation}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {m.severity}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-gray-500">주요 지표 이탈 내역이 없습니다. (Normal)</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cause Contribution Chart (Visual) */}
                            <div className="mt-4">
                                <h4 className="text-sm font-bold text-gray-500 mb-2">지표별 이상 강도 (Anomaly Intensity)</h4>
                                <div className="h-[150px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={profile.factors.slice(0, 5)}
                                            layout="vertical"
                                            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                                        >
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Bar dataKey="impactScore" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={15} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* 4. Operational Analysis */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-orange-600" />
                                운영 및 관리 행동 분석
                            </h3>

                            {/* Operational Gaps */}
                            <div className="space-y-4 mb-6">
                                <h4 className="text-sm font-bold text-gray-700 border-l-4 border-orange-400 pl-2">관리 행동 공백 (Management Gaps)</h4>
                                {profile.operationalGaps && profile.operationalGaps.length > 0 ? (
                                    <div className="space-y-2">
                                        {profile.operationalGaps.map((gap, i) => (
                                            <div key={i} className="flex items-start bg-orange-50 p-3 rounded-lg border border-orange-100">
                                                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                                                <div>
                                                    <span className="font-bold text-orange-800 mr-2">[{gap.type}]</span>
                                                    <span className="text-gray-700 text-sm">{gap.description}</span>
                                                    <div className="text-xs text-orange-600 mt-1 font-bold">지연 기간: {gap.duration}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-500 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                        특이한 관리 공백이 발견되지 않았습니다.
                                    </div>
                                )}
                            </div>

                            {/* Negative Events Log */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 border-l-4 border-red-400 pl-2">부정적 이벤트 연동 (Negative Events)</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {profile.context && profile.context.length > 0 ? (
                                        profile.context.map((ctx, i) => (
                                            <li key={i} className="flex items-center">
                                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                                                <span className="text-gray-500 mr-2 text-xs">[{ctx.date}]</span>
                                                {ctx.description}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-400 text-xs pl-2">- 최근 주요 부정적 이벤트 없음</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 5. Conclusion & Root Causes */}
                    <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-bold mb-4">종합 진단 결과</h3>
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h4 className="text-slate-400 text-sm font-medium mb-2 uppercase">핵심 원인 (Root Causes Top 3)</h4>
                                <div className="space-y-2">
                                    {profile.rootCauses && profile.rootCauses.map((cause, i) => (
                                        <div key={i} className="flex items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                                            <span className="w-6 h-6 flex items-center justify-center bg-purple-500 rounded-full text-xs font-bold mr-3">
                                                {i + 1}
                                            </span>
                                            <span className="text-sm font-medium">{cause}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-slate-400 text-sm font-medium mb-2 uppercase">향후 예측 (Trend Forecast)</h4>
                                <div className="h-[100px] bg-slate-800 rounded-lg p-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={profile.history.slice(-10)}>
                                            <Line type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={2} dot={false} />
                                            <XAxis dataKey="date" hide />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'white' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-right">
                                    * 최근 패턴 지속 시, 2주 내 위험 단계 상향 가능성 있음
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-center">
                    <p className="text-xs text-gray-400">
                        Generated by FMS AI Engine • This report contains confidential information.
                    </p>
                </div>
            </div>
        </div>
    );
}
