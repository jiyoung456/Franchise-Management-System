'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { StorageService, Notice, User } from '@/lib/storage';
import { ArrowLeft, Calendar, User as UserIcon, Eye, Trash2 } from 'lucide-react';

interface Props {
    params: Promise<{ id: string }>;
}

export default function BoardDetailPage({ params }: Props) {
    const { id } = use(params);
    const router = useRouter();
    const [notice, setNotice] = useState<Notice | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const data = StorageService.getNotice(id);
        if (!data) {
            notFound();
            return;
        }
        setNotice(data);
        setCurrentUser(StorageService.getCurrentUser());

        // Increment View Count (Strict React 18 effect double-call might count twice in dev, acceptable for now)
        StorageService.incrementNoticeView(id);
    }, [id]);

    if (!notice) return <div className="p-8 text-center">Loading...</div>;

    const handleDelete = () => {
        if (confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            StorageService.deleteNotice(notice.id);
            alert('삭제되었습니다.');
            router.replace('/board');
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
                        {/* Edit Button could go here */}
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
                        {notice.isImportant && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">중요</span>
                        )}
                        <h1 className="text-2xl font-bold text-gray-900 leading-snug">{notice.title}</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                {notice.author.charAt(0)}
                            </span>
                            <span className="font-medium text-gray-900">{notice.author}</span>
                            <span className="text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">본사 관리자</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(notice.date).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            {notice.viewCount} 읽음
                        </div>
                    </div>
                </div>

                {/* Main Text */}
                <div className="p-8 text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {notice.content}
                </div>
            </div>
        </div>
    );
}
