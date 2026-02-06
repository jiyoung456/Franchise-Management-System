'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Store, MapPin, Calendar, User, FileText, CheckCircle } from 'lucide-react';
import { StoreService } from '@/services/storeService';
import { useRouter } from 'next/navigation';

export default function NewStorePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        regionCode: '서울/경기',
        address: '',
        tradeAreaType: 'OFFICE',
        openedAt: '',
        ownerName: '',
        ownerPhone: '',
        svName: '',
        svTeam: '',
        contractType: 'FRANCHISE',
        contractEndAt: '',
        currentSupervisorId: ''
    });

    const [svs, setSvs] = useState<any[]>([]);

    useEffect(() => {
        const fetchSvs = async () => {
            if (!formData.regionCode) return;
            const data = await StoreService.getSupervisorsByRegion(formData.regionCode);
            setSvs(data);
        };
        fetchSvs();
    }, [formData.regionCode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'currentSupervisorId') {
            const selectedSv = svs.find(sv => sv.loginId === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                svName: selectedSv ? selectedSv.userName : '',
                svTeam: selectedSv ? selectedSv.department : '' // Map department to team
            }));
        } else {
            if (name === 'regionCode') {
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    currentSupervisorId: '', // Reset SV selection on region change
                    svName: '',
                    svTeam: ''
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await StoreService.addStore(formData);
        if (success) {
            alert(`신규 점포가 등록되었습니다.\n(담당 SV: ${formData.svName})`);
            router.push('/stores');
        } else {
            alert('점포 등록에 실패했습니다.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/stores" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">신규 점포 등록</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        새로운 점포를 시스템에 등록합니다.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">

                {/* 1. Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                        <Store className="w-5 h-5 mr-2 text-blue-600" />
                        기본 정보
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">점포명 <span className="text-red-500">*</span></label>
                            <input
                                name="name"
                                required
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="예: 강남역점"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">지역 권역 <span className="text-red-500">*</span></label>
                            <select
                                name="regionCode"
                                value={formData.regionCode}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                            >
                                <option value="서울/경기">서울/경기</option>
                                <option value="부산/경남">부산/경남</option>
                                <option value="대구/울산/경북">대구/울산/경북</option>
                                <option value="강원/충청">강원/충청</option>
                                <option value="전라/광주">전라/광주</option>
                                <option value="제주">제주</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소 <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="address"
                                    required
                                    type="text"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="주소를 입력하세요"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Commercial & Date */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                        <MapPin className="w-5 h-5 mr-2 text-green-600" />
                        상권 및 일정
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">상권 유형 <span className="text-red-500">*</span></label>
                            <select
                                name="tradeAreaType"
                                value={formData.tradeAreaType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                            >
                                <option value="OFFICE">오피스 (OFFICE)</option>
                                <option value="RESIDENTIAL">주거 (RESIDENTIAL)</option>
                                <option value="STATION">역세권/유동 (STATION)</option>
                                <option value="UNIVERSITY">대학가 (UNIVERSITY)</option>
                                <option value="TOURISM">관광/특수 (TOURISM)</option>
                                <option value="MIXED">복합 (MIXED)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">오픈 (예정)일 <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="openedAt"
                                    required
                                    type="date"
                                    value={formData.openedAt}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. People & Contract */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                        <User className="w-5 h-5 mr-2 text-purple-600" />
                        운영 및 계약 정보
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">점주명 (Franchisee) <span className="text-red-500">*</span></label>
                            <input
                                name="ownerName"
                                required
                                type="text"
                                value={formData.ownerName}
                                onChange={handleChange}
                                placeholder="점주 성함"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">점주 연락처 <span className="text-red-500">*</span></label>
                            <input
                                name="ownerPhone"
                                required
                                type="text"
                                value={formData.ownerPhone}
                                onChange={handleChange}
                                placeholder="010-0000-0000"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">담당 슈퍼바이저 (SV) <span className="text-red-500">*</span></label>
                            <select
                                name="currentSupervisorId"
                                required
                                value={formData.currentSupervisorId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                            >
                                <option value="">담당 SV 선택</option>
                                {svs.map(sv => (
                                    <option key={sv.loginId} value={sv.loginId}>{sv.userName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SV 소속팀</label>
                            <input
                                type="text"
                                value={formData.svTeam}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">계약 유형 <span className="text-red-500">*</span></label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="contractType"
                                        value="FRANCHISE"
                                        checked={formData.contractType === 'FRANCHISE'}
                                        onChange={handleChange}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>가맹점</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="contractType"
                                        value="DIRECT"
                                        checked={formData.contractType === 'DIRECT'}
                                        onChange={handleChange}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>직영점</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">계약 만료일</label>
                            <input
                                name="contractEndAt"
                                type="date"
                                value={formData.contractEndAt}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-3">
                    <Link
                        href="/stores"
                        className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                    >
                        취소
                    </Link>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        점포 등록 완료
                    </button>
                </div>

            </form>
        </div>
    );
}
