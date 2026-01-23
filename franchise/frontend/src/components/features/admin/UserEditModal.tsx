'use client';

import { useState, useEffect } from 'react';
import { User, Department } from '@/types';
import { X, Save, Trash2, AlertTriangle, Shield, MapPin, User as UserIcon } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedUser: User) => void;
    onDelete: (id: string) => void;
}

export function UserEditModal({ isOpen, onClose, user, onSave, onDelete }: Props) {
    const [formData, setFormData] = useState<User>(user);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        setFormData(user);
        setIsDeleteConfirmOpen(false); // Reset delete state on open
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleRoleChange = (newRole: 'ADMIN' | 'MANAGER' | 'SUPERVISOR') => {
        setFormData(prev => ({ ...prev, role: newRole }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-900">사용자 정보 수정</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Read-only Info */}
                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-sm">
                            {formData.userName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{formData.userName}</p>
                            <p className="text-sm text-gray-500">{formData.email}</p>
                            {/* Display Login ID as well */}
                            <p className="text-xs text-gray-400 mt-1">ID: {formData.loginId}</p>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <Shield className="w-4 h-4 mr-1 text-gray-500" />
                            시스템 역할
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => handleRoleChange(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="SUPERVISOR">슈퍼바이저 (SV)</option>
                            <option value="MANAGER">팀장 (Manager)</option>
                            <option value="ADMIN">본사 관리자 (Admin)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1 ml-1">
                            * 본사 관리자 선택 시 전체 시스템 접근 권한(ADMIN)이 부여됩니다.
                        </p>
                    </div>

                    {/* Department Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                            담당 조직 (지역)
                        </label>
                        <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="서울/경기">서울/경기</option>
                            <option value="부산/경남">부산/경남</option>
                            <option value="강원/충청">강원/충청</option>
                            <option value="전라/광주">전라/광주</option>
                            <option value="대구/울산/경북">대구/울산/경북</option>
                            <option value="제주">제주</option>
                        </select>
                    </div>

                    {/* Delete Zone */}
                    <div className="pt-6 border-t border-gray-100">
                        {!isDeleteConfirmOpen ? (
                            <button
                                onClick={() => setIsDeleteConfirmOpen(true)}
                                className="text-red-500 text-sm font-bold hover:underline flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                계정 삭제
                            </button>
                        ) : (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-red-800">정말 삭제하시겠습니까?</h4>
                                        <p className="text-xs text-red-600 mt-1">삭제된 계정은 복구할 수 없습니다.</p>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => onDelete(formData.id)}
                                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                                            >
                                                확인 (삭제)
                                            </button>
                                            <button
                                                onClick={() => setIsDeleteConfirmOpen(false)}
                                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded hover:bg-gray-50"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        변경사항 저장
                    </button>
                </div>
            </div>
        </div>
    );
}
