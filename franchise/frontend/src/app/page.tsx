'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/common/Logo';
import { ArrowRight, BarChart3, CheckCircle2, LayoutDashboard, Siren } from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();

    // Automatic redirect disabled as per user request. 
    // Users will always land here and click Login to proceed.

    return (
        <div className="flex flex-col min-h-screen font-sans bg-white text-slate-900">
            {/* Header / Nav */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-2">
                    <Logo />
                </div>
                <div>

                </div>
            </header>

            <main className="flex-1">
                {/* 1. Hero Section */}
                <section className="relative px-6 py-20 lg:py-32 text-center bg-gradient-to-b from-blue-50/50 to-white overflow-hidden">
                    <div className="max-w-4xl mx-auto relative z-10">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 font-bold text-xs mb-6 tracking-wide uppercase">
                            Franchise AI Risk Diagnosis Service
                        </span>
                        <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                            프랜차이즈 AI 위험 진단 서비스
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            매장 운영 리스크를 AI로 조기 감지하고<br className="hidden md:block" />
                            문제를 예측 · 진단 · 개선까지 자동화합니다.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-[#4cb6e6] hover:bg-[#3aa3d3] text-white font-bold rounded-xl text-lg shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1"
                            >
                                로그인하기
                            </Link>

                            <button
                                onClick={() => {
                                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-lg hover:bg-slate-50 transition-all"
                            >
                                서비스 살펴보기
                            </button>
                        </div>
                    </div>

                    {/* Background Decorative Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
                </section>

                {/* 2. Core Features */}
                <section id="features" className="px-6 py-20 bg-slate-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">핵심 기능 요약</h2>
                            <p className="text-slate-500">점포 관리부터 위험 진단까지, 모든 과정을 하나의 플랫폼에서.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Feature 1 */}
                            <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Siren className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">AI 위험 진단</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    위험 점수 산출 및 이상 징후를 실시간으로 탐지하여 리스크 이벤트를 자동으로 생성합니다.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <LayoutDashboard className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">점포 통합 관리</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Store Master, 상태 관리, 담당 SV 관리 등 점포의 모든 기본 정보를 체계적으로 관리합니다.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">QSC 디지털 점검</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    종이 체크리스트 대신 모바일 앱으로 점검하고, 리포트 생성 및 점수화를 자동화합니다.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">POS 성과 분석</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    매출, 객단가, 주문 건수 등 핵심 KPI를 시각화하고 기간별 트렌드를 분석합니다.
                                </p>
                            </div>


                        </div>
                    </div>
                </section>

                {/* 3. Service Flow */}
                <section className="px-6 py-20 bg-white">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">서비스 프로세스</h2>
                            <p className="text-slate-500">문제 발생 후 대응이 아닌, 발생 전에 예방하는 스마트 운영 시스템</p>
                        </div>

                        <div className="relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                {[
                                    { step: '01', title: '데이터 수집', desc: 'QSC / POS / 운영' },
                                    { step: '02', title: 'AI 분석', desc: '패턴 학습' },
                                    { step: '03', title: '진단', desc: '위험 점수 산출' },
                                    { step: '04', title: '알림', desc: '이벤트 발생' },
                                    { step: '05', title: '개선', desc: '조치 관리' }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center relative">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 relative z-10 ring-4 ring-white">
                                            {item.step}
                                        </div>
                                        <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Screen Preview */}
                <section className="px-6 py-20 bg-slate-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">실제 화면 미리보기</h2>
                            <p className="text-slate-500">직관적인 대시보드와 리포트로 누구나 쉽게 사용할 수 있습니다.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Dashboard Preview Placeholder */}
                            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100 group">
                                <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <span className="ml-2 text-xs text-slate-400 font-mono">Dashboard View</span>
                                </div>
                                <div className="p-8 flex items-center justify-center min-h-[300px] bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                    {/* Mock UI Structure */}
                                    <div className="w-full space-y-4 opacity-60">
                                        <div className="grid grid-cols-4 gap-4">
                                            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-lg shadow-sm"></div>)}
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="h-64 col-span-2 bg-white rounded-lg shadow-sm"></div>
                                            <div className="h-64 bg-white rounded-lg shadow-sm"></div>
                                        </div>
                                    </div>
                                    <div className="absolute font-bold text-slate-400 pointer-events-none">
                                        운영 대시보드 화면
                                    </div>
                                </div>
                            </div>

                            {/* QSC Report Preview Placeholder */}
                            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100 group">
                                <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <span className="ml-2 text-xs text-slate-400 font-mono">QSC Report View</span>
                                </div>
                                <div className="p-8 flex items-center justify-center min-h-[300px] bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                    {/* Mock UI Structure */}
                                    <div className="w-full space-y-4 opacity-60">
                                        <div className="h-12 w-1/3 bg-white rounded mb-8"></div>
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="h-12 bg-white rounded shadow-sm flex items-center px-4 justify-between">
                                                    <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute font-bold text-slate-400 pointer-events-none">
                                        QSC 점검 리포트 화면
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. CTA Section */}
                <section className="px-6 py-24 bg-[#4cb6e6] text-white text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl lg:text-4xl font-extrabold mb-6">지금 바로 시작하세요</h2>
                        <p className="text-blue-100 text-lg mb-0">
                            프랜차이즈 운영, 이제 감이 아닌 데이터로 관리하세요.<br />
                            AI가 매장의 위험을 먼저 알려드립니다.
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white text-slate-500 py-12 px-6 border-t border-slate-100 text-sm">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    {/* Links */}
                    <div className="flex justify-center gap-6 font-bold text-slate-700">
                        <Link href="#">개인정보 처리방침</Link>
                        <span className="text-slate-300">|</span>
                        <Link href="#">이용약관</Link>
                    </div>

                    {/* Company Info */}
                    <div className="space-y-1 text-xs text-slate-500">
                        <p>
                            (주)알피자 <span className="mx-1">|</span> 경기도 성남시 분당구 불정로 90 (정자동) <span className="mx-1">|</span> 대표자명 : 김피자
                        </p>
                        <p>
                            사업자등록번호 : 102-81-42945 <span className="mx-1">|</span> 통신판매업신고 : 2026-경기성남-0048
                        </p>
                    </div>

                    {/* Copyright */}
                    <div className="text-xs text-slate-400">
                        © 2026 Alpizza Corp. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
