import { X, ExternalLink, Activity, Calendar, Clock, BarChart3, ChevronRight, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

interface StoreReportDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string | null;
    viewType?: 'EVENT' | 'ACTION';
}

export function StoreReportDrawer({ isOpen, onClose, storeId, viewType = 'EVENT' }: StoreReportDrawerProps) {
    if (!isOpen || !storeId) return null;

    const storeName = "강남역점"; // Mock

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-[#1a73e8]/10 text-[#1a73e8] text-[10px] font-bold uppercase tracking-wider">
                                {viewType === 'EVENT' ? '이벤트 상세 리포트' : '조치 생성'}
                            </span>

                        </div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {storeName}
                            <button className="text-slate-400 hover:text-blue-600 transition-colors">
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
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
                                    <div className="text-2xl font-black text-slate-900">76 / 100</div>
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
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-900 px-1"></label>
                                <textarea
                                    className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    placeholder="담당 SV에게 보낼 상세 지시 내용을 입력하세요..."
                                    defaultValue="[긴급 조치 사항] 인력 이탈에 따른 운영 공백 보완을 위해 이번 주말 피크 타임 지원 인력 파견 및 점검을 지시합니다."
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-900 px-1">담당 SV 지정</label>
                                <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 transition-all cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">HK</div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">강현우 SV</div>

                                    </div>
                                    <CheckCircle2 className="w-5 h-5 ml-auto text-blue-600" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">

                    <button className="flex-2 py-3 bg-[#1a73e8] text-white rounded-xl text-sm font-bold hover:bg-[#1557b0] transition-all shadow-lg shadow-blue-200 px-8 flex items-center justify-center gap-2">
                        {viewType === 'EVENT' ? 'SV 조치 요청' : '조치 지시 발송'}
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
