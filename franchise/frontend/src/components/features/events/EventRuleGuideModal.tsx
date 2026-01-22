import React from 'react';
import { X, AlertTriangle, Info, AlertCircle, Activity, TrendingDown, ClipboardList, ShieldAlert } from 'lucide-react';

interface EventRuleGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EventRuleGuideModal({ isOpen, onClose }: EventRuleGuideModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-600" />
                            이벤트 발생 기준 안내
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">시스템에서 관리되는 자동화 이벤트(트리거)의 종류와 발생 조건입니다.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* 1. Store Master */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2 border-gray-100">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </span>
                            1. 점포 마스터 관련 트리거 (운영 상태 변화)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TriggerCard title="점포 상태 변경" desc="점포의 현재 상태가 NORMAL, WATCHLIST, RISK 사이에서 변경될 때 발생" />
                            <TriggerCard title="담당 슈퍼바이저(SV) 변경" desc="관리 책임자인 SV가 변경되어 인수인계가 필요한 시점에 발생" />
                            <TriggerCard title="계약 만료 임박" desc="계약 종료일이 3개월 전으로 다가왔을 때 발생" />
                            <TriggerCard title="신규 점포 등록" desc="새 점포가 생성되어 NORMAL 상태로 초기 기록될 때 발생" />
                        </div>
                    </section>

                    {/* 2. QSC */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2 border-gray-100">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-purple-600" />
                            </span>
                            2. QSC 점검 관련 트리거 (현장 품질 관리)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TriggerCard title="점검 등급 불합격" desc="점검 결과 등급이 C 또는 D인 경우(70점 이하) 발생" severity="CRITICAL" />
                            <TriggerCard title="점수 급락" desc="직전 점검 대비 총점이 10점 이상 하락한 경우 발생" severity="WARNING" />
                            <TriggerCard title="B등급 연속 발생" desc="관리 권고 등급인 B등급이 2회 연속으로 발생하여 재점검이 필요한 경우 발생" severity="WARNING" />
                            <TriggerCard title="위생 카테고리 위험" desc="위생 관련 점수가 임계치를 초과하거나 위험 신호가 감지될 때 발생" severity="CRITICAL" />
                        </div>
                    </section>

                    {/* 3. POS */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2 border-gray-100">
                            <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-green-600" />
                            </span>
                            3. POS 성과 관련 트리거 (실적 및 효율)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TriggerCard title="매출 급락" desc="주별 매출이 전주 대비 5~10% 이상 하락한 경우 발생" severity="WARNING" />
                            <TriggerCard title="마진율 급락" desc="주별 마진율이 전주 대비 15% 이상 하락한 경우 발생" severity="WARNING" />
                            <TriggerCard title="주문수 급감" desc="주별 주문수가 전주 대비 15% 이상 하락한 경우 발생" severity="WARNING" />
                        </div>
                    </section>

                    {/* 4. Risk Score */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2 border-gray-100">
                            <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                            </span>
                            4. 위험 점수 및 지능형 분석 트리거
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TriggerCard title="위험 등급 격상" desc="산출된 위험 점수(Risk Score)가 75점을 초과하여 RISK 등급으로 변경될 때 발생" severity="CRITICAL" />
                            <TriggerCard title="위험 점수 임계 초과" desc="위험 점수가 사전에 정의된 위험 수치에 도달할 때 발생" severity="CRITICAL" />
                        </div>
                    </section>

                    {/* 5. Complex */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2 border-gray-100">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                            </span>
                            5. 복합 및 운영 관리 트리거
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TriggerCard title="이벤트 누적 발생" desc="30일 이내에 동일 유형의 이벤트가 3회 이상 반복해서 발생할 때 발생" severity="WARNING" />
                            <TriggerCard title="조치 미이행" desc="생성된 이벤트나 리포트에 따른 시정 조치가 특정 기간 내에 완료되지 않았을 때 발생" severity="WARNING" />
                            <TriggerCard title="방문 관리 공백" desc="슈퍼바이저(SV)의 매장 방문이나 점검 활동이 한 달 이상 발생하지 않았을 때 발생" severity="WARNING" />
                        </div>
                    </section>

                    {/* Legend */}
                    <div className="bg-gray-100 rounded-lg p-4 mt-8">
                        <h4 className="font-bold text-gray-700 mb-3 text-sm">이벤트 심각도 (Severity) 안내</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="font-bold text-red-700">위험 (Critical)</span>
                                <span className="text-gray-500">- 점검 불합격, 매출 20% 급락 등</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                                <span className="font-bold text-orange-700">관찰 필요 (Warning)</span>
                                <span className="text-gray-500">- 점수 10점 하락, 매출 10% 하락 등</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="font-bold text-blue-700">정보 (Info)</span>
                                <span className="text-gray-500">- 상태 회복, 담당자 변경 등</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

function TriggerCard({ title, desc, severity = 'INFO' }: { title: string, desc: string, severity?: 'CRITICAL' | 'WARNING' | 'INFO' }) {
    const colorClass =
        severity === 'CRITICAL' ? 'border-l-4 border-l-red-500' :
            severity === 'WARNING' ? 'border-l-4 border-l-orange-400' :
                'border-l-4 border-l-blue-500';

    return (
        <div className={`bg-white border border-gray-200 p-4 rounded shadow-sm ${colorClass}`}>
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-gray-900">{title}</h4>
                {severity !== 'INFO' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                        {severity}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-600 break-keep">{desc}</p>
        </div>
    );
}
