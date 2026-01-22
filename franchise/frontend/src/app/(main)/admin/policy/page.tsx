'use client';

import Link from 'next/link';
import { Siren, CheckCircle, Bell, ArrowRight, Settings } from 'lucide-react';

export default function PolicyManagementPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">정책 관리 (Policy Management)</h1>
                <p className="text-sm text-gray-500 mt-1">
                    위험 감지, QSC 평가 기준, 알림 룰 등 시스템의 핵심 운영 정책을 설정합니다.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* 1. Event Rules */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        <Bell className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">이벤트 트리거 룰</h3>
                    <p className="text-sm text-gray-500 mb-4 h-10">
                        자동 이벤트를 생성하는 감지 조건과 임계값을 설정합니다.
                    </p>
                    <Link
                        href="/events/rules"
                        className="inline-flex items-center text-sm font-bold text-blue-600 hover:underline"
                    >
                        설정하기 <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {/* 2. Risk Config */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-red-200 transition-colors">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600 mb-4">
                        <Siren className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">위험/관찰 점수 기준</h3>
                    <p className="text-sm text-gray-500 mb-4 h-10">
                        RISK / WATCHLIST 진입 점수 및 상태 전환 규칙을 관리합니다.
                    </p>
                    <Link
                        href="/admin/policy/risk"
                        className="inline-flex items-center text-sm font-bold text-red-600 hover:underline"
                    >
                        설정하기 <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {/* 3. QSC Config */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-green-200 transition-colors">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">QSC 등급 산정 기준</h3>
                    <p className="text-sm text-gray-500 mb-4 h-10">
                        점검 점수에 따른 S/A/B/C/D 등급 매핑 테이블을 관리합니다.
                    </p>
                    <Link
                        href="/admin/policy/qsc"
                        className="inline-flex items-center text-sm font-bold text-green-600 hover:underline"
                    >
                        설정하기 <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
