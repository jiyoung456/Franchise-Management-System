import { useState } from 'react';
import { User } from '@/types';
import { UrgentEventCards } from './AiUrgentInsights';
import { StoreReportDrawer } from './StoreReportDrawer';
import BriefingWidget from '@/components/dashboard/BriefingWidget';
import { MOCK_BRIEFING } from '@/lib/mock/mockBriefingData';
import { Calendar, Download } from 'lucide-react';

interface ManagerDashboardProps {
    user: User;
}

export function ManagerDashboard({ user }: ManagerDashboardProps) {
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerType, setDrawerType] = useState<'EVENT' | 'ACTION'>('EVENT');
    const [initialSvName, setInitialSvName] = useState<string | undefined>(undefined);
    const [eventSummary, setEventSummary] = useState<string | undefined>(undefined);
    const [eventId, setEventId] = useState<string | undefined>(undefined);

    const handleViewDetail = (id: string, type: 'EVENT' | 'ACTION', svName?: string, summary?: string, evtId?: string) => {
        setSelectedStoreId(id);
        setDrawerType(type);
        setInitialSvName(svName);
        setEventSummary(summary);
        setEventId(evtId);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            setSelectedStoreId(null);
            setEventSummary(undefined);
            setEventId(undefined);
        }, 300);
    };

    return (
        <div className="pb-24 space-y-10">
            {/* Header Section - Matched with EventManagement style */}
            <div className="flex items-center justify-between mb-13">
                <div>
                    <p className="text-xl text-gray-700">
                        반갑습니다, <span className="text-[#1a73e8] font-bold">{user.userName}</span> 팀장님. 오늘의 핵심 매장 지표를 분석했습니다.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>2025년 9월 1일 (월)</span>
                    </div>

                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-12">
                {/* 1. 오늘 확인이 필요한 이벤트 */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <UrgentEventCards onViewReport={handleViewDetail} />
                </section>

                {/* 2. 오늘의 할 일 (BriefingWidget) */}
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <BriefingWidget data={MOCK_BRIEFING} userName={user.userName} />
                </section>


            </div>

            {/* Slide-out Report/Action Drawer */}
            <StoreReportDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                storeId={selectedStoreId}
                viewType={drawerType}
                initialSvName={initialSvName}
                eventSummary={eventSummary}
                eventId={eventId}
            />
        </div>
    );
}
