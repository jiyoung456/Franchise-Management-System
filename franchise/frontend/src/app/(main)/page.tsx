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
import AdminDashboard from '@/components/dashboard/AdminDashboard';

// Local AdminDashboard removed to use the specialized component in @/components/dashboard/AdminDashboard



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
        <AdminDashboard user={user} />
      ) : user.role === 'MANAGER' ? (
        <ManagerDashboard user={user} />
      ) : (
        <SVDashboard user={user} />
      )}
    </>
  );
}
