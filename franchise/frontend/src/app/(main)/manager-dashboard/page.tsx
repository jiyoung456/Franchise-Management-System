'use client';

import React, { useState } from 'react';
import { UrgentInsights } from '@/components/manager-dashboard/UrgentInsights';
import { StoreList } from '@/components/manager-dashboard/StoreList';
import { SupervisorOverview } from '@/components/manager-dashboard/SupervisorOverview';
import { RiskTrend } from '@/components/manager-dashboard/RiskTrend';
import { ActionDrawer } from '@/components/manager-dashboard/ActionDrawer';

export default function ManagerDashboardPage() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

    const handleOpenReport = (storeId: string) => {
        setSelectedStoreId(storeId);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedStoreId(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Team Manager Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of franchise operations and risk alerts</p>
            </header>

            <div className="space-y-6">
                {/* Top Section: Urgent Insights (Full Width) */}
                <section>
                    <UrgentInsights />
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Stores Needing Action (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        <StoreList onOpenReport={handleOpenReport} />
                    </div>

                    {/* Right Column: Trends & Supervisors (1/3 width) */}
                    <div className="space-y-6">
                        <RiskTrend />
                        <SupervisorOverview />
                    </div>
                </div>
            </div>

            <ActionDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                storeId={selectedStoreId}
            />
        </div>
    );
}
