'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { AuthService } from '@/services/authService';
import { Department, Team } from '@/types';
import { Logo } from '@/components/common/Logo';


const DEPARTMENTS: Department[] = ['서울/경기', '부산/경남', '강원/충청', '전라/광주', '대구/울산/경북', '제주'];
const TEAMS: Team[] = ['운영1팀', '운영2팀', '운영3팀', '가맹관리팀', '품질관리팀'];
type RoleOption = '관리자' | '팀장' | 'SV';

function SignupContent() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        loginId: '',
        userName: '',
        password: '',
        passwordConfirm: '',
        email: '',
        department: '서울/경기' as Department,
        team: '운영1팀' as Team
    });


    // Tab State: 'MANAGER' | 'SUPERVISOR' | 'ADMIN'
    const [activeTab, setActiveTab] = useState<'MANAGER' | 'SUPERVISOR' | 'ADMIN'>('MANAGER');
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type') as 'MANAGER' | 'SUPERVISOR' | 'ADMIN' | null;

    useEffect(() => {
        if (typeParam === 'MANAGER' || typeParam === 'SUPERVISOR' || typeParam === 'ADMIN') {
            setActiveTab(typeParam);
        }
    }, [typeParam]);

    const [isIdChecked, setIsIdChecked] = useState(false);
    const [idMessage, setIdMessage] = useState<{ text: string, type: 'success' | 'error' | '' }>({ text: '', type: '' });
    const [passwordError, setPasswordError] = useState('');
    const [emailMessage, setEmailMessage] = useState<{ text: string, type: 'success' | 'error' | '' }>({ text: '', type: '' });

    const validatePassword = (pwd: string) => {
        if (!pwd) {
            setPasswordError('');
            return false;
        }
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!regex.test(pwd)) {
            setPasswordError('비밀번호는 8자리 이상이며, 영문, 숫자, 특수문자를 모두 포함해야 합니다.');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const validateEmail = async (addr: string) => {
        if (!addr) {
            setEmailMessage({ text: '', type: '' });
            return false;
        }
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(addr)) {
            setEmailMessage({ text: '올바른 이메일 형식이 아닙니다.', type: 'error' });
            return false;
        }
        // Backend doesn't support duplicate check, skip it
        setEmailMessage({ text: '', type: '' });
        return true;
    };



    // Terms and Agreements State
    const [agreements, setAgreements] = useState({
        terms: false, // 이용약관 (필수)
        privacy: false, // 개인정보 (필수)
        marketing: false // 마케팅 (선택)
    });

    const [viewingAgreement, setViewingAgreement] = useState<'terms' | 'privacy' | 'marketing' | null>(null);

    const handleAgreementChange = (key: keyof typeof agreements) => {
        setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAllAgreementChange = () => {
        const allChecked = agreements.terms && agreements.privacy && agreements.marketing;
        setAgreements({
            terms: !allChecked,
            privacy: !allChecked,
            marketing: !allChecked
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset ID check if loginId changes
        if (name === 'loginId') {
            setIsIdChecked(false);
            setIdMessage({ text: '', type: '' });
        }
        if (name === 'password') validatePassword(value);
        if (name === 'email') setEmailMessage({ text: '', type: '' }); // Reset on type, check on blur
    };


    const handleIdCheck = async () => {
        if (!formData.loginId.trim()) {
            setIdMessage({ text: '아이디를 입력해주세요.', type: 'error' });
            return;
        }

        const isDuplicate = await AuthService.checkDuplicateId(formData.loginId, activeTab);

        if (isDuplicate) {
            setIdMessage({ text: '사용 불가능합니다. 다른 아이디로 바꿔주십시오.', type: 'error' });
            setIsIdChecked(false);
        } else {
            setIdMessage({ text: '사용 가능합니다.', type: 'success' });
            setIsIdChecked(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isIdChecked) {
            alert('아이디 중복 확인을 해주세요.');
            return;
        }

        if (!validatePassword(formData.password)) {
            alert('비밀번호 형식이 올바르지 않습니다.');
            return;
        }

        if (!(await validateEmail(formData.email))) {
            // validateEmail sets message
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!agreements.terms) {
            alert('이용약관에 동의해주세요.');
            return;
        }

        if (!agreements.privacy) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }

        // Map UI Role based on Tab
        const role = activeTab;

        // Determine team: Admin gets '운영본부', others use selected team
        const teamValue = role === 'ADMIN' ? '운영본부' : formData.team;

        // Register
        const result = await AuthService.register({
            loginId: formData.loginId,
            email: formData.email,
            userName: formData.userName,
            password: formData.password,
            department: formData.department,
            team: teamValue,
            role: role
        });

        if (result.success) {
            alert('회원가입이 완료되었습니다.');
            router.push('/login');
        } else {
            alert(result.message || '회원가입에 실패했습니다.');
        }
    };

    const closeModal = () => setViewingAgreement(null);

    return (
        <div className="w-full max-w-[400px] p-6 mt-10">
            {/* Logo Section */}
            <div className="text-center mb-10">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Logo />
                    </div>
                </div>
                <h2 className="mt-6 text-xl text-gray-500 font-medium">회원가입</h2>
            </div>

            {/* Tabs - HIDE if typeParam exists (user selected strictly from Login) */}
            {!typeParam && (
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        type="button"
                        className={`flex-1 pb-3 text-lg font-bold text-center transition-colors relative ${activeTab === 'MANAGER' ? 'text-[#3E4CB5]' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('MANAGER')}
                    >
                        팀장
                        {activeTab === 'MANAGER' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#3E4CB5]" />}
                    </button>
                    <button
                        type="button"
                        className={`flex-1 pb-3 text-lg font-bold text-center transition-colors relative ${activeTab === 'SUPERVISOR' ? 'text-[#3E4CB5]' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('SUPERVISOR')}
                    >
                        SV
                        {activeTab === 'SUPERVISOR' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#3E4CB5]" />}
                    </button>
                    <button
                        type="button"
                        className={`flex-1 pb-3 text-lg font-center transition-colors relative ${activeTab === 'ADMIN' ? 'text-[#2b3580]' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('ADMIN')}
                    >
                        관리자
                        {activeTab === 'ADMIN' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2b3580]" />}
                    </button>
                </div>
            )}

            {/* If Tabs are hidden, show Title explicitly */}
            {typeParam && (
                <div className="mb-6 text-center border-b border-gray-200 pb-3">
                    <h3 className="text-lg font-bold text-[#3E4CB5]">
                        {activeTab === 'MANAGER' && '팀장 회원가입'}
                        {activeTab === 'SUPERVISOR' && 'SV 회원가입'}
                        {activeTab === 'ADMIN' && '관리자 회원가입'}
                    </h3>
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* ID */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">아이디</label>
                    <div className="flex gap-2">
                        <input
                            name="loginId"
                            type="text"
                            required
                            value={formData.loginId}
                            onChange={handleChange}
                            placeholder="아이디를 입력해주세요."
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-[#2CA4D9] text-gray-900 placeholder-gray-300"
                        />
                        <button
                            type="button"
                            onClick={handleIdCheck}
                            className="px-4 py-2 bg-[#46B3E6] text-white text-sm font-bold rounded-sm hover:bg-[#3AA0D0] whitespace-nowrap"
                        >
                            중복 확인
                        </button>
                    </div>
                    {idMessage.text && (
                        <p className={`text-xs mt-1 ${idMessage.type === 'success' ? 'text-blue-500' : 'text-red-500'}`}>
                            {idMessage.text}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">비밀번호(8자리 이상, 영문/숫자/기호 포함)</label>
                    <input
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="비밀번호를 입력해주세요."
                        className={`w-full px-4 py-3 border rounded-sm focus:outline-none focus:border-[#2CA4D9] text-gray-900 placeholder-gray-300 ${passwordError ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                </div>

                {/* Password Confirm */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">비밀번호 확인</label>
                    <input
                        name="passwordConfirm"
                        type="password"
                        required
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        placeholder="비밀번호를 다시 한번 입력해주세요."
                        className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-[#2CA4D9] text-gray-900 placeholder-gray-300"
                    />
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">이름</label>
                    <input
                        name="userName"
                        type="text"
                        required
                        value={formData.userName}
                        onChange={handleChange}
                        placeholder="이름을 입력해주세요."
                        className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-[#2CA4D9] text-gray-900 placeholder-gray-300"
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">이메일(변경 불가)</label>
                    <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="이메일을 입력해주세요."
                        className={`w-full px-4 py-3 border rounded-sm focus:outline-none focus:border-[#2CA4D9] text-gray-900 placeholder-gray-300 ${emailMessage.type === 'error' ? 'border-red-500' : 'border-gray-200'}`}
                        onBlur={() => validateEmail(formData.email)}
                    />
                    {emailMessage.text && (
                        <p className={`text-xs mt-1 ${emailMessage.type === 'success' ? 'text-blue-500' : 'text-red-500'}`}>
                            {emailMessage.text}
                        </p>
                    )}
                </div>



                {/* Department (Region) - Only for STAFF equivalent (Manager/Supervisor) */}
                {(activeTab === 'MANAGER' || activeTab === 'SUPERVISOR') && (
                    <>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-600">담당 지역</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-[#2CA4D9] text-gray-700 bg-white"
                            >
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-600">부서</label>
                            <select
                                name="team"
                                value={formData.team}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-[#2CA4D9] text-gray-700 bg-white"
                            >
                                {TEAMS.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}



                {/* Terms and Agreements */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                    <label className="flex items-center cursor-pointer">
                        <div className={`w-5 h-5 border flex items-center justify-center rounded-[2px] mr-2 transition-colors ${agreements.terms && agreements.privacy && agreements.marketing
                            ? 'bg-[#2CA4D9] border-[#2CA4D9]'
                            : 'border-gray-300 bg-white'
                            }`}>
                            {(agreements.terms && agreements.privacy && agreements.marketing) &&
                                <div className="w-3 h-3 text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                            }
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={agreements.terms && agreements.privacy && agreements.marketing}
                            onChange={handleAllAgreementChange}
                        />
                        <span className="text-sm font-bold text-gray-800">
                            전체 동의하기
                        </span>
                    </label>

                    <div className="pl-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer flex-1">
                                <div className={`w-4 h-4 border flex items-center justify-center rounded-[2px] mr-2 transition-colors ${agreements.terms ? 'bg-[#2CA4D9] border-[#2CA4D9]' : 'border-gray-300 bg-white'}`}>
                                    {agreements.terms && <div className="w-2 h-2 text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={agreements.terms}
                                    onChange={() => handleAgreementChange('terms')}
                                />
                                <span className="text-sm text-gray-600">[필수] 이용약관 동의</span>
                            </label>
                            <button type="button" className="text-xs text-gray-400 underline" onClick={() => setViewingAgreement('terms')}>보기</button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer flex-1">
                                <div className={`w-4 h-4 border flex items-center justify-center rounded-[2px] mr-2 transition-colors ${agreements.privacy ? 'bg-[#2CA4D9] border-[#2CA4D9]' : 'border-gray-300 bg-white'}`}>
                                    {agreements.privacy && <div className="w-2 h-2 text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={agreements.privacy}
                                    onChange={() => handleAgreementChange('privacy')}
                                />
                                <span className="text-sm text-gray-600">[필수] 개인정보 수집 및 이용 동의</span>
                            </label>
                            <button type="button" className="text-xs text-gray-400 underline" onClick={() => setViewingAgreement('privacy')}>보기</button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer flex-1">
                                <div className={`w-4 h-4 border flex items-center justify-center rounded-[2px] mr-2 transition-colors ${agreements.marketing ? 'bg-[#2CA4D9] border-[#2CA4D9]' : 'border-gray-300 bg-white'}`}>
                                    {agreements.marketing && <div className="w-2 h-2 text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={agreements.marketing}
                                    onChange={() => handleAgreementChange('marketing')}
                                />
                                <span className="text-sm text-gray-600">[선택] 마케팅 정보 수신 동의</span>
                            </label>
                            <button type="button" className="text-xs text-gray-400 underline" onClick={() => setViewingAgreement('marketing')}>보기</button>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-[#46B3E6] hover:bg-[#3AA0D0] text-white font-bold py-3.5 rounded-sm shadow-sm transition-colors text-lg"
                >
                    회원가입
                </button>
            </form>

            {/* Agreement Modal */}
            {viewingAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">
                                {viewingAgreement === 'terms' && '이용약관'}
                                {viewingAgreement === 'privacy' && '개인정보 수집 및 이용'}
                                {viewingAgreement === 'marketing' && '마케팅 정보 수신'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {viewingAgreement === 'terms' && TERMA_TEXT}
                            {viewingAgreement === 'privacy' && PRIVACY_TEXT}
                            {viewingAgreement === 'marketing' && MARKETING_TEXT}
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignupContent />
        </Suspense>
    );
}

const TERMA_TEXT = `제1조 (목적)
본 약관은 알피자(이하 "회사")가 제공하는 프랜차이즈 관리 시스템 및 관련 제반 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. "회원"이라 함은 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
2. "아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.

제3조 (약관의 게시와 개정)
1. 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
2. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.

제4조 (서비스의 제공 등)
1. 회사는 회원에게 아래와 같은 서비스를 제공합니다.
   - 가맹점 통합 관리 기능
   - QSC 점검 및 보고서 기능
   - 매출 분석 및 통계 제공
2. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.`;

const PRIVACY_TEXT = `1. 개인정보의 수집 및 이용 목적
회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
- 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 가입 의사 확인
- 서비스 제공: 프랜차이즈 매장 관리, QSC 점검 리포트 생성 및 발송
- 고충 처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보

2. 수집하는 개인정보의 항목
- 필수항목: 아이디, 비밀번호, 이름, 이메일, 휴대전화번호, 담당 지역(부서/직급)
- 서비스 이용 과정에서 생성되는 정보: 접속 로그, 접속 IP 정보, 서비스 이용 기록

3. 개인정보의 보유 및 이용 기간
회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
- 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)
`;

const MARKETING_TEXT = `1. 마케팅 정보 수신 동의
회사는 서비스를 운영함에 있어 각종 정보를 이메일, SMS, 알림톡 등의 방법으로 회원에게 제공할 수 있습니다.

2. 수신 동의 거부 시 불이익
본 마케팅 정보 수신 동의는 선택 사항이므로 동의를 거부하시더라도 기본 서비스 이용에는 제한이 없습니다. 다만, 새로운 기능 안내, 이벤트 혜택 등 유용한 정보 제공이 제한될 수 있습니다.

3. 전송 방법
- 이메일, SMS, 카카오톡 알림톡 등
`;
