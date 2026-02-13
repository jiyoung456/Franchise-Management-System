'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function Footer() {
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

    return (
        <>
            <footer className="bg-white text-slate-500 py-12 px-6 border-t border-slate-100 text-sm">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    {/* Links */}
                    <div className="flex justify-center gap-6 font-bold text-slate-700">
                        <button
                            type="button"
                            onClick={() => setIsPrivacyOpen(true)}
                            className="hover:text-blue-600 transition-colors cursor-pointer"
                        >
                            개인정보 처리방침
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                            type="button"
                            onClick={() => setIsTermsOpen(true)}
                            className="hover:text-blue-600 transition-colors cursor-pointer"
                        >
                            이용약관
                        </button>
                    </div>

                    {/* Company Info */}
                    <div className="space-y-1 text-xs text-slate-500">
                        <p>
                            (주)Frima <span className="mx-1">|</span> 경기도 성남시 분당구 불정로 90 (정자동) <span className="mx-1">|</span> 대표자명 : 김피자
                        </p>
                        <p>
                            사업자등록번호 : 102-81-42945 <span className="mx-1">|</span> 통신판매업신고 : 2026-경기성남-0048
                        </p>
                    </div>

                    {/* Copyright */}
                    <div className="text-xs text-slate-400">
                        © 2026 Frima Corp. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Terms of Service Modal */}
            {isTermsOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">이용약관</h3>
                            <button
                                type="button"
                                onClick={() => setIsTermsOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto text-slate-600 leading-relaxed space-y-6">
                            <section>
                                <h4 className="font-bold text-slate-900 mb-2">제1조 (목적)</h4>
                                <p>본 약관은 Frima(이하 "회사")가 제공하는 프랜차이즈 관리 시스템 및 관련 제반 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-2">제2조 (용어의 정의)</h4>
                                <p>1. "회원"이라 함은 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</p>
                                <p>2. "아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</p>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-2">제3조 (약관의 게시와 개정)</h4>
                                <p>1. 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
                                <p>2. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-2">제4조 (서비스의 제공 등)</h4>
                                <p>1. 회사는 회원에게 아래와 같은 서비스를 제공합니다.</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>가맹점 통합 관리 기능</li>
                                    <li>QSC 점검 및 보고서 기능</li>
                                    <li>매출 분석 및 통계 제공</li>
                                </ul>
                                <p className="mt-2">2. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
                            </section>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsTermsOpen(false)}
                                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Policy Modal */}
            {isPrivacyOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">개인정보 처리방침</h3>
                            <button
                                type="button"
                                onClick={() => setIsPrivacyOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto text-slate-600 leading-relaxed space-y-8 text-sm">
                            <section>
                                <p className="leading-7">
                                    본 서비스(이하 'FRIMA')는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」, 「위치정보의 보호 및 이용 등에 관한 법률」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                                </p>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-3 text-lg">제1조 개인정보의 처리목적, 수집 항목, 보유 및 이용기간</h4>
                                <p className="mb-4">회사는 프랜차이즈 점포 관리 및 AI 기반의 운영 효율화 서비스를 위하여 필요한 최소한의 개인정보만을 수집합니다.</p>
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="p-3 border-r border-slate-200 w-1/4">수집·이용 목적</th>
                                                <th className="p-3 border-r border-slate-200 w-1/2">개인정보 항목</th>
                                                <th className="p-3 w-1/4">보유기간</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs">
                                            <tr className="border-b border-slate-100">
                                                <td className="p-3 border-r border-slate-100 font-medium">점포 통합 마스터 관리 및 계약 관리</td>
                                                <td className="p-3 border-r border-slate-100">성명(점주/SV), 연락처, 점포 주소, Store_ID, 계약 요약 정보</td>
                                                <td className="p-3">점포 폐점 후 6개월까지</td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="p-3 border-r border-slate-100 font-medium">QSC 디지털 점검 및 리포트 생성</td>
                                                <td className="p-3 border-r border-slate-100">점검자 성명, 점검 사진(매장 내 이미지), 점검 코멘트</td>
                                                <td className="p-3">점포 폐점 후 6개월까지</td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="p-3 border-r border-slate-100 font-medium">POS 기반 성과 분석 및 KPI 도출</td>
                                                <td className="p-3 border-r border-slate-100">매출 데이터, 주문 내역, 점포별 영업 정보</td>
                                                <td className="p-3">점포 폐점 후 6개월까지</td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="p-3 border-r border-slate-100 font-medium">AI 위험 점수(Risk Score) 산출</td>
                                                <td className="p-3 border-r border-slate-100">POS 매출 추세, QSC 점수, SV 방문 이력, 외부 요인 결합 데이터</td>
                                                <td className="p-3">점포 폐점 후 6개월까지</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 border-r border-slate-100 font-medium">서비스 이용 기록(로그)</td>
                                                <td className="p-3 border-r border-slate-100">접속 IP, 쿠키, 서비스 이용 기록, 접속지 추적 자료</td>
                                                <td className="p-3">3개월</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-3 text-lg">제2조 개인정보의 파기절차 및 방법</h4>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>회사는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다. 특히 폐점 점포의 경우, 이력 관리 및 정산을 위해 폐점 시점으로부터 6개월간 별도 보관 후 재생 불가능한 방법으로 파기합니다.</li>
                                    <li>전자적 파일 형태는 기록을 재생할 수 없도록 파기하며, 종이 문서는 분쇄하거나 소각합니다.</li>
                                </ul>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-3 text-lg">제3조 개인정보 처리의 위탁</h4>
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="p-3 border-r border-slate-200 w-1/3">수탁자</th>
                                                <th className="p-3 w-2/3">위탁 업무 내용</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs">
                                            <tr className="border-b border-slate-100">
                                                <td className="p-3 border-r border-slate-100 font-medium">Amazon Web Services (AWS)</td>
                                                <td className="p-3">클라우드 인프라 운영, S3를 활용한 점검 사진 및 리포트 데이터 저장</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 border-r border-slate-100 font-medium">Google Cloud Platform</td>
                                                <td className="p-3">Gemini API를 활용한 점검 코멘트 및 이미지 분석 (AI 에이전트 운영)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-3 text-lg">제4조 개인정보의 제3자 제공</h4>
                                <p>회사는 정보주체의 동의가 있거나 법률의 특별한 규정에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. 단, 재난, 감염병, 급박한 생명·신체 위험 상황 발생 시에는 법령에 의거하여 관계 기관에 최소한의 정보를 제공할 수 있습니다.</p>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-3 text-lg">제5조 위치정보의 보호 및 처리에 관한 사항</h4>
                                <p>회사는 「위치정보의 보호 및 이용 등에 관한 법률」에 따라 다음과 같이 위치정보를 처리합니다.</p>
                                <ol className="list-decimal pl-5 space-y-1 mt-2">
                                    <li>처리 목적: 점포 위치 기반 권역 관리, 슈퍼바이저(SV) 방문 공백 관리 및 효율적 동선 최적화.</li>
                                    <li>보유 기간: 위치정보 이용·제공사실 확인자료는 법령에 따라 최소 6개월간 보존합니다.</li>
                                    <li>거부 권리: 정보주체는 위치정보 수집에 대한 동의를 거부하거나 일시 중지를 요청할 수 있습니다.</li>
                                </ol>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-3 text-lg">제6조 자동화된 결정에 대한 정보주체의 권리</h4>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>회사는 점포별 매출, QSC, 외부 데이터를 결합하여 위험 점수(Risk Score)를 산출하고 등급을 자동 결정하는 시스템을 운영합니다.</li>
                                    <li>정보주체는 자동화된 결정이 자신의 권리에 중대한 영향을 미치는 경우, 이에 대한 설명 요구 및 이의제기를 할 수 있습니다. 회사는 해당 요구를 받은 경우 담당자에 의한 재검토 등 필요한 조치를 취하고 결과를 통지합니다.</li>
                                </ul>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-3 text-lg">제7조 개인정보의 안전성 확보조치</h4>
                                <p>회사는 관리적 조치(내부관리계획 수립), 기술적 조치(AWS 암호화 저장, 접근권한 관리), 물리적 조치(출입 통제) 등을 통해 개인정보의 안전성을 확보하고 있습니다.</p>
                            </section>

                            <section>
                                <h4 className="font-bold text-slate-900 mb-3 text-lg">제8조 개인정보 보호책임자</h4>
                                <p>회사는 개인정보 보호책임자를 아래와 같이 지정하고 있습니다.</p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>부서명: [부서명 입력]</li>
                                    <li>성명: [성명 입력]</li>
                                    <li>연락처: [전화번호/이메일 입력]</li>
                                </ul>
                            </section>

                            <p className="text-right text-slate-400 text-xs mt-8">
                                이 개인정보 처리방침은 2026. 02. 11.부터 적용됩니다.
                            </p>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsPrivacyOpen(false)}
                                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
