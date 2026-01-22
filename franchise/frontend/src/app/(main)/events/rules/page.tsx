'use client';

import { useState } from 'react';
import { MOCK_EVENT_RULES } from '@/lib/mock/mockEventData';
import { Settings, Play, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EventRulesPage() {
    const router = useRouter();
    const [rules, setRules] = useState(MOCK_EVENT_RULES);

    const toggleRule = (id: string) => {
        setRules(prev => prev.map(r =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
        ));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">이벤트 트리거 룰 관리</h1>
                    <p className="text-sm text-gray-500">
                        자동 이벤트를 생성하는 감지 규칙(Rules)을 설정합니다.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {rules.map(rule => (
                    <div key={rule.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${rule.isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`font-bold text-lg ${rule.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {rule.name}
                                    </h3>
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                        {rule.targetSystem}
                                    </span>
                                    {rule.severity === 'CRITICAL' && (
                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center">
                                            <AlertTriangle className="w-3 h-3 mr-1" /> Critical
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                                <div className="text-xs bg-slate-50 border border-slate-100 rounded px-3 py-2 font-mono text-slate-600">
                                    Condition: {rule.condition}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={rule.isActive}
                                    onChange={() => toggleRule(rule.id)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">{rule.isActive ? 'ON' : 'OFF'}</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
                <div>
                    <strong>룰 엔진 동작 방식 안내</strong><br />
                    설정된 룰은 매일 자정 배치 작업(Batch Job)으로 실행되며, 실시간 이벤트의 경우 데이터 수집 시점에 즉시 트리거됩니다.
                </div>
            </div>
        </div>
    );
}
