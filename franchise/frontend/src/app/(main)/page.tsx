'use client';

import Link from 'next/link';
import { StorageService } from '@/lib/storage';
import { MOCK_BRIEFING } from '@/lib/mock/mockBriefingData';
import BriefingWidget from '@/components/dashboard/BriefingWidget';
import {
  AlertTriangle, TrendingUp, Users, Store as StoreIcon,
  ClipboardList, Siren, Bell, ArrowRight, Activity, Calendar, CheckSquare, MapPin,
  ClipboardCheck, AlertCircle, TrendingDown, CheckCircle2, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { MOCK_STORES } from '@/lib/mock/mockData';
import { MOCK_EVENTS } from '@/lib/mock/mockEventData';
import { MOCK_RISK_PROFILES } from '@/lib/mock/mockRiskData';
import { ActionService } from '@/services/actionService';
import { DashboardService } from '@/services/dashboardService';
import { AdminDashboardSummary } from '@/types';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/authService';
import { StoreService } from '@/services/storeService';
import { User, Store } from '@/types';
import { ManagerDashboard } from '@/components/dashboard/manager/ManagerDashboard';
import SVDashboard from '@/components/dashboard/SVDashboard';

// --- ADMIN DASHBOARD ---
function AdminDashboard() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await DashboardService.getAdminSummary();
        setSummary(data);
      } catch (error) {
        console.error("Failed to load admin dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Use backend data or defaults
  const totalStores = summary?.totalStoreCount ?? 0;
  const riskStores = summary?.riskStoreCount ?? 0;
  // Calculate percent manually
  const riskPercent = totalStores > 0 ? ((riskStores / totalStores) * 100).toFixed(1) : 0;
  const newEvents = summary?.newEventCount ?? 0;
  const unresolvedActions = summary?.pendingActionCount ?? 0;
  const topRiskStores = summary?.riskTopStores ?? [];

  // Map backend trend data to chart format
  const formatMonth = (m: string) => {
    if (!m || !m.includes('-')) return m;
    return `${parseInt(m.split('-')[1])}월`;
  };

  const qscTrendData = summary?.avgQscTrend?.map((p: any) => ({
    month: formatMonth(p.month),
    score: p.avgScore
  })) ?? [];

  const salesTrendData = summary?.salesChangeTrend?.map((p: any) => ({
    month: formatMonth(p.month),
    sales: p.changeRate || 0
  })) ?? [];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">운영 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">전체 가맹점의 운영 현황과 주요 위험 요소를 실시간으로 모니터링합니다.</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">전체 가맹점 수</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalStores}개</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-red-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">위험(Risk) 점포</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{riskStores}개</h3>

          </div>
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Siren className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">신규 이벤트 (48h)</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{newEvents}건</h3>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600"><Bell className="w-5 h-5" /></div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">조치 미이행/지연</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{unresolvedActions}건</h3>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><ClipboardList className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Admin Charts Area */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 flex items-center mb-4"><Activity className="w-4 h-4 mr-2 text-blue-500" />평균 QSC 점수 추이</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qscTrendData} margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Sales Trend */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 flex items-center mb-4"><TrendingUp className="w-4 h-4 mr-2 text-green-500" />전체 매출 변화율</h3>
              <div className="h-[200px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={salesTrendData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} /></BarChart></ResponsiveContainer></div>
            </div>
          </div>

        </div>
        {/* Risk Stores List */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
          <h3 className="font-bold text-gray-900 flex items-center mb-4"><AlertTriangle className="w-4 h-4 mr-2 text-red-500" />위험 점포 TOP 5</h3>
          <div className="space-y-4">
            {topRiskStores.length > 0 ? (topRiskStores as any[]).map((store: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-700 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {i + 1}. {store.storeName}
                </span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded min-w-[50px] text-center">{store.riskScore}점</span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">위험 점포가 없습니다.</div>
            )}
            <div className="pt-2 text-xs text-center text-gray-400">
              * 최근 30일 내 리스크 스코어 기준
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      setUser(currentUser);
      setIsLoading(false);
    };
    checkUser();
  }, []);

  if (isLoading || !user) return <div className="p-8 text-center">Loading...</div>;

  const isTeamLeader = user.role === 'SUPERVISOR' || user.role === 'ADMIN' || user.role === 'MANAGER';

  return (
    <>
      {user.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : user.role === 'MANAGER' ? (
        <ManagerDashboard user={user} />
      ) : (
        <SVDashboard user={user} />
      )}
    </>
  );
}
