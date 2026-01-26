'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/services/authService';
import { User } from '@/types';
import { Users, Edit2 } from 'lucide-react';
import { UserEditModal } from '@/components/features/admin/UserEditModal';

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
        // Load current user
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
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
            setSelectedUser(null);
        } else {
            alert(result.message || '저장 실패');
        }
    };

    const handleDeleteUser = (userId: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        const result = AuthService.deleteUser(userId);
        if (result.success) {
            loadUsers();
            setIsEditModalOpen(false);
            setSelectedUser(null);
        } else {
            alert(result.message || '삭제 실패');
        }
    };

    // Helper to check permission
    const canManageUser = (targetUser: User) => {
        if (!currentUser) return false;
        // Allows editing if:
        // 1. It is the current user (Self)
        // 2. The target is NOT an ADMIN (Manager or Supervisor)
        return currentUser.id === targetUser.id || targetUser.role !== 'ADMIN';
    };

    return (
        <div className="flex-1 p-8 bg-gray-50 overflow-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    사용자 관리
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름 / 아이디</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">부서 / 직책</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                                    <div className="text-sm text-gray-500">{user.loginId}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{user.department}</div>
                                    <div className="text-sm text-gray-500">
                                        {user.role === 'ADMIN' ? '관리자' :
                                            user.role === 'MANAGER' ? '팀장' :
                                                user.role === 'SUPERVISOR' ? '슈퍼바이저' : user.role}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                    <div className="text-sm text-gray-500">{user.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${user.accountStatus
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.accountStatus ? '활성' : '비활성'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        disabled={!canManageUser(user)}
                                        className={`p-2 rounded-full transition-colors ${canManageUser(user)
                                            ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                            : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                        title={!canManageUser(user) ? "다른 관리자 계정은 수정할 수 없습니다." : "권한 수정"}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && !isLoading && (
                    <div className="p-12 text-center text-gray-500">
                        등록된 사용자가 없습니다.
                    </div>
                )}
            </div>

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
