'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { AuthService } from '@/services/authService';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import ReCAPTCHA from 'react-google-recaptcha';


type RoleOption = '관리자' | '팀장' | 'SV';

export default function LoginPage() {
    const router = useRouter();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleOption>('팀장');
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    // Tab State: 'MANAGER' | 'SUPERVISOR' | 'ADMIN'
    const [activeTab, setActiveTab] = useState<'MANAGER' | 'SUPERVISOR' | 'ADMIN'>('SUPERVISOR');
    const [isAccountLocked, setIsAccountLocked] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);

    // Check if account is locked when ID changes
    const checkAccountLock = (loginId: string) => {
        if (!loginId) {
            setIsAccountLocked(false);
            setFailedAttempts(0);
            return;
        }

        const lockKey = `login_lock_${loginId}`;
        const attemptsKey = `login_attempts_${loginId}`;
        const locked = localStorage.getItem(lockKey);
        const attempts = parseInt(localStorage.getItem(attemptsKey) || '0');

        setFailedAttempts(attempts);
        setIsAccountLocked(locked === 'true');
    };

    // Update lock check when ID changes
    const handleIdChange = (newId: string) => {
        setId(newId);
        checkAccountLock(newId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!captchaValue) {
            alert('로봇이 아님을 확인해주세요.');
            return;
        }

        // Check if account is locked
        const lockKey = `login_lock_${id}`;
        const attemptsKey = `login_attempts_${id}`;
        const locked = localStorage.getItem(lockKey);

        if (locked === 'true') {
            alert('계정이 잠겼습니다. 관리자에게 문의하세요.');
            return;
        }

        // 1. Login attempt
        // Use AuthService instead of StorageService
        try {
            const result = await AuthService.login(id, password, activeTab);

            if (result.success && result.user) {
                // Clear failed attempts on successful login
                localStorage.removeItem(lockKey);
                localStorage.removeItem(attemptsKey);
                setFailedAttempts(0);
                setIsAccountLocked(false);

                // Check for Warnings (Expired Password)
                if (result.code === 'EXPIRED') {
                    alert(result.message);
                }

                // 2. Validate Role based on Active Tab
                const userRole = result.user.role;

                if (userRole !== activeTab) {
                    let tabName = '팀장';
                    if (activeTab === 'SUPERVISOR') tabName = 'SV';
                    if (activeTab === 'ADMIN') tabName = '관리자';

                    alert(`해당 계정은 ${tabName} 탭에서 로그인할 수 없습니다.`);
                    recaptchaRef.current?.reset();
                    setCaptchaValue(null);
                    return;
                }

                router.push('/dashboard');
            } else {
                // Increment failed attempts
                const currentAttempts = parseInt(localStorage.getItem(attemptsKey) || '0');
                const newAttempts = currentAttempts + 1;
                localStorage.setItem(attemptsKey, newAttempts.toString());
                setFailedAttempts(newAttempts);

                // Lock account after 5 failed attempts
                if (newAttempts >= 5) {
                    localStorage.setItem(lockKey, 'true');
                    setIsAccountLocked(true);
                    alert('로그인 5회 실패로 계정이 잠겼습니다. 관리자에게 문의하세요.');
                } else {
                    if (result.code === 'LOCKED') {
                        alert(result.message);
                    } else {
                        alert(`${result.message || '로그인에 실패했습니다.'}\n(${newAttempts}/5회 실패)`);
                    }
                }

                // Reset Captcha on failure
                recaptchaRef.current?.reset();
                setCaptchaValue(null);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 중 오류가 발생했습니다.');
            recaptchaRef.current?.reset();
            setCaptchaValue(null);
        }
    };

    return (
        <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden min-h-[600px] my-20">
            {/* LEFT PANEL: Branding & Signup Action */}
            <div className="hidden md:flex flex-col w-1/2 bg-[#F8FAFC] p-12 relative min-h-[600px] items-center justify-center">



                {/* Center Content */}
                <div className="flex flex-col items-center justify-center gap-6 mt-10">
                    <div className="transform scale-150 mb-4">
                        <Logo />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-800">환영합니다!</h2>
                        <p className="text-gray-500">
                            프랜차이즈 AI 위험 진단 서비스 Frima입니다.<br />
                            로그인하여 서비스를 이용하세요.
                        </p>
                    </div>

                    {/* Signup Action - Moved Here for Alignment */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 w-full mt-8">
                        <p className="text-gray-600 font-medium">아직 계정이 없으신가요?</p>
                        <Link
                            href={`/signup?type=${activeTab}`}
                            className="w-full py-3 bg-[#E0F2FE] text-[#0284C7] font-bold rounded-lg hover:bg-[#D0EBFD] transition-colors text-center"
                        >
                            {activeTab === 'MANAGER' && '팀장 회원가입'}
                            {activeTab === 'SUPERVISOR' && 'SV 회원가입'}
                            {activeTab === 'ADMIN' && '관리자 회원가입'}
                        </Link>
                    </div>

                    {/* Test Accounts Memo */}
                    <div className="w-full mt-8 p-6 bg-white rounded-2xl border border-gray-100 flex flex-col gap-4 shadow-sm">
                        <div className="text-gray-800 font-bold text-sm px-1">
                            테스트 계정 안내
                        </div>
                        <div className="flex flex-col gap-3 text-xs">
                            {/* SV */}
                            <div className="flex items-center justify-between bg-gray-50/50 px-4 py-3 rounded-xl border border-gray-50">
                                <span className="font-semibold text-gray-700 w-16">SV</span>
                                <div className="flex gap-4 text-gray-500">
                                    <span>ID <b className="font-bold text-[#2CA4D9] ml-1">sv02</b></span>
                                    <span>PW <b className="font-bold text-[#2CA4D9] ml-1">1234</b></span>
                                </div>
                            </div>
                            {/* Leader */}
                            <div className="flex items-center justify-between bg-gray-50/50 px-4 py-3 rounded-xl border border-gray-50">
                                <span className="font-semibold text-gray-700 w-16">팀장</span>
                                <div className="flex gap-4 text-gray-500">
                                    <span>ID <b className="font-bold text-[#2CA4D9] ml-1">leader01</b></span>
                                    <span>PW <b className="font-bold text-[#2CA4D9] ml-1">1234</b></span>
                                </div>
                            </div>
                            {/* Admin */}
                            <div className="flex items-center justify-between bg-gray-50/50 px-4 py-3 rounded-xl border border-gray-50">
                                <span className="font-semibold text-gray-700 w-16">관리자</span>
                                <div className="flex gap-4 text-gray-500">
                                    <span>ID <b className="font-bold text-[#2CA4D9] ml-1">admin01</b></span>
                                    <span>PW <b className="font-bold text-[#2CA4D9] ml-1">1234</b></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Login Form */}
            <div className="w-full md:w-1/2 p-12 bg-white flex flex-col justify-center">
                {/* Mobile Heading */}
                <div className="md:hidden text-center mb-8">

                    <h2 className="text-2xl font-bold text-gray-800">로그인</h2>
                </div>

                {/* Tabs */}
                <div className="flex border-b-2 border-gray-100 mb-8 w-full">
                    <button
                        type="button"
                        className={`flex-1 pb-4 text-lg font-bold text-center transition-all relative ${activeTab === 'SUPERVISOR' ? 'text-[#2CA4D9] border-b-2 border-[#2CA4D9] -mb-[2px]' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab('SUPERVISOR')}
                    >
                        SV
                    </button>
                    <button
                        type="button"
                        className={`flex-1 pb-4 text-lg font-bold text-center transition-all relative ${activeTab === 'MANAGER' ? 'text-[#2CA4D9] border-b-2 border-[#2CA4D9] -mb-[2px]' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab('MANAGER')}
                    >
                        팀장
                    </button>
                    <button
                        type="button"
                        className={`flex-1 pb-4 text-lg font-bold text-center transition-all relative ${activeTab === 'ADMIN' ? 'text-[#2CA4D9] border-b-2 border-[#2CA4D9] -mb-[2px]' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab('ADMIN')}
                    >
                        관리자
                    </button>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* ID Field */}
                    <div className="space-y-2">
                        <label htmlFor="id" className="block text-sm font-semibold text-gray-700">
                            아이디
                        </label>
                        <input
                            id="id"
                            type="text"
                            required
                            value={id}
                            onChange={(e) => handleIdChange(e.target.value)}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2CA4D9] focus:ring-2 focus:ring-[#2CA4D9]/20 text-gray-900 placeholder-gray-400 transition-all font-medium"
                            placeholder="아이디를 입력해주세요."
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2 relative">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                            비밀번호
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2CA4D9] focus:ring-2 focus:ring-[#2CA4D9]/20 text-gray-900 placeholder-gray-400 pr-12 transition-all font-medium"
                                placeholder="비밀번호를 입력해주세요."
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Account Lock Warning */}
                    {isAccountLocked && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                                    <span className="text-white text-xs font-bold">!</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-red-800 mb-1">계정이 잠겼습니다</h4>
                                    <p className="text-xs text-red-600">
                                        로그인 5회 실패로 계정이 잠겼습니다.<br />
                                        관리자에게 문의하여 계정 잠금을 해제하세요.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Failed Attempts Warning */}
                    {!isAccountLocked && failedAttempts > 0 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center mt-0.5">
                                    <span className="text-white text-xs font-bold">!</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-yellow-800 mb-1">로그인 실패 경고</h4>
                                    <p className="text-xs text-yellow-600">
                                        현재 {failedAttempts}회 로그인에 실패했습니다.<br />
                                        5회 실패 시 계정이 잠깁니다. (남은 시도: {5 - failedAttempts}회)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}



                    <div className="flex justify-center py-2 scale-90 origin-left">
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            // sitekey="6LfPelIsAAAAACapytC9T-lAKpCbP0X1KgC-bfaq"
                            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                            onChange={(val) => setCaptchaValue(val)}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#2CA4D9] hover:bg-[#2088B5] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2CA4D9]/20 transition-all transform active:scale-[0.98] text-lg mt-2"
                    >
                        로그인
                    </button>

                    {/* Footer Links */}

                </form>
            </div>
        </div>
    );
}
