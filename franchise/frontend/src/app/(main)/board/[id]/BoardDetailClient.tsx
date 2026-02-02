'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { BoardService, BoardDetail } from '@/services/boardService';
import { AuthService } from '@/services/authService';
import { User as UserType } from '@/types';
import { ArrowLeft, Calendar, User as UserIcon, Eye, Trash2, Edit } from 'lucide-react';

interface Props {
    id: string;
}

export default function BoardDetailClient({ id }: Props) {
    const router = useRouter();
    const [post, setPost] = useState<BoardDetail | null>(null);
    const [authorName, setAuthorName] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const init = async () => {
            try {
                setLoading(true);
                const postId = Number(id);
                if (isNaN(postId)) {
                    notFound();
                    return;
                }

                const [postData, user] = await Promise.all([
                    BoardService.getPost(postId),
                    AuthService.getCurrentUser()
                ]);

                if (!postData) {
                    notFound();
                    return;
                }

                setPost(postData);
                setCurrentUser(user);

                // Set initial author name to ID fallback
                setAuthorName(`사용자(${postData.createdByUserId})`);

                // Attempt to fetch all users for name mapping
                try {
                    const users = await AuthService.getUsers();
                    const foundAuthor = users.find(u => u.id.toString() === postData.createdByUserId.toString());
                    if (foundAuthor) {
                        setAuthorName(foundAuthor.userName);
                    }
                } catch (userError) {
                    console.warn('Failed to fetch user list for name mapping (possibly 403):', userError);
                }
            } catch (error) {
                console.error('Failed to load board detail:', error);
                notFound();
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">게시물을 불러오는 중...</div>;
    if (!post) return null;

    const handleDelete = async () => {
        if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

        const success = await BoardService.deletePost(id);
        if (success) {
            alert('게시글이 삭제되었습니다.');
            router.push('/board');
        } else {
            alert('게시글 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header Nav */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    목록으로
                </button>

                {currentUser?.role === 'ADMIN' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/board/${id}/edit`)}
                            className="flex items-center px-3 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-50 hover:border-blue-300"
                        >
                            <Edit className="w-4 h-4 mr-1.5" />
                            수정
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center px-3 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-50 hover:border-red-300"
                        >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            삭제
                        </button>
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                {/* Title Section */}
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-start gap-3 mb-4">
                        {post.isPinned && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">중요</span>
                        )}
                        <h1 className="text-2xl font-bold text-gray-900 leading-snug">{post.title}</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                {authorName.charAt(0)}
                            </span>
                            <span className="font-medium text-gray-900">{authorName}</span>
                            <span className="text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">작성자</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.createdAt).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            {post.viewCount} 읽음
                        </div>
                    </div>
                </div>

                {/* Main Text */}
                <div className="p-8 text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </div>
            </div>
        </div>
    );
}
