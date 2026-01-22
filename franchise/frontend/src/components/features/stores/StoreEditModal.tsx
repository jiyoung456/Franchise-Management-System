import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { Store } from '@/types';

interface StoreEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: Store;
    onSave: (updatedStore: Store) => void;
}

export function StoreEditModal({ isOpen, onClose, store, onSave }: StoreEditModalProps) {
    const [formData, setFormData] = useState<Store>(store);

    useEffect(() => {
        setFormData(store);
    }, [store]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">점포 정보 수정 (Admin)</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Status Section - requested feature */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-bold text-blue-800 mb-2">운영 상태 설정</label>
                        <select
                            name="operationStatus"
                            value={formData.operationStatus}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-blue-900 font-medium"
                        >
                            <option value="OPEN">운영중</option>
                            <option value="CLOSED_TEMPORARY">휴업</option>
                            <option value="CLOSED">폐업</option>
                            {/* <option value="PRE_OPEN">오픈예정</option> */}
                        </select>
                        <p className="text-xs text-blue-600 mt-2">
                            * 상태 변경 시 관련 데이터(매출 집계 등)에 영향을 줄 수 있습니다.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">점포명</label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">점주명</label>
                                <input
                                    name="ownerName"
                                    type="text"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">담당 SV</label>
                                <input
                                    name="currentSupervisorId"
                                    type="text"
                                    value={formData.currentSupervisorId || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Risk Override - simplified */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">리스크 등급 (수동 조정)</label>
                            <select
                                name="currentState"
                                value={formData.currentState}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                                <option value="NORMAL">NORMAL (정상)</option>
                                <option value="WATCHLIST">WATCHLIST (관찰)</option>
                                <option value="RISK">RISK (위험)</option>
                            </select>
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            저장하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
