'use client';

import { useState } from 'react';
import { ArrowLeft, Save, AlertTriangle, Info, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RiskConfigPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        riskThreshold: 75,
        watchThreshold: 50,
        weights: {
            qsc: 40,
            pos: 30,
            ops: 30
        }
    });

    const handleWeightChange = (key: keyof typeof config.weights, value: number) => {
        setConfig(prev => ({
            ...prev,
            weights: { ...prev.weights, [key]: value }
        }));
    };

    const totalWeight = config.weights.qsc + config.weights.pos + config.weights.ops;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">위험 점수 기준 관리</h1>
                    <p className="text-sm text-gray-500">
                        위험도 산출 가중치 및 등급 부여 기준점을 설정합니다.
                    </p>
                </div>
            </div>

            {/* Threshold Config */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                    등급 기준점 설정
                </h3>

                <div className="space-y-8 relative px-4">
                    {/* Visual Slider Mockup */}
                    <div className="h-4 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full relative">
                        {/* Threshold Markers */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-yellow-500 rounded-full shadow cursor-grab flex items-center justify-center font-bold text-xs"
                            style={{ left: `${config.watchThreshold}%` }}
                        >
                            {config.watchThreshold}
                        </div>
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-red-500 rounded-full shadow cursor-grab flex items-center justify-center font-bold text-xs"
                            style={{ left: `${config.riskThreshold}%` }}
                        >
                            {config.riskThreshold}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center text-sm pt-2">
                        <div className="text-green-700 font-bold">NORMAL (0 ~ {config.watchThreshold - 1})</div>
                        <div className="text-yellow-700 font-bold">WATCH ({config.watchThreshold} ~ {config.riskThreshold - 1})</div>
                        <div className="text-red-700 font-bold">RISK ({config.riskThreshold} ~ 100)</div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-100 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WARNING 진입 점수</label>
                            <input
                                type="number"
                                value={config.watchThreshold}
                                onChange={(e) => setConfig({ ...config, watchThreshold: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">RISK 진입 점수</label>
                            <input
                                type="number"
                                value={config.riskThreshold}
                                onChange={(e) => setConfig({ ...config, riskThreshold: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Weights Config */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-gray-500" />
                    평가 요소 가중치 (총합 100%)
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-medium text-gray-700">QSC 품질 (40%)</label>
                        <input
                            type="range" min="0" max="100"
                            value={config.weights.qsc}
                            onChange={(e) => handleWeightChange('qsc', Number(e.target.value))}
                            className="flex-1 accent-blue-600"
                        />
                        <div className="w-16 font-mono font-bold text-right">{config.weights.qsc}%</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-medium text-gray-700">POS 매출 (30%)</label>
                        <input
                            type="range" min="0" max="100"
                            value={config.weights.pos}
                            onChange={(e) => handleWeightChange('pos', Number(e.target.value))}
                            className="flex-1 accent-blue-600"
                        />
                        <div className="w-16 font-mono font-bold text-right">{config.weights.pos}%</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-medium text-gray-700">운영 지표 (30%)</label>
                        <input
                            type="range" min="0" max="100"
                            value={config.weights.ops}
                            onChange={(e) => handleWeightChange('ops', Number(e.target.value))}
                            className="flex-1 accent-blue-600"
                        />
                        <div className="w-16 font-mono font-bold text-right">{config.weights.ops}%</div>
                    </div>

                    <div className={`flex justify-end pt-2 text-sm font-bold ${totalWeight !== 100 ? 'text-red-500' : 'text-green-600'}`}>
                        합계: {totalWeight}% {totalWeight !== 100 && '(100%가 되어야 합니다)'}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center"
                    disabled={totalWeight !== 100}
                    onClick={() => alert('설정이 저장되었습니다.')}
                >
                    <Save className="w-4 h-4 mr-2" />
                    설정 저장
                </button>
            </div>
        </div>
    );
}
