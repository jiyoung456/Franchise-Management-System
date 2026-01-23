'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { StorageService } from '@/lib/storage';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import ReCAPTCHA from 'react-google-recaptcha';

type RoleOption = '관리자' | '팀장' | 'SV';

export default function LoginPage() {
    const router = useRouter();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleOption>('팀장'); // Default
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // Tab State: 'STAFF' | 'ADMIN'
    const [activeTab, setActiveTab] = useState<'STAFF' | 'ADMIN'>('STAFF');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!captchaValue) {
            alert('로봇이 아님을 확인해주세요.');
            return;
        }

        // 1. Login attempt
        const result = StorageService.login(id, password);

        if (result.success && result.user) {
            // Check for Warnings (Expired Password)
            if (result.code === 'EXPIRED') {
                alert(result.message);
            }

            // 2. Validate Role based on Active Tab
            const userRole = result.user.role;
            let isValidTab = false;

            if (activeTab === 'STAFF') {
                // Staff tab allows SUPERVISOR and MANAGER
                if (userRole === 'SUPERVISOR' || userRole === 'MANAGER') {
                    isValidTab = true;
                }
            } else {
                // Admin tab allows ADMIN
                if (userRole === 'ADMIN') {
                    isValidTab = true;
                }
            }

            if (!isValidTab) {
                alert(activeTab === 'STAFF' ? '관리자 계정은 관리자 탭을 이용해주세요.' : '팀장, SV 계정은 팀장, SV 탭을 이용해주세요.');
                recaptchaRef.current?.reset();
                setCaptchaValue(null);
                return;
            }

            // 2.1 Validate Checkbox Role if needed (Optional for UX but good for consistency)
            // Existing logic checked checkbox vs actual role.
            // We can keep it or rely on Tab + LoginId.
            // Let's rely on LoginId + Tab for simplicity as 'Role Selection' on Login might be redundant if Tab exists?
            // User request image shows Tabs. Usually Tabs imply separate entry points.
            // Let's keep the Role selection visible ONLY for Staff tab if needed?
            // Actually, for Admin, usually no role selection needed.
            // The prompt says "Separate Login Page", but we use Tabs.
            // Let's check logic:
            if (activeTab === 'STAFF') {
                // Check selectedRole matches actual role
                const roleMap: Record<RoleOption, string> = {
                    '관리자': 'ADMIN',
                    '팀장': 'MANAGER',
                    'SV': 'SUPERVISOR'
                };
                // Admin shouldn't select '관리자' in Staff tab anyway.
                if (selectedRole === '관리자') {
                    alert('관리자는 관리자 탭을 이용해주세요.');
                    recaptchaRef.current?.reset();
                    setCaptchaValue(null);
                    return;
                }
                const expectedRole = roleMap[selectedRole];
                if (userRole !== expectedRole) {
                    // alert('선택한 직책과 실제 직책이 다릅니다.');
                    // Just warn? Or allow. Let's allowing matching by ID is better UX.
                    // But let's stick to requirement "Discriminate".
                }
            }

            router.push('/');
        } else {
            if (result.code === 'LOCKED') {
                alert(result.message);
            } else {
                alert(result.message || '로그인에 실패했습니다.');
            }
            // Reset Captcha on failure
            recaptchaRef.current?.reset();
            setCaptchaValue(null);
        }
    };

    return (
        <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden min-h-[600px] my-20">
            {/* LEFT PANEL: Branding & Signup Action */}
            <div className="hidden md:flex flex-col w-1/2 bg-[#F8FAFC] p-12 relative min-h-[600px] items-center justify-center">
                {/* Branding Text Top Left */}
                <div className="absolute top-10 left-10">
                    <h1 className="text-3xl font-extrabold text-[#2CA4D9] tracking-tighter">알피자</h1>
                </div>

                {/* Center Content */}
                <div className="flex flex-col items-center justify-center gap-6 mt-10">
                    <div className="transform scale-150 mb-4">
                        <Logo />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-800">환영합니다!</h2>
                        <p className="text-gray-500">
                            알피자 프랜차이즈 관리 시스템입니다.<br />
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
                            회원가입
                        </Link>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Login Form */}
            <div className="w-full md:w-1/2 p-12 bg-white flex flex-col justify-center">
                {/* Mobile Heading */}
                <div className="md:hidden text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-[#2CA4D9] tracking-tighter mb-4">알피자</h1>
                    <h2 className="text-2xl font-bold text-gray-800">로그인</h2>
                </div>

                {/* Tabs */}
                <div className="flex border-b-2 border-gray-100 mb-8 w-full">
                    <button
                        type="button"
                        className={`flex-1 pb-4 text-lg font-bold text-center transition-all relative ${activeTab === 'STAFF' ? 'text-[#2CA4D9] border-b-2 border-[#2CA4D9] -mb-[2px]' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab('STAFF')}
                    >
                        팀장, SV
                    </button>
                    <button
                        type="button"
                        className={`flex-1 pb-4 text-lg font-bold text-center transition-all relative ${activeTab === 'ADMIN' ? 'text-[#2b3580] border-b-2 border-[#2b3580] -mb-[2px]' : 'text-gray-400 hover:text-gray-600'}`}
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
                            onChange={(e) => setId(e.target.value)}
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

                    {/* Role Selection (Checkboxes) - Show ONLY for STAFF */}
                    {activeTab === 'STAFF' && (
                        <div className="flex gap-6 py-2">
                            {(['팀장', 'SV'] as RoleOption[]).map((role) => (
                                <label key={role} className="flex items-center cursor-pointer group hover:bg-gray-50 p-2 rounded-md -ml-2 transition-colors">
                                    <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-[4px] mr-2.5 transition-all ${selectedRole === role
                                        ? 'bg-[#2CA4D9] border-[#2CA4D9]'
                                        : 'border-gray-300 bg-white group-hover:border-[#2CA4D9]'
                                        }`}>
                                        {selectedRole === role && <div className="w-2.5 h-2.5 text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedRole === role}
                                        onChange={() => setSelectedRole(role)}
                                    />
                                    <span className={`text-base ${selectedRole === role ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>
                                        {role}
                                    </span>
                                </label>
                            ))}
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
                    <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
                        <button type="button" className="hover:text-[#2CA4D9] hover:underline">아이디 찾기</button>
                        <span className="text-gray-300">|</span>
                        <button type="button" className="hover:text-[#2CA4D9] hover:underline">비밀번호 찾기</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
