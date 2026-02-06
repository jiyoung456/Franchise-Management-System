import { useState, useEffect } from 'react';
import { X, ExternalLink, Activity, Calendar, Clock, BarChart3, ChevronRight, CheckCircle2, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { StoreService } from '@/services/storeService';
import { ActionService } from '@/services/actionService';
import { StoreDetail } from '@/types';

interface StoreReportDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string | null;
    viewType?: 'EVENT' | 'ACTION';
    initialSvName?: string;
    eventSummary?: string;
    eventId?: string;
}

export function StoreReportDrawer({ isOpen, onClose, storeId, viewType = 'EVENT', initialSvName, eventSummary, eventId }: StoreReportDrawerProps) {
    const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [actionType, setActionType] = useState('VISIT');
    const [targetMetric, setTargetMetric] = useState('QSC');
    const [dueDate, setDueDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toISOString().split('T')[0];
    });
    const [priority, setPriority] = useState('HIGH');

    // Reset form when drawer opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setActionType('VISIT');
            setPriority('HIGH');
            setDueDate(() => {
                const d = new Date();
                d.setDate(d.getDate() + 3);
                return d.toISOString().split('T')[0];
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && storeId) {
            const fetchDetail = async () => {
                try {
                    setIsLoading(true);
                    const detail = await StoreService.getStoreDetail(storeId);
                    setStoreDetail(detail);
                    if (detail) {
                        // SV 이름이 ID 형태인 경우(예: sv01), 조치 관리 목록에서 실명 찾아보기
                        if (!initialSvName && detail.supervisor && (detail.supervisor.includes('sv') || /\d/.test(detail.supervisor))) {
                            const allActions = await ActionService.getActions();
                            const storeAction = allActions.find(a => String(a.storeId) === String(storeId) && a.assigneeName);
                            if (storeAction?.assigneeName) {
                                setStoreDetail(prev => prev ? { ...prev, supervisor: storeAction.assigneeName! } : prev);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch store detail:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetail();
        }
    }, [isOpen, storeId]);

    const handleSubmitAction = async () => {
        if (!storeId || !storeDetail) return;

        try {
            setIsSubmitting(true);
            // Map UI action type to Backend constant
            const backendActionType =
                actionType === 'EDUCATION' ? 'TRAINING' :
                    actionType === 'RESOURCES' ? 'PERSONNEL' :
                        actionType; // VISIT, PROMOTION, FACILITY match

            // Ensure we have a numeric ID for the supervisor
            let svId = Number(storeDetail.currentSupervisorId);
            if (isNaN(svId) || svId === 0) {
                // Try to extract ID if it's like "sv01" -> 1 (This is a guess, but helpful for 500 errors)
                const idMatch = String(storeDetail.currentSupervisorId).match(/\d+/);
                svId = idMatch ? Number(idMatch[0]) : 0;
            }

            const success = await ActionService.createAction({
                storeId: Number(storeId),
                title: title || `${storeDetail.name} 조치 요청`,
                description: description,
                actionType: backendActionType,
                priority: priority,
                dueDate: dueDate,
                assignedToUserId: svId,
                relatedEventId: eventId ? Number(eventId) : undefined
            });

            if (success) {
                alert('조치 지시가 성공적으로 발송되었습니다.');
                onClose();
            } else {
                alert('조치 지시 발송에 실패했습니다.');
            }
        } catch (error) {
            console.error('Action creation failed:', error);
            alert('오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !storeId) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
                <div className="relative w-full max-w-2xl bg-[#f8fafc] h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-[#f8fafc] h-full shadow-2xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-[#1a73e8]/10 text-[#1a73e8] text-[10px] font-bold uppercase tracking-wider">
                                {viewType === 'EVENT' ? '이벤트 상세 리포트' : '조치 생성'}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {storeDetail?.name || '로딩 중...'}
                            <button className="text-slate-400 hover:text-blue-600">
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar">
                    {viewType === 'EVENT' ? (
                        <>
                            {/* 1. AI Analysis Summary */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-900">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold">AI 진단 요약</h3>
                                </div>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden text-sm">
                                    <p className="leading-relaxed opacity-90 relative z-10">
                                        해당 점포는 현재 <span className="text-red-400 font-bold">운영 일관성에서 심각한 하락 추세</span>를 보이고 있습니다.
                                        AI 분석 결과, <span className="text-blue-400">인력 이탈</span>과 <span className="text-blue-400">고객 대기 시간</span> 사이에 높은 상관관계가 발견되었습니다.
                                        지난 14일 동안 매출에 약 -15%의 영향을 주었으며, QSC 위생 점수 또한 지역 평균에 비해 뒤처지고 있습니다.
                                    </p>
                                    <div className="mt-6 flex items-center gap-4 relative z-10">
                                        <div className="flex-1 bg-white/10 rounded-xl p-3 border border-white/5">
                                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">위험 점수</div>
                                            <div className="text-xl font-black text-red-500">82.4</div>
                                        </div>
                                        <div className="flex-1 bg-white/10 rounded-xl p-3 border border-white/5">
                                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">신뢰도</div>
                                            <div className="text-xl font-black text-green-400">94%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Key Performance Indicators */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-900">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold">주요 지표 성과</h3>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <BarChart3 className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+2.4%</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">운영 건전성 점수 (Operation Health)</h4>
                                    <div className="text-2xl font-black text-slate-900">{storeDetail?.qscScore || 0} / 100</div>
                                    <p className="text-[10px] text-slate-400 mt-2">지난달 평균 대비 전체 운영 성과 점수</p>
                                </div>
                            </div>

                            {/* 3. Event History */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-slate-900">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold">리스크 이벤트 타임라인</h3>
                                </div>
                                <div className="space-y-6 relative ml-3 border-l-2 border-slate-100 pl-6 py-2">
                                    <div className="relative">
                                        <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm ring-1 ring-slate-100" />
                                        <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <Calendar className="w-3 h-3" /> 2026.01.14 • 오전 10:24
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">주요 인력 이탈 감지</h4>
                                        <p className="text-xs text-slate-500 mt-1">핵심 주방 인력 3명이 48시간 이내에 퇴사 처리되었습니다.</p>
                                        <div className="mt-2 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block">심각한 영향</div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-sm ring-1 ring-slate-100" />
                                        <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <Calendar className="w-3 h-3" /> 2026.01.12 • 오후 05:45
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">피크 시간대 대기 시간 &gt; 15분</h4>
                                        <p className="text-xs text-slate-500 mt-1">저녁 피크 시간대 평균 주문 이행 시간이 18.5분에 도달했습니다.</p>
                                        <div className="mt-2 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block">경고</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            {/* Form Table */}
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-sm border-collapse">
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="w-32 px-4 py-3 bg-slate-50 font-bold text-slate-600 border-r border-slate-100">대상 점포</td>
                                            <td className="px-4 py-3 text-slate-700">{storeDetail?.name}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 bg-slate-50 font-bold text-slate-600 border-r border-slate-100">연관 이벤트</td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {eventSummary ? (
                                                    <span className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-[13px]">
                                                        {eventSummary}
                                                    </span>
                                                ) : (
                                                    <span className="italic opacity-60">이벤트 연동 데이터 불러오는 중...</span>
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 bg-slate-50 font-bold text-slate-600 border-r border-slate-100">조치 유형</td>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={actionType}
                                                    onChange={(e) => setActionType(e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 cursor-pointer"
                                                >
                                                    <option value="TRAINING">교육</option>
                                                    <option value="VISIT">방문</option>
                                                    <option value="RECHECK">재점검</option>
                                                    <option value="PROMOTION">프로모션</option>
                                                    <option value="FACILITY">시설 개선</option>
                                                    <option value="PERSONNEL">인력 보강</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 bg-slate-50 font-bold text-slate-600 border-r border-slate-100">담당자</td>
                                            <td className="px-3 py-2 text-slate-900">
                                                <select className="w-full px-2 py-1.5 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 cursor-pointer">
                                                    <option>{initialSvName || storeDetail?.supervisor || '담당자 선택'}</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 bg-slate-50 font-bold text-slate-600 border-r border-slate-100">목표 지표</td>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={targetMetric}
                                                    onChange={(e) => setTargetMetric(e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-transparent border-none focus:ring-0 text-slate-900 cursor-pointer"
                                                >
                                                    <option value="QSC">QSC</option>
                                                    <option value="SALES">매출</option>
                                                    <option value="HYGIENE">위생점수</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 bg-slate-50 font-bold text-slate-600 border-r border-slate-100">기한</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="date"
                                                    value={dueDate}
                                                    onChange={(e) => setDueDate(e.target.value)}
                                                    className="w-full px-2 py-1 border-none focus:ring-0 text-slate-700 bg-transparent"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 bg-slate-50 font-bold text-slate-600 border-r border-slate-100">우선순위</td>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={priority}
                                                    onChange={(e) => setPriority(e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 cursor-pointer"
                                                >
                                                    <option value="CRITICAL">CRITICAL (즉시 조치)</option>
                                                    <option value="HIGH">HIGH (빠른 대응)</option>
                                                    <option value="MEDIUM">MEDIUM (일주일 이내)</option>
                                                    <option value="LOW">LOW (순차 대응)</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Title & Content Section */}
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="flex border-b border-slate-100">
                                    <div className="w-28 px-4 py-4 bg-slate-50 font-bold text-slate-600 border-r border-slate-100 flex items-center">제목</div>
                                    <div className="flex-1 px-4">
                                        <input
                                            type="text"
                                            placeholder="조치 제목을 입력하세요"
                                            className="w-full py-4 bg-transparent border-none focus:ring-0 focus:outline-none text-sm placeholder:text-slate-300"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase">조치 내용</label>
                                    <textarea
                                        className="w-full h-48 bg-white border border-slate-100 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-300 resize-none"
                                        placeholder="조치 내용을 상세히 입력하세요."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button
                        disabled={isSubmitting}
                        onClick={handleSubmitAction}
                        className="w-full py-3 bg-[#1a73e8] text-white rounded-xl text-sm font-bold hover:bg-[#1557b0] shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                {viewType === 'EVENT' ? 'SV 조치 요청' : '생성된 조치 저장'}
                                <Send className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
