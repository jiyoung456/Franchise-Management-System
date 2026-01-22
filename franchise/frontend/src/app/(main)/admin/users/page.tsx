'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/services/authService';
import { User } from '@/types';
import { Users, Search, Filter, Shield, MoreHorizontal, Edit2 } from 'lucide-react';
import { UserEditModal } from '@/components/features/admin/UserEditModal';

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const allUsers = AuthService.getUsers();
        setUsers(allUsers);
        setIsLoading(false);
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = (updatedUser: User) => {
        const result = AuthService.updateUser(updatedUser);
        if (result.success) {
            loadUsers();
            setIsEditModalOpen(false);
            // In a real app, use toast here
            // alert('저장되었습니다.'); 
        } else {
            alert(result.message);
        }
    };

    const handleDeleteUser = (id: string) => {
        const result = AuthService.deleteUser(id);
        if (result.success) {
            loadUsers();
            setIsEditModalOpen(false);
        } else {
            alert(result.message);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* ... (Header & Filter same as before) ... */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">사용자 및 권한 관리</h1>
                    <p className="text-sm text-gray-500 mt-1">시스템 접속 사용자 목록과 권한(Role)을 관리합니다.</p>
                </div>
                <button
                    onClick={() => alert('신규 사용자 등록 기능은 추후 구현 예정입니다.')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
                >
                    + 사용자 추가
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="이름, 이메일 검색..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">전체 권한</option>
                        <option value="ADMIN">관리자 (Admin)</option>
                        <option value="SUPERVISOR">슈퍼바이저 (SV)</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">전체 부서</option>
                        <option value="서울/경기">서울/경기</option>
                        <option value="부산/경남">부산/경남</option>
                    </select>
                </div>
            </div>

            {/* User List Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">사용자 정보</th>
                            <th className="px-6 py-4">부서 / 직급</th>
                            <th className="px-6 py-4">시스템 권한</th>
                            <th className="px-6 py-4">계정 상태</th>
                            <th className="px-6 py-4 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 group transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                            {user.userName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.userName}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-gray-900">{user.department}</p>
                                    <p className="text-xs text-gray-500">
                                        {user.role === 'MANAGER' ? '팀장' : user.role === 'ADMIN' ? '본사 관리자' : '슈퍼바이저'}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'ADMIN'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                        <Shield className="w-3 h-3 mr-1" />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-bold flex items-center gap-1 ${user.accountStatus ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.accountStatus ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        {user.accountStatus ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                        title="권한 수정"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        등록된 사용자가 없습니다.
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {selectedUser && (
                <UserEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={selectedUser}
                    onSave={handleSaveUser}
                    onDelete={handleDeleteUser}
                />
            )}
        </div>
    );
}
