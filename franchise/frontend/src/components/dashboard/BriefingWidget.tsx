'use client';

import { useState } from 'react';
import { DailyBriefing } from '@/types';
import { CheckCircle2, Circle, AlertTriangle, ChevronRight, FileText, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

interface BriefingWidgetProps {
    data: DailyBriefing;
    userName?: string;
}

export default function BriefingWidget({ data, userName }: BriefingWidgetProps) {
    // Local state for checking items (visual interaction only for mockup)
    const [todos, setTodos] = useState(data.todoList);

    const toggleTodo = (id: string) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">오늘의 할 일</h2>
                <span className="text-sm text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-lg">{data.date}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* 1. Today's To-Do (Left) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 mb-4 pb-2 border-b border-gray-100">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        체크리스트 (Checklist)
                        <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-bold ml-auto">
                            미완료 {todos.filter(t => !t.isCompleted).length}건
                        </span>
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {todos.map(todo => (
                            <div
                                key={todo.id}
                                onClick={() => toggleTodo(todo.id)}
                                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer group hover:shadow-md ${todo.isCompleted ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:border-blue-400'}`}
                            >
                                <button className={`mt-0.5 flex-shrink-0 transition-colors ${todo.isCompleted ? 'text-gray-400' : 'text-gray-300 group-hover:text-blue-600'}`}>
                                    {todo.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                </button>
                                <div className="flex-1">
                                    <p className={`text-base font-bold leading-tight ${todo.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                        {todo.text}
                                    </p>
                                    <div className="flex gap-2 mt-2.5">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${todo.priority === 'HIGH' ? 'border-red-100 text-red-600 bg-red-50' :
                                            todo.priority === 'MEDIUM' ? 'border-orange-100 text-orange-600 bg-orange-50' :
                                                'border-blue-100 text-blue-600 bg-blue-50'
                                            }`}>
                                            {todo.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Summary (Right) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 mb-4 pb-2 border-b border-gray-100">
                        <FileText className="w-5 h-5 text-purple-600" />
                        운영 요약 (Summary)
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex-1 flex flex-col justify-center">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900 mb-1">{userName || '관리자'}님,</p>
                                <p className="text-base text-gray-700 leading-relaxed font-medium">
                                    {data.summary}
                                </p>
                            </div>
                        </div>

                        {/* Mini Metrics */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200/50">
                            <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="text-xs font-bold text-gray-500 mb-1">총 이슈</div>
                                <div className="text-xl font-extrabold text-gray-900">{data.keyMetrics.totalIssues}</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="text-xs font-bold text-gray-500 mb-1">심각</div>
                                <div className="text-xl font-extrabold text-red-600">{data.keyMetrics.criticalIssues}</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="text-xs font-bold text-gray-500 mb-1">승인 대기</div>
                                <div className="text-xl font-extrabold text-blue-600">{data.keyMetrics.pendingApprovals}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
