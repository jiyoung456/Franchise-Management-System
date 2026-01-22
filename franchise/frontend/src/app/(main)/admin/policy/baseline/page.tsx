'use client';

import { useState, useEffect } from 'react';
import { StorageService, BaselineConfig } from '@/lib/storage';
import { Save, RefreshCw, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function BaselineManagementPage() {
    const [config, setConfig] = useState<BaselineConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        // Load config
        const data = StorageService.getBaseline();
        setConfig(data);
        setIsLoading(false);
    }, []);

    const handleSave = () => {
        if (!config) return;
        setIsSaving(true);
        StorageService.saveBaseline(config);

        setTimeout(() => {
            setIsSaving(false);
            showToast('성과 기준선이 저장되었습니다.', 'success');
        }, 800);
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    if (isLoading || !config) return <div className="p-6">설정 로딩 중...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">성과 기준선 관리</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        전사 가맹점의 성과 평가 표준과 이상 징후 감지 규칙을 설정합니다.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? '저장 중...' : '변경사항 저장'}
                </button>
            </div>

            {/* Config Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Target & Metric */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Info className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">평가 대상 및 지표</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">적용 대상</label>
                            <select
                                value={config.target}
                                onChange={(e) => setConfig({ ...config, target: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="ALL">전체 가맹점 (기본)</option>
                                <option value="REGION">지역별 차등 적용 (미구현)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">핵심 관리 지표</label>
                            <select
                                value={config.metric}
                                onChange={(e) => setConfig({ ...config, metric: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="REVENUE">일 매출액 (Revenue)</option>
                                <option value="QSC">QSC 점검 점수</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                * 선택한 지표를 기준으로 성과 모니터링 및 이상 징후를 감지합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Thresholds */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">임계값 설정</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">표준 기준값 (Daily)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={config.standardValue}
                                    onChange={(e) => setConfig({ ...config, standardValue: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-gray-400">KRW / 점</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">허용 변동폭 (±%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={config.allowedDeviation}
                                    onChange={(e) => setConfig({ ...config, allowedDeviation: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-gray-400">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Anomaly Rules */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">이상 징후 판단 규칙</h3>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-900 mb-2">연속 하락 판단 기준</label>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">최근</span>
                                <input
                                    type="number"
                                    value={config.consecutiveDays}
                                    onChange={(e) => setConfig({ ...config, consecutiveDays: Number(e.target.value) })}
                                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                />
                                <span className="text-sm text-gray-600">일 연속 기준 미달 시 '주의' 단계로 자동 격상</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation Preview (Visual Aid) */}
            <div className="mt-8 p-6 border-t border-gray-200">
                <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase">설정 시뮬레이션</h4>
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-sm text-gray-600">
                        현재 설정에 따르면, 일 매출이 <span className="font-bold text-red-600">{(config.standardValue * (1 - config.allowedDeviation / 100)).toLocaleString()}원</span> 미만으로
                        <span className="font-bold text-red-600 mx-1">{config.consecutiveDays}일</span> 이상 지속될 경우 알림이 발송됩니다.
                    </p>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white animate-fade-in-up ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
