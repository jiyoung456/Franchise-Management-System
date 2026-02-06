'use client';

import React from 'react';
import { X, AlertTriangle, TrendingUp, Calendar, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AdminStoreDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    data: any | null;
}

// Mock Trend Data for the Drawer
const MOCK_RISK_TREND = [
    { date: '1/1', score: 45 },
    { date: '1/8', score: 52 },
    { date: '1/15', score: 48 },
    { date: '1/22', score: 65 },
    { date: '1/29', score: 82 }, // Spike
    { date: '2/5', score: 85 },
];

export default function AdminStoreDrawer({ isOpen, onClose, data }: AdminStoreDrawerProps) {
    if (!isOpen || !data) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col font-sans border-l border-gray-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-gray-900">{data.storeName}</h2>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">Risk {data.riskScore}</span>
                        </div>
                        <p className="text-sm text-gray-500">점포 ID: {data.storeId || data.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Risk Reason */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-red-500" />
                            위험 원인 (Risk Factor)
                        </h3>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-gray-800 text-sm leading-relaxed">
                            <p className="font-bold mb-2">매출 급락 및 QSC 점수 저하 감지</p>
                            <p className="text-gray-600">
                                최근 2주간 매출이 전월 대비 15% 이상 하락했으며, 특히 위생 점검 점수가 70점대로 급격히 떨어지는 경향을 보입니다.
                            </p>
                        </div>
                    </section>

                    {/* Risk Score Trend Chart */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-500" />
                            위험 점수 추이 (30 Days)
                        </h3>
                        <div className="h-48 bg-white border border-gray-100 rounded-lg p-2 shadow-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOCK_RISK_TREND}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Recent Events Summary */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Activity size={16} className="text-orange-500" />
                            최근 주요 이벤트
                        </h3>
                        <div className="space-y-3">
                            <div className="flex gap-3 text-sm p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                <span className="text-gray-400 font-mono text-xs mt-0.5">2h ago</span>
                                <div>
                                    <p className="font-bold text-gray-800">위생 점검 미흡 판정 (C등급)</p>
                                </div>
                            </div>
                            <div className="flex gap-3 text-sm p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                <span className="text-gray-400 font-mono text-xs mt-0.5">1d ago</span>
                                <div>
                                    <p className="font-bold text-gray-800">피크타임 주문 지연 클레임 3건 발생</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}
