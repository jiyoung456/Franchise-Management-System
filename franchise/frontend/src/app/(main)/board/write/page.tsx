'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StorageService, User, Attachment } from '@/lib/storage';
import { ArrowLeft, Save, AlertTriangle, Paperclip, X } from 'lucide-react';

export default function BoardWritePage() {
    const router = useRouter();
    const currentUser = StorageService.getCurrentUser();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isImportant, setIsImportant] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    // Guard: Only ADMIN
    if (currentUser?.role !== 'ADMIN') {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900">접근 권한이 없습니다.</h2>
                <p className="text-gray-500 mt-2">관리자만 게시글을 작성할 수 있습니다.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-6 px-4 py-2 bg-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300"
                >
                    돌아가기
                </button>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const newAttachment: Attachment = {
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                type: file.type
            };
            setAttachments(prev => [...prev, newAttachment]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const newNotice = {
            id: Date.now().toString(),
            title: title,
            content: content,
            author: currentUser.name,
            date: new Date().toISOString(),
            role: 'ADMIN' as const,
            isImportant: isImportant,
            viewCount: 0,
            attachments: attachments
        };

        StorageService.saveNotice(newNotice);
        alert('게시글이 등록되었습니다.');
        router.push('/board');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">공지사항 작성</h1>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
                    />
                </div>

                {/* Options */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isImportant"
                        checked={isImportant}
                        onChange={(e) => setIsImportant(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isImportant" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                        중요 공지 (상단 고정 및 강조)
                    </label>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력하세요..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[400px] resize-y"
                    />
                </div>

                {/* Attachments */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">첨부파일</label>
                    <div className="flex items-center gap-4 mb-3">
                        <label className="cursor-pointer px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 text-sm font-bold text-gray-600 flex items-center">
                            <Paperclip className="w-4 h-4 mr-2" />
                            파일 선택
                            <input type="file" onChange={handleFileChange} className="hidden" />
                        </label>
                        <span className="text-xs text-gray-500">
                            * 최대 10MB 이하의 파일만 첨부 가능합니다. (Mock System)
                        </span>
                    </div>

                    {attachments.length > 0 && (
                        <div className="space-y-2">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="flex items-center text-sm text-blue-800 font-medium">
                                        <Paperclip className="w-4 h-4 mr-2" />
                                        {file.name}
                                        <span className="ml-2 text-xs text-blue-400">({file.size})</span>
                                    </div>
                                    <button
                                        onClick={() => removeAttachment(idx)}
                                        className="p-1 hover:bg-blue-100 rounded-full text-blue-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50"
                >
                    취소
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center"
                >
                    <Save className="w-4 h-4 mr-2" />
                    등록하기
                </button>
            </div>
        </div>
    );
}
