'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BoardService, BoardPost } from '@/services/boardService';
import { AuthService } from '@/services/authService';
import { User as UserType } from '@/types';
import { Search, Megaphone, Eye, Calendar, Pin } from 'lucide-react';

export default function BoardListPage() {
    const [posts, setPosts] = useState<BoardPost[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                // Fetch posts and current user as high priority
                const [postData, user] = await Promise.all([
                    BoardService.getPosts(),
                    AuthService.getCurrentUser()
                ]);
                setPosts(postData);
                setCurrentUser(user);

                // Fetch all users for name mapping as low priority (may 403)
                try {
                    const userData = await AuthService.getUsers();
                    setUsers(userData);
                } catch (userError) {
                    console.warn('Failed to fetch user list for name mapping (possibly 403):', userError);
                    // Continue without users list
                }
            } catch (error) {
                console.error('Failed to load board data:', error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const filteredPosts = posts.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Backend handles sorting (isPinned first, then date desc), but we can re-verify or sort here too
    const sortedPosts = [...filteredPosts];

    // Helper to get username from ID
    const getAuthorName = (userId: number) => {
        const found = users.find(u => u.id.toString() === userId.toString());
        return found ? found.userName : `사용자(${userId})`;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">게시물을 불러오는 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">공지사항 및 게시판</h1>
                    <p className="text-sm text-gray-500 mt-1">본사 지침 및 주요 공지사항을 확인하세요.</p>
                </div>
                {currentUser?.role === 'ADMIN' && (
                    <Link
                        href="/board/write"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center"
                    >
                        + 글쓰기
                    </Link>
                )}
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="제목 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-[80px] text-center whitespace-nowrap">번호</th>
                            <th className="px-6 py-4 whitespace-nowrap">제목</th>
                            <th className="px-6 py-4 w-[180px] whitespace-nowrap">작성자</th>
                            <th className="px-6 py-4 w-[120px] whitespace-nowrap">작성일</th>
                            <th className="px-6 py-4 w-[100px] text-center whitespace-nowrap">조회</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedPosts.length > 0 ? (
                            sortedPosts.map((post, idx) => (
                                <tr key={post.id} className={`hover:bg-gray-50 transition-colors ${post.isPinned ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        {post.isPinned ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-100 text-red-600">
                                                <Megaphone className="w-3 h-3" />
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">{post.id}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/board/${post.id}`} className="group flex items-center">
                                            {post.isPinned && (
                                                <span className="text-red-600 font-bold mr-2">[중요]</span>
                                            )}
                                            <span className="text-gray-900 group-hover:text-blue-600 group-hover:underline font-medium">
                                                {post.title}
                                            </span>
                                            {/* New Badge Logic (Example: within 3 days) */}
                                            {post.createdAt && new Date().getTime() - new Date(post.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000 && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">
                                                    N
                                                </span>
                                            )}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {getAuthorName(post.createdByUserId)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {post.createdAt ? post.createdAt.split('T')[0] : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500">
                                        {post.viewCount}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-500">
                                    등록된 게시물이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
