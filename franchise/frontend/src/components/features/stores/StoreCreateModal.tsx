'use client';

import { useState, useEffect } from 'react';
import { X, Save, Store, MapPin, Calendar, User, CheckCircle } from 'lucide-react';
import { StoreService } from '@/services/storeService';
import { AuthService } from '@/services/authService';

interface StoreCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function StoreCreateModal({ isOpen, onClose, onSave }: StoreCreateModalProps) {
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

    // Mock SV data for demo purposes before backend integration
    const MOCK_SVS = [
        { id: 'sv-1', name: '김철수', userName: '김철수 SV', department: '서울/경기' },
        { id: 'sv-2', name: '이영희', userName: '이영희 SV', department: '서울/경기' },
        { id: 'sv-3', name: '박지성', userName: '박지성 SV', department: '부산/경남' },
        { id: 'sv-4', name: '손흥민', userName: '손흥민 SV', department: '대구/경북' },
        { id: 'sv-5', name: '김연아', userName: '김연아 SV', department: '광주/전라' },
        { id: 'sv-6', name: '방탄소년단', userName: 'BTS SV', department: '제주' }
    ];

    useEffect(() => {
        if (isOpen) {
            setSvs(MOCK_SVS);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'currentSupervisorId') {
            const selectedSv = svs.find(sv => sv.id === value);
            setFormData(prev => ({
                ...prev,
                [name]: value, // Store ID
                svName: selectedSv ? selectedSv.name : '', // Store Name for display/legacy
                svTeam: selectedSv ? selectedSv.department : ''
            }));
        } else {
            if (name === 'regionCode') {
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    currentSupervisorId: '',
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

        const newStoreId = Date.now().toString();
        const newStore: any = {
            id: newStoreId,
            ...formData,
            operationStatus: 'OPEN',
            currentState: 'NORMAL',
            currentStateScore: 80,
            qscScore: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            statusHistory: [],
            monthlyRevenue: 0,
            growthRate: 0
        };

        const success = await StoreService.addStore(newStore);
        if (success) {
            alert(`신규 점포가 등록되었습니다.\n(담당 SV: ${formData.svName})`);
            onSave(); // Refresh parent list
            onClose();
        } else {
            alert('점포 등록에 실패했습니다.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">신규 점포 등록</h3>
                        <p className="text-sm text-gray-500 mt-1">새로운 점포 정보를 입력해주세요.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* 1. Basic Info */}
                    <div className="space-y-4">
                        <h4 className="text-base font-bold text-gray-900 flex items-center border-b pb-2">
                            <Store className="w-4 h-4 mr-2 text-blue-600" />
                            기본 정보
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">점포명 <span className="text-red-500">*</span></label>
                                <input
                                    name="name"
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="예: 강남역점"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">지역 권역 <span className="text-red-500">*</span></label>
                                <select
                                    name="regionCode"
                                    value={formData.regionCode}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                >
                                    <option value="서울/경기">서울/경기</option>
                                    <option value="부산/경남">부산/경남</option>
                                    <option value="대구/경북">대구/경북</option>
                                    <option value="강원/충청">강원/충청</option>
                                    <option value="광주/전라">광주/전라</option>
                                    <option value="제주">제주</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소 <span className="text-red-500">*</span></label>
                                <input
                                    name="address"
                                    required
                                    type="text"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="주소를 입력하세요"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Commercial & Date */}
                    <div className="space-y-4">
                        <h4 className="text-base font-bold text-gray-900 flex items-center border-b pb-2">
                            <MapPin className="w-4 h-4 mr-2 text-green-600" />
                            상권 및 일정
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">상권 유형 <span className="text-red-500">*</span></label>
                                <select
                                    name="tradeAreaType"
                                    value={formData.tradeAreaType}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
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
                                <input
                                    name="openedAt"
                                    required
                                    type="date"
                                    value={formData.openedAt}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. People & Contract */}
                    <div className="space-y-4">
                        <h4 className="text-base font-bold text-gray-900 flex items-center border-b pb-2">
                            <User className="w-4 h-4 mr-2 text-purple-600" />
                            운영 및 계약 정보
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">점주명 <span className="text-red-500">*</span></label>
                                <input
                                    name="ownerName"
                                    required
                                    type="text"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">담당 슈퍼바이저 (SV) <span className="text-red-500">*</span></label>
                                <select
                                    name="currentSupervisorId"
                                    required
                                    value={formData.currentSupervisorId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                >
                                    <option value="">담당 SV 선택</option>
                                    {svs
                                        .filter(sv => sv.department === formData.regionCode)
                                        .map(sv => (
                                            <option key={sv.id} value={sv.id}>{sv.userName}</option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SV 소속팀</label>
                                <input
                                    type="text"
                                    value={formData.svTeam}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
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
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 shadow-sm transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            점포 등록 완료
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
